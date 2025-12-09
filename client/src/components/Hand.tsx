import React from 'react';

interface Card {
    value: number;
    name: string;
    description: string;
}

interface HandProps {
    cards: Card[];
    onPlay: (index: number) => void;
    isMyTurn: boolean;
}

export const Hand: React.FC<HandProps> = ({ cards, onPlay, isMyTurn }) => {
    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    onClick={() => isMyTurn && onPlay(index)}
                    className={`
                        w-32 h-48 bg-white text-black border-2 border-gray-400 rounded-lg p-3 cursor-pointer transition-transform hover:-translate-y-4 shadow-xl
                        ${isMyTurn ? 'ring-4 ring-yellow-400' : 'opacity-80'}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-xl">{card.value}</span>
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="mt-8 text-center font-bold text-lg">{card.name}</div>
                    <p className="text-xs mt-2 text-gray-600 text-center">{card.description}</p>
                </div>
            ))}
        </div>
    );
};
