import { useRef, useEffect, useState } from 'react';
import { joinRoom } from './services/colyseus';
import * as Colyseus from "colyseus.js";
import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';
import { Hand } from './components/Hand';
import { TargetModal } from './components/TargetModal';
import { CardRevealModal } from './components/CardRevealModal';
import { HandmaidAnimation } from './components/HandmaidAnimation';
import { GameNotifications, type Notification } from './components/GameNotifications';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { AnimatePresence } from 'framer-motion';

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
    const [isConnecting, setIsConnecting] = useState(false);
    const [players, setPlayers] = useState<any[]>([]);
    const [gameState, setGameState] = useState<any>(null);
    const [mySessionId, setMySessionId] = useState<string>('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // Helper to add notification
    const addNotification = (msg: string) => {
        const id = Date.now().toString() + Math.random();
        setNotifications(prev => [...prev, { id, message: msg }]);
        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };
    
    // Modal State
    const [revealData, setRevealData] = useState<{ targetName: string; card: any } | null>(null);
    const [showHandmaidAnimation, setShowHandmaidAnimation] = useState(false);

    // UI State
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
    const [selectedCardName, setSelectedCardName] = useState<string>('');
    const [needsGuess, setNeedsGuess] = useState(false);

    const roomRef = useRef<Colyseus.Room | null>(null);

    const connectToGame = async () => {
        if (isConnecting || connected) return;
        setIsConnecting(true);
        console.log("=== Starting Connection ===");
        
        try {
            // Get Discord auth (or fallback) - cached so only runs once
            if (!authPromise) {
                authPromise = getDiscordAuth();
            }
            
            // Wait for auth to complete
            const { userName, discordId, avatarUrl, instanceId } = await authPromise;
            
            console.log("Auth complete. Joining room with:", userName, discordId ? "(Discord)" : "(fallback)", "Instance:", instanceId);
            
            const roomInstance = await joinRoom({
                name: userName,
                discordId,
                avatarUrl,
                discordInstanceId: instanceId,
            });

            roomRef.current = roomInstance;

            setMySessionId(roomInstance.sessionId);
            setConnected(true);

            roomInstance.onStateChange((state: any) => {
                setGameState({ ...state });
                const playerList: any[] = [];
                state.players.forEach((p: any) => playerList.push(p));
                setPlayers(playerList);
            });

            roomInstance.onMessage("message", (msg: string) => {
                addNotification(msg);
            });

            roomInstance.onMessage("private_message", (msg: string) => {
                addNotification(`[PRIVATE] ${msg}`);
                // Removed alert in favor of card_reveal event for Priest
            });
            
            roomInstance.onMessage("card_reveal", (data: { targetName: string; card: any }) => {
                console.log("Card reveal received:", data);
                setRevealData(data);
            });
            
            roomInstance.onMessage("handmaid_protection", (data: any) => {
                console.log("Handmaid protection triggered:", data);
                setShowHandmaidAnimation(true);
                setTimeout(() => setShowHandmaidAnimation(false), 2000);
            });

            roomInstance.onMessage("error", (msg: string) => {
                alert(msg);
            });

            // Handle leave
            roomInstance.onLeave((code) => {
                console.log("Left room", code);
                setConnected(false);
                roomRef.current = null;
            });

        } catch (e) {
            console.error("Failed to connect", e);
            alert("Failed to connect: " + e);
        } finally {
            setIsConnecting(false);
        }
    };

    // Initial connection attempt (optional, or we can make it manual only)
    // For now, let's make it manual to show the menu, OR auto-connect if it's the first load
    // But user asked for "Main Menu" to be accessible.
    // Let's keep it manual start for clarity, or auto-start first time?
    // "Exit game button that will take us to the main menu" suggests main menu is a place.
    // Let's trigger auto-connect on mount for convenience, but allow exit.
    // Actually, if we want Main Menu, we should probably start there. 
    // BUT the user said "Exit game button ... to main menu", maybe they want immediate join first?
    // Let's stick to: Start at Main Menu.
    
    // useEffect(() => {
    //     connectToGame();
    //     return () => {
    //         if (roomRef.current) {
    //             roomRef.current.leave();
    //         }
    //     };
    // }, []);
    
    const handleStartGame = (winningScore?: number) => {
        if (roomRef.current) {
            roomRef.current.send("start_game", { winningScore });
        }
    };

    const handleExitGame = () => {
        if (roomRef.current) {
            // Close connection to simulate disconnect/exit
            // In a real app we might leave() but here we want to allow rejoin if it was accidental?
            // User asked for "Exit Game" button to take to Main Menu.
            // If we just close(), the server keeps us alive.
            // If we use .leave(true), it's consented.
            // Let's assume exit means "I'm done".
            // But user also asked for Rejoin.
            // Let's use simple close() to allow rejoin, and set view to null.
            // roomRef.current.connection.close(); // This simulates network drop
            roomRef.current.leave(false); // intentional leave? No, we want rejoin.
            // roomRef.current.connection.close(); 
            // Actually, to support REJOIN, we must arguably just close the socket or leave with consented=false?
            // Colyseus: leave(consented?: boolean)
            // If consented=true, server removes player immediately.
            // If consented=false, server waits for reconnection.
            roomRef.current.leave(false); 
        }
        setConnected(false);
        setMySessionId("");
        setGameState(null);
        setPlayers([]);
        setRevealData(null);
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

    const [showRoundEndModal, setShowRoundEndModal] = useState(false);

    useEffect(() => {
        if (gameState?.gamePhase === 'round_end') {
            setShowRoundEndModal(true);
        } else {
            setShowRoundEndModal(false);
        }
    }, [gameState?.gamePhase]);

    if (!connected) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-white bg-gray-900">
                <h1 className="text-5xl font-bold mb-8 text-green-500">Love Letter</h1>
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center space-y-6">
                    <p className="text-gray-300 text-center max-w-md">
                        Welcome to Love Letter! Join the game to play with others in this channel.
                    </p>
                    <button 
                        onClick={connectToGame}
                        disabled={isConnecting}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xl transition-all flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isConnecting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting...
                            </>
                        ) : "Play / Rejoin Game"}
                    </button>
                    {!isConnecting && (
                         <div className="text-xs text-gray-500 mt-4">
                             Instance: {window.location.search.includes('instance_id') ? 'Discord Activity' : 'Global Browser'}
                         </div>
                    )}
                </div>
            </div>
        );
    }

    if (!gameState) return null; // Should not happen if connected

    // Waiting Room / Lobby
    if (gameState.gamePhase === "waiting") {
        return (
            <Lobby 
                players={players} 
                onStart={handleStartGame}
                isHost={gameState.hostId === mySessionId}
                onExit={handleExitGame}
            />
        );
    }

    const myPlayer = players.find(p => p.id === mySessionId);

    // Countess Check Logic
    const disabledIndices: number[] = [];
    if (myPlayer && myPlayer.hand && gameState.currentTurn === mySessionId) {
        const hand = myPlayer.hand;
        const hasCountess = hand.some((c: any) => c.value === 7);
        const hasRoyal = hand.some((c: any) => c.value === 5 || c.value === 6);

        if (hasCountess && hasRoyal) {
            // Must play Countess (7). So disable anything that is 5 or 6.
            hand.forEach((c: any, index: number) => {
                if (c.value === 5 || c.value === 6) {
                    disabledIndices.push(index);
                }
            });
        }
    }

    return (
        <div className="h-screen bg-green-900 text-white flex flex-col overflow-hidden">
            <GameTable
                players={players}
                currentPlayerId={mySessionId}
                activePlayerId={gameState.currentTurn}
                deckCount={gameState.deck.length}
                discardPile={gameState.discardPile}
                onExit={handleExitGame}
            />

            {myPlayer && !myPlayer.isEliminated && (
                <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-10">
                    {/* Profile & Score Display - Bottom Left */}
                    <div className="absolute bottom-8 left-8 flex items-center bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
                        {/* Avatar */}
                         {myPlayer.avatarUrl ? (
                            <img 
                                src={myPlayer.avatarUrl} 
                                alt={myPlayer.name}
                                className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-sm mr-3 object-cover" 
                            />
                        ) : (
                             <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold border-2 border-white mr-3 shadow-sm">
                                {myPlayer.name[0]}
                             </div>
                        )}
                        
                        <div className="flex flex-col">
                             <div className="text-white font-bold text-lg truncate max-w-[12rem] leading-tight" title={myPlayer.name}>
                                {myPlayer.name}
                             </div>
                             <div className="text-yellow-400 font-bold text-sm">
                                Score: {myPlayer.score} / {gameState.winningScore || 3}
                             </div>
                        </div>
                    </div>

                    <Hand
                        cards={myPlayer.hand}
                        onPlay={handlePlayCardClick}
                        isMyTurn={gameState.currentTurn === mySessionId}
                        disabledIndices={disabledIndices}
                        onIllegalMove={addNotification}
                    />
                </div>
            )}

            {showRoundEndModal && (
                <div className="absolute inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white text-black p-8 rounded-lg text-center shadow-2xl border border-white/20">
                        <h2 className="text-3xl font-bold mb-4">Round Over!</h2>
                        <p className="text-xl mb-6">Winner: {players.find(p => p.id === gameState.winner)?.name}</p>
                        <p className="text-gray-600 mb-6 font-bold text-lg">
                            {gameState.winner === mySessionId ? "You won this round!" : "Better luck next time!"}
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-blue-600 font-semibold animate-pulse">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Starting next round...</span>
                        </div>
                    </div>
                </div>
            )}

            {gameState.gamePhase === 'game_over' && (
                <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-10 rounded-xl text-center shadow-2xl border-4 border-yellow-200 transform scale-110">
                        <h1 className="text-5xl font-extrabold mb-2 drop-shadow-md">GAME OVER!</h1>
                        <div className="text-8xl mb-4">👑</div>
                        <h2 className="text-3xl font-bold mb-6 drop-shadow-sm">
                            {players.find(p => p.id === gameState.winner)?.name} Wins!
                        </h2>
                        <p className="text-xl mb-8 font-medium">The match has concluded.</p>
                        <button 
                            onClick={() => {
                                if (roomRef.current) {
                                    roomRef.current.send("reset_game");
                                }
                            }}
                            className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-xl hover:bg-gray-100 hover:scale-105 transition-transform shadow-lg"
                        >
                            Return to Lobby
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

            <AnimatePresence>
                {revealData && (
                    <CardRevealModal 
                        targetName={revealData.targetName}
                        card={revealData.card}
                        onClose={() => setRevealData(null)}
                    />
                )}
            </AnimatePresence>

            {/* Handmaid Protection Animation */}
            <AnimatePresence>
                {showHandmaidAnimation && <HandmaidAnimation />}
            </AnimatePresence>
            {/* Handmaid Protection Animation */}
            <AnimatePresence>
                {showHandmaidAnimation && <HandmaidAnimation />}
            </AnimatePresence>

            {/* Game Notifications (Toasts) */}
            <GameNotifications notifications={notifications} />
        </div>
    );
}

export default App;
