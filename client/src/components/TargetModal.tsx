import React, { useState } from 'react';

interface Player {
    id: string;
    name: string;
    avatarUrl?: string;
    isEliminated: boolean;
    isProtected: boolean;
}

interface TargetModalProps {
    players: Player[];
    currentPlayerId: string; // New prop to identify self
    cardName: string;
    onSelect: (targetId: string, guessValue?: number) => void;
    onCancel: () => void;
    needsGuess: boolean; // For Guard
}

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
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white text-black p-6 rounded-lg w-96 shadow-2xl border border-white/20">
                <h3 className="text-xl font-bold mb-4">Play {cardName}</h3>

                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Select Target:</label>
                    <select
                        className="w-full border p-2 rounded"
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
                    <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
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
