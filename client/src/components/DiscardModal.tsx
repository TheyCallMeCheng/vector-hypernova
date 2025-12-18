import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';

interface CardData {
    value: number;
    name: string;
    description: string;
}

interface DiscardModalProps {
    discardPile: CardData[];
    onClose: () => void;
}

export const DiscardModal: React.FC<DiscardModalProps> = ({ discardPile, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            {/* Backdrop - Blur effect */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 backdrop-blur-md bg-black/40"
                onClick={onClose}
            >
                {/* Clicking anywhere on the background closes it */}
            </motion.div>

            {/* Modal Content - Scrollable Grid */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative z-10 w-full h-full flex flex-col items-center justify-center" 
                onClick={onClose} // Clicking anywhere in the container (gaps) closes it
            >
                {/* Scrollable Grid Container - Full Size */}
                <div 
                    className="w-full h-full overflow-y-auto p-10 flex flex-wrap content-center justify-center gap-8 no-scrollbar pb-32 pointer-events-auto"
                >
                    {discardPile.map((card, index) => (
                        <div 
                            key={`${index}-${card.name}`} 
                            className="relative"
                            onClick={(e) => e.stopPropagation()} // Stop click from closing modal when clicking a card
                        >
                            <Card 
                                value={card.value}
                                name={card.name}
                                description={card.description || ""}
                                variant="mini"
                                hoverable={true} 
                            />
                        </div>
                    ))}
                    {discardPile.length === 0 && (
                        <p className="text-white text-xl text-center italic opacity-50 w-full">The discard pile is empty.</p>
                    )}
                </div>

                {/* Title at the BOTTOM - Fixed Position relative to screen */}
                <div className="absolute bottom-8 z-20 pointer-events-auto">
                    <h2 
                        className="text-3xl font-bold text-white text-center drop-shadow-lg bg-black/50 backdrop-blur-md px-8 py-2 rounded-full border border-white/10 select-none cursor-default"
                        onClick={(e) => e.stopPropagation()} // Clicking title shouldn't close either
                    >
                        Discard Pile
                    </h2>
                </div>
            </motion.div>
        </div>
    );
};
