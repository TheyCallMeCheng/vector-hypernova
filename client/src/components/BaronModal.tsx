import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

interface CardData {
    name: string;
    value: number;
    desc: string;
}

interface BaronRevealData {
    initiatorName: string;
    initiatorCard: CardData;
    targetName: string;
    targetCard: CardData;
    winnerId: string | null; // null if tie
}

interface BaronModalProps {
    data: BaronRevealData;
    mySessionId: string; // To know "You" vs "Opponent" (optional, but good for "You Win" text)
    onClose: () => void;
}

export const BaronModal: React.FC<BaronModalProps> = ({ data, mySessionId, onClose }) => {
    // Helper to determine status for styling
    // we need to know which card belongs to the winner.
    // However, data.winnerId might match initiator or target.
    
    // BUT, we don't have sessionIds in the payload for initiator/target, only names. 
    // Wait, server sends winnerId (sessionId).
    // We actually need to know if initiator WON or if target WON.
    // The server payload:
    // initiatorName, initiatorCard (belongs to client/currentTurn player)
    // targetName, targetCard (belongs to targetId)
    // winnerId: sessionId of winner.
    
    // We can't match winnerId to "initiator" or "target" easily without passing their IDs too.
    // Let's rely on comparisons logic or name? No, names are not unique enough arguably, but IDs are safer.
    // Actually, I can just re-evaluate comparison here or assume standard:
    // If initiatorCard.value > targetCard.value => initiator wins.
    
    const initiatorWins = data.initiatorCard.value > data.targetCard.value;
    const targetWins = data.targetCard.value > data.initiatorCard.value;
    const isTie = !initiatorWins && !targetWins;

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
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="relative flex flex-col items-center w-full max-w-4xl px-4"
            >
                <h2 className="text-4xl font-bold text-white mb-10 text-center drop-shadow-lg tracking-wider uppercase">
                    Baron Face-off
                </h2>

                <div className="flex flex-row items-center justify-center gap-12 md:gap-24 mb-12">
                    {/* Initiator Side */}
                    <div className="flex flex-col items-center gap-4">
                        <span className={`text-xl font-bold ${initiatorWins ? 'text-green-400' : ( targetWins ? 'text-red-400' : 'text-white' )}`}>
                            {data.initiatorName}
                        </span>
                        
                        <div className={`relative transition-all duration-500 ${initiatorWins ? 'scale-110 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]' : (targetWins ? 'opacity-60 grayscale-[0.5]' : '')}`}>
                            <Card 
                                value={data.initiatorCard.value}
                                name={data.initiatorCard.name}
                                description={data.initiatorCard.desc}
                                variant="standard"
                                hoverable={false}
                            />
                            {/* Winner/Loser Badges */}
                            {initiatorWins && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-black px-4 py-1 rounded-full font-bold shadow-lg animate-bounce">
                                    WINNER
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-4xl font-black text-white/20 italic">VS</div>

                    {/* Target Side */}
                    <div className="flex flex-col items-center gap-4">
                        <span className={`text-xl font-bold ${targetWins ? 'text-green-400' : ( initiatorWins ? 'text-red-400' : 'text-white' )}`}>
                            {data.targetName}
                        </span>

                        <div className={`relative transition-all duration-500 ${targetWins ? 'scale-110 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]' : (initiatorWins ? 'opacity-60 grayscale-[0.5]' : '')}`}>
                            <Card 
                                value={data.targetCard.value}
                                name={data.targetCard.name}
                                description={data.targetCard.desc}
                                variant="standard"
                                hoverable={false}
                            />
                            {targetWins && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-black px-4 py-1 rounded-full font-bold shadow-lg animate-bounce">
                                    WINNER
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isTie && (
                    <div className="mb-8 text-2xl font-bold text-yellow-400">
                        IT'S A TIE!
                    </div>
                )}

                <button 
                    onClick={onClose}
                    className="px-10 py-3 bg-white text-black font-extrabold text-lg rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform"
                >
                    ACKNOWLEDGE
                </button>
            </motion.div>
        </div>
    );
};
