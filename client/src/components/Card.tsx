import React from 'react';
import { motion } from 'framer-motion';

// Import images
import guardImg from '../assets/img/guard.png';
import priestImg from '../assets/img/priest.png';
import baronImg from '../assets/img/baron.png';
import princeImg from '../assets/img/prince.png';

const CARD_IMAGES: Record<string, string> = {
    "Guard": guardImg,
    "Priest": priestImg,
    "Baron": baronImg,
    "Prince": princeImg,
    // Add others as they become available
};

export interface CardProps {
    value: number;
    name: string;
    description: string;
    onClick?: () => void;
    disabled?: boolean;
    isSelected?: boolean;
    active?: boolean; // For "My Turn" highlighting (glow)
    className?: string; // Allow overriding dimensions/margin
}

export const Card: React.FC<CardProps> = ({
    value,
    name,
    description,
    onClick,
    disabled = false,
    active = false,
    className
}) => {
    const imageSrc = CARD_IMAGES[name];
    const sizeClasses = className || "w-48 h-72";

    return (
        <motion.div
            layout // Helper for shared layout animations (sliding when neighbors are removed)
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            whileHover={!disabled ? { scale: 1.4, rotate: 2, zIndex: 10 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={!disabled ? onClick : undefined}
            className={`
                ${sizeClasses} rounded-lg cursor-pointer shadow-xl relative select-none overflow-hidden
                ${disabled ? 'grayscale cursor-not-allowed border-2 border-red-500 opacity-80' : 'border-2 border-gray-400 opacity-100'}
                ${active ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' : ''}
                ${!imageSrc ? 'bg-white text-black p-4' : 'bg-black'} 
            `}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {imageSrc ? (
                <img 
                    src={imageSrc} 
                    alt={name} 
                    className="w-full h-full object-cover"
                />
            ) : (
                <>
                    <div className="flex justify-between items-start pointer-events-none">
                        <span className="font-bold text-2xl">{value}</span>
                        <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="mt-10 text-center font-bold text-xl pointer-events-none">{name}</div>
                    <p className="text-xs mt-3 text-gray-600 text-center pointer-events-none leading-relaxed">{description}</p>
                </>
            )}
        </motion.div>
    );
};
