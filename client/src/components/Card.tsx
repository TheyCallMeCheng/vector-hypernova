import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
    value: number;
    name: string;
    description: string;
    onClick?: () => void;
    disabled?: boolean;
    isSelected?: boolean;
    active?: boolean; // For "My Turn" highlighting (glow)
}

export const Card: React.FC<CardProps> = ({
    value,
    name,
    description,
    onClick,
    disabled = false,
    active = false
}) => {
    return (
        <motion.div
            layout // Helper for shared layout animations (sliding when neighbors are removed)
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            whileHover={!disabled ? { scale: 1.1, rotate: 2, zIndex: 10 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={!disabled ? onClick : undefined}
            className={`
                w-32 h-48 bg-white text-black border-2 rounded-lg p-3 cursor-pointer shadow-xl relative select-none
                ${disabled ? 'opacity-80 grayscale cursor-not-allowed border-red-500' : 'opacity-100 border-gray-400'}
                ${active ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' : ''}
            `}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="flex justify-between items-start pointer-events-none">
                <span className="font-bold text-xl">{value}</span>
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
            <div className="mt-8 text-center font-bold text-lg pointer-events-none">{name}</div>
            <p className="text-xs mt-2 text-gray-600 text-center pointer-events-none">{description}</p>
        </motion.div>
    );
};
