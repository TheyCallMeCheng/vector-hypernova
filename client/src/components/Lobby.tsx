import React from 'react';

interface LobbyProps {
    players: any[];
    onStart: (winningScore?: number) => void;
    isHost: boolean;
    onExit: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ players, onStart, isHost, onExit }) => {
    const [winningScore, setWinningScore] = React.useState(3);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-8">Love Letter Lobby</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl mb-4">Players ({players.length}/4)</h2>
                <ul className="space-y-2 mb-6">
                    {players.map((p, i) => (
                        <li key={i} className="flex items-center space-x-2">
                            {p.avatarUrl ? (
                                <img 
                                    src={p.avatarUrl} 
                                    alt={p.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    {p.name[0]}
                                </div>
                            )}
                            <span>{p.name}</span>
                        </li>
                    ))}
                </ul>
                
                {isHost && (
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-300">Target Score to Win:</label>
                        <select
                            value={winningScore}
                            onChange={(e) => setWinningScore(Number(e.target.value))}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <option key={n} value={n}>{n} Points</option>
                            ))}
                        </select>
                    </div>
                )}

                {isHost ? (
                    <button
                        onClick={() => onStart(winningScore)}
                        disabled={players.length < 2}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2 rounded font-bold transition-all"
                    >
                        Start Game
                    </button>
                ) : (
                    <p className="text-center text-gray-400">Waiting for host to start...</p>
                )}
            </div>
            
            <button 
                onClick={onExit}
                className="mt-8 text-gray-400 hover:text-white underline"
            >
                Exit to Main Menu
            </button>
        </div>
    );
};
