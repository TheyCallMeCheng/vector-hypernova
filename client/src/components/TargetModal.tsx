import React, { useState } from 'react';
import { Card } from './Card'; // Import Card component

interface Player {
    id: string;
    name: string;
    avatarUrl?: string;
    isEliminated: boolean;
    isProtected: boolean;
}

interface TargetModalProps {
    players: Player[];
    currentPlayerId: string;
    cardName: string;
    onSelect: (targetId: string, guessValue?: number) => void;
    onCancel: () => void;
    needsGuess: boolean;
}

const GUESSABLE_CARDS = [
    { value: 2, name: 'Priest', desc: 'Look at a hand' },
    { value: 3, name: 'Baron', desc: 'Compare hands' },
    { value: 4, name: 'Handmaid', desc: 'Protection' },
    { value: 5, name: 'Prince', desc: 'Discard hand' },
    { value: 6, name: 'King', desc: 'Trade hands' },
    { value: 7, name: 'Countess', desc: 'Discard if Royal' },
    { value: 8, name: 'Princess', desc: 'Lose if discarded' },
];

export const TargetModal: React.FC<TargetModalProps> = ({ players, currentPlayerId, cardName, onSelect, onCancel, needsGuess }) => {
    // Filter: Not eliminated. Allow self only for Prince (who can target anyone including self).
    const validTargets = players.filter(p =>
        !p.isEliminated && (cardName === 'Prince' || p.id !== currentPlayerId)
    );

    // Auto-select the first valid target
    const [selectedTarget, setSelectedTarget] = useState<string>(validTargets.length > 0 ? validTargets[0].id : '');
    const [guessValue, setGuessValue] = useState<number>(2); // Default to Priest (2)

    const handleSubmit = () => {
        if (selectedTarget) {
            onSelect(selectedTarget, needsGuess ? guessValue : undefined);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-10">
            <div className={`bg-white text-black p-6 rounded-lg shadow-2xl border border-white/20 transition-all ${needsGuess ? 'max-w-4xl w-full' : 'w-96'}`}>
                <h3 className="text-2xl font-bold mb-6 text-center">Play {cardName}</h3>

                <div className="mb-6 max-w-2xl mx-auto">
                    <label className="block text-sm font-bold mb-4 text-center">Select Target:</label>
                    <div className="grid grid-cols-2 gap-4">
                        {validTargets.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedTarget(p.id)}
                                className={`flex items-center p-3 rounded-xl border-2 transition-all ${selectedTarget === p.id
                                        ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                            >
                                {p.avatarUrl ? (
                                    <img
                                        src={p.avatarUrl}
                                        alt={p.name}
                                        className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3 border border-gray-300 flex-shrink-0">
                                        {p.name[0]}
                                    </div>
                                )}
                                <div className="text-left">
                                    <div className="font-bold text-sm truncate max-w-[120px]">{p.name}</div>
                                    {p.isProtected && (
                                        <div className="text-xs text-yellow-600 font-semibold flex items-center">
                                            <span>🛡️ Protected</span>
                                        </div>
                                    )}
                                </div>
                                {selectedTarget === p.id && (
                                    <div className="ml-auto text-blue-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {needsGuess && (
                    <div className="mb-8">
                        <label className="block text-sm font-bold mb-4 text-center">Guess their card:</label>
                        <div className="flex flex-wrap justify-center gap-2">
                            {GUESSABLE_CARDS.map((card) => (
                                <div key={card.value} className="relative">
                                    <Card
                                        value={card.value}
                                        name={card.name}
                                        description={card.desc}
                                        active={guessValue === card.value}
                                        onClick={() => setGuessValue(card.value)}
                                        variant="mini"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-center space-x-4 mt-4">
                    <button onClick={onCancel} className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedTarget}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:bg-gray-400 shadow-lg transform transition hover:scale-105"
                    >
                        Confirm Move
                    </button>
                </div>
            </div>
        </div>
    );
};
