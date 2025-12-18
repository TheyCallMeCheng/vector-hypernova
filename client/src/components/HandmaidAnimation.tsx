import React from 'react';
import { motion } from 'framer-motion';

export const HandmaidAnimation: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex flex-col items-center justify-center bg-indigo-900 bg-opacity-90 p-8 rounded-xl shadow-2xl border-4 border-blue-400"
            >
                <div className="text-8xl mb-4 drop-shadow-lg">🛡️</div>
                <h2 className="text-3xl font-bold text-white text-center drop-shadow-md">
                    Protected!
                </h2>
                <p className="text-blue-200 text-lg mt-2 font-semibold">
                    Handmaid blocks the effect
                </p>
            </motion.div>
        </div>
    );
};
