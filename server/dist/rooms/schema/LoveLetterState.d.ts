import { Schema, MapSchema, ArraySchema } from "@colyseus/schema";
export declare class Card extends Schema {
    value: number;
    name: string;
    description: string;
    constructor(value: number, name: string, description: string);
}
export declare class Player extends Schema {
    id: string;
    name: string;
    discordId: string;
    avatarUrl: string;
    isConnected: boolean;
    hand: ArraySchema<Card>;
    isEliminated: boolean;
    isProtected: boolean;
    score: number;
    constructor(id: string, name: string, discordId?: string, avatarUrl?: string);
}
export declare class LoveLetterState extends Schema {
    players: MapSchema<Player, string>;
    deck: ArraySchema<Card>;
    discardPile: ArraySchema<Card>;
    currentTurn: string;
    gamePhase: string;
    winner: string;
    hostId: string;
    winningScore: number;
    createPlayer(sessionId: string, name: string, discordId?: string, avatarUrl?: string): void;
    removePlayer(sessionId: string): void;
}
//# sourceMappingURL=LoveLetterState.d.ts.map