import React from 'react';
import { Card } from './Card';
import backCard from '../assets/img/back.png';

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
    onExit: () => void;
    onOpenDiscard: () => void;
}

export const GameTable: React.FC<GameTableProps> = ({ players, currentPlayerId, activePlayerId, deckCount, discardPile, onExit, onOpenDiscard }) => {
    // Filter out myself to show others around the table
    const otherPlayers = players.filter(p => p.id !== currentPlayerId);

    return (
        <div className="flex-1 flex flex-col relative">
            {/* Exit Button */}
            <button
                onClick={onExit}
                className="absolute top-4 left-4 z-10 bg-black/40 hover:bg-red-900/60 text-red-100 border border-red-500/30 hover:border-red-400 backdrop-blur-sm px-6 py-2 rounded-lg shadow-lg font-bold text-sm transition-all tracking-wider uppercase"
            >
                Exit Game
            </button>
            {/* Opponents Area */}
            <div className="absolute top-0 w-full flex justify-center space-x-8 pt-8">
                {otherPlayers.map(p => (
                    <div key={p.id} className={`flex flex-col items-center p-4 rounded-xl backdrop-blur-md shadow-lg transition-all ${activePlayerId === p.id ? 'bg-yellow-900/50 border-2 border-yellow-500' : 'bg-black/50 border border-white/10'}`}>
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
                            <div className="font-bold flex items-center justify-center gap-1">
                                {p.name}
                                {p.isProtected && <span title="Protected by Handmaid">🛡️</span>}
                            </div>
                            <div className="text-xs text-gray-400">Score: {p.score}</div>
                            {/* Removed text based protection indicator */}
                            {p.isEliminated && <div className="text-xs text-red-500">ELIMINATED</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Center Area: Deck & Discard */}
            <div className="flex-1 flex items-center justify-center space-x-12 pb-40">
                {/* Deck */}
                {/* Deck */}
                {/* Deck Group */}
                <div className="flex flex-row items-center gap-4">
                    <div className="flex flex-col items-end text-right">
                        <span className="text-white/50 text-xs font-bold tracking-widest uppercase">Deck</span>
                        <span className="text-white text-xl font-bold">{deckCount} Left</span>
                    </div>
                    <div className="relative w-32 h-48 rounded-lg shadow-xl transform transition-transform group hover:scale-105">
                        <img
                            src={backCard}
                            alt="Deck"
                            className="w-full h-full object-cover rounded-lg border-2 border-white/20"
                        />
                    </div>
                </div>

                {/* Discard Group */}
                <div className="flex flex-row items-center gap-4">
                    <div
                        className="relative w-32 h-48 cursor-pointer hover:scale-105 transition-transform"
                        onClick={onOpenDiscard}
                        title="Click to view all discarded cards"
                    >
                        {discardPile.slice(-5).map((card, i) => (
                            <div
                                key={i}
                                className="absolute inset-0 shadow-md rounded-lg"
                                style={{ transform: `rotate(${i * 5}deg) translate(${i * 2}px, ${i * 2}px)`, zIndex: i }}
                            >
                                <Card
                                    value={card.value}
                                    name={card.name}
                                    description={card.description}
                                    variant="mini"
                                    hoverable={false}
                                    disabled={false} // Ensure it shows color
                                    className="w-32 h-48"
                                />
                            </div>
                        ))}
                        {discardPile.length === 0 && (
                            <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 bg-black/20">
                                Discard
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white/50 text-xs font-bold tracking-widest uppercase">Discard</span>
                        <span className="text-white text-xl font-bold">{discardPile.length} Cards</span>
                    </div>
                </div>
            </div>

            {/* Game Log Removed in favor of Notifications */}
        </div>
    );
};
