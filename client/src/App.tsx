import React, { useEffect, useState } from 'react';
import { joinRoom, room } from './services/colyseus';
import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';
import { Hand } from './components/Hand';
import { TargetModal } from './components/TargetModal';
import { DiscordSDK } from '@discord/embedded-app-sdk';

// Mock Discord SDK for localhost
let discordSdk: DiscordSDK | null = null;

try {
    if (window.location.search.includes("frame_id")) {
        discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID || "mock_id");
    }
} catch (e) {
    console.warn("Discord SDK not initialized (running locally?)", e);
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

    useEffect(() => {
        let isActive = true;

        const init = async () => {
            // Mock auth or real auth
            let userName = "Player " + Math.floor(Math.random() * 1000);

            try {
                const roomInstance = await joinRoom(userName);

                if (!isActive) {
                    await roomInstance.leave();
                    return;
                }

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
            if (room) {
                room.leave();
                // We shouldn't setConnected(false) here if we want to allow re-mounting logic, 
                // but for Strict Mode double-mount, we want the first one to DIE.
                setConnected(false);
            }
        };
    }, []);

    const handleStartGame = () => {
        room?.send("start_game");
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
            room?.send("play_card", { cardIndex: index });
        }
    };

    const handleTargetSelect = (targetId: string, guessValue?: number) => {
        room?.send("play_card", {
            cardIndex: selectedCardIndex,
            targetId,
            guessValue
        });
        setShowTargetModal(false);
    };

    if (!connected) {
        return <div className="flex items-center justify-center h-screen text-white">Connecting...</div>;
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
