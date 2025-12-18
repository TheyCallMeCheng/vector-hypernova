import React from 'react';
import { motion } from 'framer-motion';

interface CardRevealModalProps {
    targetName: string;
    card: {
        name: string;
        value: number;
        desc: string;
    };
    onClose: () => void;
}

export const CardRevealModal: React.FC<CardRevealModalProps> = ({ targetName, card, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-80"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div 
                initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="relative bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border-2 border-yellow-500"
            >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    <span className="text-yellow-400">{targetName}</span> shows you:
                </h2>

                {/* Card Visual */}
                <div className="w-48 h-72 bg-amber-100 rounded-lg border-4 border-amber-800 flex flex-col items-center justify-between p-4 mb-8 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-2 left-2 text-xl font-bold text-amber-900">{card.value}</div>
                    
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-2xl font-serif text-amber-900 font-bold mb-2">{card.name}</h3>
                            <p className="text-xs text-amber-800 px-2 italic">{card.desc}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-2 right-2 text-xl font-bold text-amber-900 rotate-180">{card.value}</div>
                </div>

                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg shadow transition-colors"
                >
                    Acknowledge
                </button>
            </motion.div>
        </div>
    );
};
