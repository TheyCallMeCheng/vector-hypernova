import { useRef, useEffect, useState } from 'react';
import { joinRoom } from './services/colyseus';
import * as Colyseus from "colyseus.js";
import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';
import { Hand } from './components/Hand';
import { TargetModal } from './components/TargetModal';
import { DiscordSDK } from '@discord/embedded-app-sdk';

// Discord SDK instance
let discordSdk: DiscordSDK | null = null;
let isDiscordEnvironment = false;

console.log("=== Discord SDK Init ===");
console.log("URL search params:", window.location.search);
console.log("Has frame_id:", window.location.search.includes("frame_id"));
console.log("VITE_DISCORD_CLIENT_ID:", import.meta.env.VITE_DISCORD_CLIENT_ID || "NOT SET!");

try {
    if (window.location.search.includes("frame_id")) {
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
        if (!clientId) {
            console.error("VITE_DISCORD_CLIENT_ID is not set in .env!");
        }
        discordSdk = new DiscordSDK(clientId || "mock_id");
        isDiscordEnvironment = true;
        console.log("Discord SDK Initialized successfully!", discordSdk);
    } else {
        console.log("Not in Discord environment (no frame_id in URL)");
    }
} catch (e) {
    console.error("Discord SDK initialization FAILED:", e);
}

interface DiscordUser {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    global_name: string | null;
}

// Track auth promise to prevent duplicate auth flows (React Strict Mode)
let authPromise: Promise<{ userName: string; discordId: string; avatarUrl: string; instanceId: string }> | null = null;

async function getDiscordAuth(): Promise<{ userName: string; discordId: string; avatarUrl: string; instanceId: string }> {
    // Default fallback values
    let userName = "Player " + Math.floor(Math.random() * 1000);
    let discordId = "";
    let avatarUrl = "";
    let instanceId = "";
    
    // Check if we have instance_id in URL params (even if not in full Discord env yet)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("instance_id")) {
        instanceId = urlParams.get("instance_id") || "";
    }
    
    if (!isDiscordEnvironment || !discordSdk) {
        console.log("Not in Discord, using fallback name:", userName);
        return { userName, discordId, avatarUrl, instanceId };
    }
    
    try {
        await discordSdk.ready();
        
        // If we are in Discord SDK, we can also get instanceId from there if needed, 
        // but it's usually passed in URL query params which we already checked.
        if (!instanceId && discordSdk.instanceId) {
            instanceId = discordSdk.instanceId;
        }
        
        const authResult = await discordSdk.commands.authorize({
            client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
            response_type: 'code',
            scope: ['identify'],
        });
        const { code } = authResult;
        
        // Use the current origin as the redirect_uri
        const pUri = window.location.origin;

        const tokenResponse = await fetch('/api/discord/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code,
                redirect_uri: pUri
            }),
        });
        
        if (!tokenResponse.ok) {
            console.error("Token exchange failed:", tokenResponse.status);
            return { userName, discordId, avatarUrl, instanceId };
        }
        
        const tokenData = await tokenResponse.json();
        
        const auth = await discordSdk.commands.authenticate({
            access_token: tokenData.access_token,
        });
        
        if (auth.user) {
            const user = auth.user as DiscordUser;
            discordId = user.id;
            userName = user.global_name || user.username;
            
            if (user.avatar) {
                avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            } else {
                const defaultAvatarIndex = Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));
                avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
            }
            console.log("Authenticated as Discord user:", userName);
        }
    } catch (e) {
        console.error("Discord auth failed:", e);
    }
    
    return { userName, discordId, avatarUrl, instanceId };
}

