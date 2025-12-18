import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

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
                className="absolute inset-0 backdrop-blur-md bg-black/40"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div 
                initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="relative flex flex-col items-center max-w-sm w-full mx-4"
            >
                <h2 className="text-2xl font-bold text-white mb-8 text-center drop-shadow-md">
                    <span className="text-yellow-400">{targetName}</span> shows you:
                </h2>

                {/* Card Visual */}
                <div className="mb-8 pointer-events-none">
                    <Card
                        value={card.value}
                        name={card.name}
                        description={card.desc}
                        variant="standard"
                        disabled={false}
                    />
                </div>

                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                    Acknowledge
                </button>
            </motion.div>
        </div>
    );
};
