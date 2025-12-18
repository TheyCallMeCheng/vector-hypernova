import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Notification {
    id: string;
    message: string;
}

interface GameNotificationsProps {
    notifications: Notification[];
}

export const GameNotifications: React.FC<GameNotificationsProps> = ({ notifications }) => {
    return (
        <div className="fixed top-4 right-4 z-40 flex flex-col items-end space-y-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map((note) => (
                    <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        layout
                        className="bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg shadow-lg border-l-4 border-yellow-500 backdrop-blur-sm max-w-sm"
                    >
                        <p className="text-sm font-medium">{note.message}</p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