function App() {
    const [connected, setConnected] = useState(false);
    const [players, setPlayers] = useState<any[]>([]);
    const [gameState, setGameState] = useState<any>(null);
    const [mySessionId, setMySessionId] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    // UI State
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
    const [selectedCardName, setSelectedCardName] = useState<string>('');
    const [needsGuess, setNeedsGuess] = useState(false);

    const roomRef = useRef<Colyseus.Room | null>(null);

    useEffect(() => {
        let isActive = true;
        let didJoin = false; // Track if this effect already joined

        const init = async () => {
            console.log("=== Starting Init ===");
            
            // Get Discord auth (or fallback) - cached so only runs once
            if (!authPromise) {
                authPromise = getDiscordAuth();
            }
            
            // Wait for auth to complete
            const { userName, discordId, avatarUrl, instanceId } = await authPromise;
            
            console.log("Auth complete. Joining room with:", userName, discordId ? "(Discord)" : "(fallback)", "Instance:", instanceId);
            
            // Don't join if component unmounted or already joined
            if (!isActive || didJoin) {
                console.log("Skipping room join - inactive or already joined");
                return;
            }
            
            didJoin = true;

            try {
                const roomInstance = await joinRoom({
                    name: userName,
                    discordId,
                    avatarUrl,
                    discordInstanceId: instanceId,
                });

                if (!isActive) {
                    await roomInstance.leave();
                    return;
                }

                roomRef.current = roomInstance;

                setMySessionId(roomInstance.sessionId);
                setConnected(true);

                roomInstance.onStateChange((state: any) => {
                    if (!isActive) return;
                    setGameState({ ...state });
                    const playerList: any[] = [];
                    state.players.forEach((p: any) => playerList.push(p));
                    setPlayers(playerList);
                });

                roomInstance.onMessage("message", (msg: string) => {
                    if (!isActive) return;
                    setLogs(prev => [...prev, msg]);
                });

                roomInstance.onMessage("private_message", (msg: string) => {
                    if (!isActive) return;
                    setLogs(prev => [...prev, `[PRIVATE] ${msg}`]);
                });

                roomInstance.onMessage("error", (msg: string) => {
                    if (!isActive) return;
                    alert(msg);
                });

            } catch (e) {
                if (!isActive) return;
                console.error("Failed to connect", e);
            }
        };

        init();

        return () => {
            isActive = false;
            // Leave the room if it exists in the ref
            if (roomRef.current) {
                roomRef.current.leave();
                roomRef.current = null;
            }
            setConnected(false);
        };
    }, []);

    const handleStartGame = () => {
        roomRef.current?.send("start_game");
    };

    const handlePlayCardClick = (index: number) => {
        if (!gameState || gameState.currentTurn !== mySessionId) return;

        const myPlayer = players.find(p => p.id === mySessionId);
        const card = myPlayer.hand[index];

        // Cards requiring target: Guard(1), Priest(2), Baron(3), Prince(5), King(6)
        const needsTarget = [1, 2, 3, 5, 6].includes(card.value);

        if (needsTarget) {
            setSelectedCardIndex(index);
            setSelectedCardName(card.name);
            setNeedsGuess(card.value === 1); // Only Guard needs guess
            setShowTargetModal(true);
        } else {
            // Play immediately (Handmaid, Countess, Princess)
            roomRef.current?.send("play_card", { cardIndex: index });
        }
    };

    const handleTargetSelect = (targetId: string, guessValue?: number) => {
        roomRef.current?.send("play_card", {
            cardIndex: selectedCardIndex,
            targetId,
            guessValue
        });
        setShowTargetModal(false);
    };

    if (!connected) {
        return <div className="flex items-center justify-center h-screen text-white bg-gray-900">Connecting...</div>;
    }

    // Determine view
    const isGameActive = gameState?.gamePhase === 'playing' || gameState?.gamePhase === 'round_end';

    if (!isGameActive) {
        return <Lobby players={players} onStart={handleStartGame} isHost={gameState?.hostId === mySessionId} />;
    }

    const myPlayer = players.find(p => p.id === mySessionId);

    return (
        <div className="h-screen bg-green-900 text-white flex flex-col overflow-hidden">
            <GameTable
                players={players}
                currentPlayerId={mySessionId}
                activePlayerId={gameState.currentTurn}
                deckCount={gameState.deck.length}
                discardPile={gameState.discardPile}
                logs={logs}
            />

            {myPlayer && !myPlayer.isEliminated && (
                <Hand
                    cards={myPlayer.hand}
                    onPlay={handlePlayCardClick}
                    isMyTurn={gameState.currentTurn === mySessionId}
                />
            )}

            {gameState.gamePhase === 'round_end' && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white text-black p-8 rounded-lg text-center">
                        <h2 className="text-3xl font-bold mb-4">Round Over!</h2>
                        <p className="text-xl mb-6">Winner: {players.find(p => p.id === gameState.winner)?.name}</p>
                        <button onClick={handleStartGame} className="px-6 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {showTargetModal && (
                <TargetModal
                    players={players}
                    currentPlayerId={mySessionId}
                    cardName={selectedCardName}
                    onSelect={handleTargetSelect}
                    onCancel={() => setShowTargetModal(false)}
                    needsGuess={needsGuess}
                />
            )}
        </div>
    );
}

export default App;
