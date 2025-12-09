import React, { useState } from 'react';

interface Player {
    id: string;
    name: string;
    isEliminated: boolean;
    isProtected: boolean;
}

interface TargetModalProps {
    players: Player[];
    cardName: string;
    onSelect: (targetId: string, guessValue?: number) => void;
    onCancel: () => void;
    needsGuess: boolean; // For Guard
}

export const TargetModal: React.FC<TargetModalProps> = ({ players, cardName, onSelect, onCancel, needsGuess }) => {
    const [selectedTarget, setSelectedTarget] = useState<string>('');
    const [guessValue, setGuessValue] = useState<number>(2); // Default to Priest (2)

    const validTargets = players.filter(p => !p.isEliminated && !p.isProtected);

    const handleSubmit = () => {
        if (selectedTarget) {
            onSelect(selectedTarget, needsGuess ? guessValue : undefined);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-black p-6 rounded-lg w-96">
                <h3 className="text-xl font-bold mb-4">Play {cardName}</h3>

                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Select Target:</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.target.value)}
                    >
                        <option value="">-- Select Player --</option>
                        {validTargets.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {needsGuess && (
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">Guess Card:</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={guessValue}
                            onChange={(e) => setGuessValue(Number(e.target.value))}
                        >
                            <option value={2}>Priest (2)</option>
                            <option value={3}>Baron (3)</option>
                            <option value={4}>Handmaid (4)</option>
                            <option value={5}>Prince (5)</option>
                            <option value={6}>King (6)</option>
                            <option value={7}>Countess (7)</option>
                            <option value={8}>Princess (8)</option>
                        </select>
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedTarget}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
