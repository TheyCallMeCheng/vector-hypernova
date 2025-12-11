import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from './Card'; // Import the new component
import { useSoundManager } from '../hooks/useSoundManager';

interface CardData {
    value: number;
    name: string;
    description: string;
}

interface HandProps {
    cards: CardData[];
    onPlay: (index: number) => void;
    isMyTurn: boolean;
}

export const Hand: React.FC<HandProps> = ({ cards, onPlay, isMyTurn }) => {
    const { playCardHover, playCardSelect, playYourTurn, playDealCard } = useSoundManager();

    // Effect for "Your Turn" sound
    useEffect(() => {
        if (isMyTurn) {
            playYourTurn();
        }
    }, [isMyTurn, playYourTurn]);

    // Effect for "Deal" sound when cards change (simple heuristic)
    useEffect(() => {
        if (cards.length > 0) {
            playDealCard();
        }
    }, [cards.length, playDealCard]);

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-end h-64 w-full pointer-events-none">
            {/* 
                pointer-events-none on container so we don't block clicks around the hand.
                The cards themselves will re-enable pointer-events.
            */}
            <motion.div
                className="flex space-x-4 pointer-events-auto items-end pb-4"
            >
                <AnimatePresence>
                    {cards.map((card, index) => (
                        <motion.div
                            key={`${card.name}-${index}-${card.value}`} // Unique key needed for AnimatePresence
                            // Initial state for "Dealing" animation: start from center screen (approximate deck location)
                            initial={{
                                x: 0,
                                y: -window.innerHeight / 2,
                                scale: 0.2,
                                opacity: 0
                            }}
                            // Animate to final position in hand
                            animate={{
                                x: 0,
                                y: 0,
                                scale: 1,
                                opacity: 1,
                                transition: {
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 20,
                                    delay: index * 0.1 // Stagger effect
                                }
                            }}
                            // Exit animation (playing a card)
                            exit={{
                                y: -200,
                                opacity: 0,
                                scale: 0.5,
                                transition: { duration: 0.3 }
                            }}
                            onHoverStart={playCardHover}
                        >
                            <Card
                                {...card}
                                active={isMyTurn}
                                disabled={!isMyTurn}
                                onClick={() => {
                                    if (isMyTurn) {
                                        playCardSelect();
                                        onPlay(index);
                                    }
                                }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
