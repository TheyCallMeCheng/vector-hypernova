import React from 'react';

interface Player {
    id: string;
    name: string;
    avatarUrl?: string;
    isEliminated: boolean;
    isProtected: boolean;
    score: number;
    handCount: number; // We don't see their cards, just count
}

interface GameTableProps {
    players: Player[];
    currentPlayerId: string; // My ID
    activePlayerId: string; // Whose turn is it
    deckCount: number;
    discardPile: any[];
    logs: string[];
}

export const GameTable: React.FC<GameTableProps> = ({ players, currentPlayerId, activePlayerId, deckCount, discardPile, logs }) => {
    // Filter out myself to show others around the table
    const otherPlayers = players.filter(p => p.id !== currentPlayerId);

    return (
        <div className="flex-1 flex flex-col relative">
            {/* Opponents Area */}
            <div className="flex justify-center space-x-8 pt-8">
                {otherPlayers.map(p => (
                    <div key={p.id} className={`flex flex-col items-center p-4 rounded-lg ${activePlayerId === p.id ? 'bg-yellow-900 bg-opacity-50 border-2 border-yellow-500' : ''}`}>
                        {p.avatarUrl ? (
                            <img 
                                src={p.avatarUrl} 
                                alt={p.name}
                                className={`w-16 h-16 rounded-full mb-2 object-cover ${p.isEliminated ? 'opacity-50 grayscale' : ''}`}
                            />
                        ) : (
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2 ${p.isEliminated ? 'bg-gray-600' : 'bg-blue-500'}`}>
                                {p.name[0]}
                            </div>
                        )}
                        <div className="text-center">
                            <div className="font-bold">{p.name}</div>
                            <div className="text-xs text-gray-400">Score: {p.score}</div>
                            {p.isProtected && <div className="text-xs text-green-400">PROTECTED</div>}
                            {p.isEliminated && <div className="text-xs text-red-500">ELIMINATED</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Center Area: Deck & Discard */}
            <div className="flex-1 flex items-center justify-center space-x-12">
                {/* Deck */}
                <div className="w-24 h-36 bg-blue-900 border-2 border-white rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold">{deckCount}</span>
                </div>

                {/* Discard Pile */}
                <div className="relative w-24 h-36">
                    {discardPile.slice(-5).map((card, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 bg-white text-black border border-gray-400 rounded-lg p-2 shadow"
                            style={{ transform: `rotate(${i * 5}deg) translate(${i * 2}px, ${i * 2}px)` }}
                        >
                            <div className="font-bold">{card.value}</div>
                            <div className="text-xs text-center mt-4">{card.name}</div>
                        </div>
                    ))}
                    {discardPile.length === 0 && <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500">Discard</div>}
                </div>
            </div>

            {/* Game Log */}
            <div className="absolute top-4 right-4 w-64 h-64 bg-black bg-opacity-50 rounded p-2 overflow-y-auto text-xs font-mono">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-gray-700 pb-1">{log}</div>
                ))}
            </div>
        </div>
    );
};
