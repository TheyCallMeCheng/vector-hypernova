import React from 'react';
import { motion } from 'framer-motion';

export const HandmaidAnimation: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-10 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] border-2 border-yellow-500/50 min-w-[320px]"
            >
                <div className="text-8xl mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform hover:scale-110 transition-transform">
                    🛡️
                </div>
                <h2 className="text-4xl font-bold text-yellow-500 font-serif text-center mb-2 tracking-wide drop-shadow-md uppercase">
                    Protected!
                </h2>
                <p className="text-gray-300 text-lg text-center font-medium tracking-wide">
                    Handmaid blocks the effect
                </p>
            </motion.div>
        </div>
    );
};
