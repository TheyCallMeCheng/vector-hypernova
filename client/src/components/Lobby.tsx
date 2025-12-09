import React from 'react';

interface LobbyProps {
    players: any[];
    onStart: () => void;
    isHost: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({ players, onStart, isHost }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-8">Love Letter Lobby</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl mb-4">Players ({players.length}/4)</h2>
                <ul className="space-y-2 mb-6">
                    {players.map((p, i) => (
                        <li key={i} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                {p.name[0]}
                            </div>
                            <span>{p.name}</span>
                        </li>
                    ))}
                </ul>
                {isHost ? (
                    <button
                        onClick={onStart}
                        disabled={players.length < 2}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2 rounded font-bold"
                    >
                        Start Game
                    </button>
                ) : (
                    <p className="text-center text-gray-400">Waiting for host to start...</p>
                )}
            </div>
        </div>
    );
};
