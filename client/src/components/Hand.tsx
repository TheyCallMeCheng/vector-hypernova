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
    disabledIndices?: number[];
    onIllegalMove?: (reason: string) => void;
}

export const Hand: React.FC<HandProps> = ({ cards, onPlay, isMyTurn, disabledIndices = [], onIllegalMove }) => {
    const { playCardHover, playCardSelect, playYourTurn, playDealCard } = useSoundManager();
    const [shakingCardIndex, setShakingCardIndex] = React.useState<number | null>(null);

    // Effect for "Your Turn" sound
    useEffect(() => {
        if (isMyTurn) {
            playYourTurn();
        }
    }, [isMyTurn, playYourTurn]);

    // Effect for "Deal" sound
    useEffect(() => {
        if (cards.length > 0) {
            playDealCard();
        }
    }, [cards.length, playDealCard]);

    const handleDisabledClick = (index: number) => {
        setShakingCardIndex(index);
        setTimeout(() => setShakingCardIndex(null), 400);
        if (onIllegalMove) {
            onIllegalMove("You must play the Countess!");
        }
    };

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-end h-64 w-full pointer-events-none">
            <motion.div
                className="flex space-x-4 pointer-events-auto items-end pb-4"
            >
                <AnimatePresence>
                    {cards.map((card, index) => {
                        const isDisabled = disabledIndices.includes(index);
                        const isShaking = shakingCardIndex === index;

                        return (
                            <motion.div
                                key={`${card.name}-${index}-${card.value}`}
                                layout
                                initial={{ x: 0, y: -window.innerHeight / 2, scale: 0.2, opacity: 0 }}
                                animate={isShaking ? { 
                                    x: [-5, 5, -5, 5, 0], 
                                    y: 0, 
                                    scale: 1, 
                                    opacity: 1, 
                                    transition: { duration: 0.4 } 
                                } : {
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                    opacity: 1,
                                    transition: { type: 'spring', stiffness: 200, damping: 20, delay: index * 0.1 }
                                }}
                                exit={{ y: -200, opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                                onHoverStart={playCardHover}
                                onClick={() => {
                                    if (isDisabled && isMyTurn) {
                                        handleDisabledClick(index);
                                    }
                                }}
                            >
                                <Card
                                    {...card}
                                    active={isMyTurn && !isDisabled}
                                    disabled={!isMyTurn || isDisabled}
                                    onClick={() => {
                                        if (isMyTurn && !isDisabled) {
                                            playCardSelect();
                                            onPlay(index);
                                        }
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
