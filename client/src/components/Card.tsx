import React from 'react';
import { motion } from 'framer-motion';

// Import images
import guardImg from '../assets/img/guard.png';
import priestImg from '../assets/img/priest.png';
import baronImg from '../assets/img/baron.png';
import princeImg from '../assets/img/prince.png';
import handmaidImg from '../assets/img/handmaid.png';
import kingImg from '../assets/img/king.png';
import countessImg from '../assets/img/countess.png';
import princessImg from '../assets/img/princess.png';

const CARD_IMAGES: Record<string, string> = {
    "Guard": guardImg,
    "Priest": priestImg,
    "Baron": baronImg,
    "Prince": princeImg,
    "Handmaid": handmaidImg,
    "King": kingImg,
    "Countess": countessImg,
    "Princess": princessImg,
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
    variant?: 'standard' | 'mini';
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    value,
    name,
    description,
    onClick,
    disabled = false,
    active = false,
    className,
    variant = 'standard',
    hoverable = true
}) => {
    const imageSrc = CARD_IMAGES[name];
    const sizeClasses = className || (variant === 'mini' ? "w-24 h-36" : "w-48 h-72");

    // Dynamic styles based on variant
    const valueSize = variant === 'mini' ? 'text-lg' : 'text-2xl';
    const indicatorSize = variant === 'mini' ? 'w-3 h-3' : 'w-5 h-5';
    const nameSize = variant === 'mini' ? 'text-sm' : 'text-xl';
    const nameMargin = variant === 'mini' ? 'mt-4' : 'mt-10';
    const descSize = variant === 'mini' ? 'text-[10px] leading-tight' : 'text-xs leading-relaxed';
    const descMargin = variant === 'mini' ? 'mt-1' : 'mt-3';
    const padding = variant === 'mini' ? 'p-2' : 'p-4';

    return (
        <motion.div
            // Removed 'layout' to prevent conflict with parent Layout animation and allow simple transform origin
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            whileHover={!disabled && hoverable ? { scale: 1.4, zIndex: 10 } : {}}
            whileTap={!disabled && hoverable ? { scale: 0.95 } : {}}
            onClick={!disabled ? onClick : undefined}
            style={{ transformOrigin: "bottom center" }} // Enforce upward scaling
            className={`
                ${sizeClasses} rounded-lg cursor-pointer shadow-xl relative select-none overflow-hidden origin-bottom
                ${disabled ? 'grayscale cursor-not-allowed border-2 border-red-500 opacity-80' : 'border-2 border-gray-400 opacity-100'}
                ${active ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' : ''}
                ${!imageSrc ? `bg-white text-black ${padding}` : 'bg-black'} 
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
                        <span className={`font-bold ${valueSize}`}>{value}</span>
                        <div className={`${indicatorSize} bg-red-500 rounded-full`}></div>
                    </div>
                    <div className={`${nameMargin} text-center font-bold ${nameSize} pointer-events-none`}>{name}</div>
                    <p className={`${descSize} ${descMargin} text-gray-600 text-center pointer-events-none`}>{description}</p>
                </>
            )}
        </motion.div>
    );
};
