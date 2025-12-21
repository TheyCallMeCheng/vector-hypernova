import { Room, Client } from "colyseus";
import { LoveLetterState, Player, Card } from "./schema/LoveLetterState";
export declare class LoveLetterRoom extends Room<LoveLetterState> {
    maxClients: number;
    onCreate(options: any): void;
    onJoin(client: Client, options: any): void;
    onLeave(client: Client, consented: boolean): void;
    reassignHostIfNeeded(leftSessionId: string): void;
    onDispose(): void;
    startGame(options?: any): void;
    startRound(): void;
    drawCard(sessionId: string): void;
    handlePlayCard(client: Client, message: any): void;
    executeCardEffect(client: Client, card: Card, targetId?: string, guessValue?: number): void;
    nextTurn(): void;
    checkWinCondition(): boolean;
    endRound(): void;
    handleRoundWinner(winner: Player): void;
}
//# sourceMappingURL=LoveLetterRoom.d.ts.map