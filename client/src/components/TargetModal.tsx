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
    // Filter: Not eliminated, Not myself
    const validTargets = players.filter(p => !p.isEliminated && p.id !== currentPlayerId);
    
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

                <div className="mb-6 max-w-sm mx-auto">
                    <label className="block text-sm font-bold mb-2">Select Target:</label>
                    <select
                        className="w-full border p-2 rounded text-lg"
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.target.value)}
                    >
                        {validTargets.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} {p.isProtected ? '(Protected)' : ''}
                            </option>
                        ))}
                    </select>
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
                                        className="w-24 h-36 border text-xs p-1" // Override for mini card
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
