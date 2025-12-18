import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";

export class Card extends Schema {
    @type("number") value: number = 0;
    @type("string") name: string = "";
    @type("string") description: string = "";

    constructor(value: number, name: string, description: string) {
        super();
        this.value = value;
        this.name = name;
        this.description = description;
    }
}

export class Player extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("string") discordId: string = "";  // Discord user ID for reconnection
    @type("string") avatarUrl: string = "";   // Discord avatar URL
    @type("boolean") isConnected: boolean = true; // Track connection status
    @type([Card]) hand = new ArraySchema<Card>();
    @type("boolean") isEliminated: boolean = false;
    @type("boolean") isProtected: boolean = false; // Handmaid effect
    @type("number") score: number = 0;

    constructor(id: string, name: string, discordId: string = "", avatarUrl: string = "") {
        super();
        this.id = id;
        this.name = name;
        this.discordId = discordId;
        this.avatarUrl = avatarUrl;
    }
}

export class LoveLetterState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type([Card]) deck = new ArraySchema<Card>();
    @type([Card]) discardPile = new ArraySchema<Card>(); // Track played cards
    @type("string") currentTurn: string = "";
    @type("string") gamePhase: string = "waiting"; // waiting, playing, round_end
    @type("string") winner: string = "";
    @type("string") hostId: string = "";
    @type("number") winningScore: number = 3;

    // Helper to add player
    createPlayer(sessionId: string, name: string, discordId: string = "", avatarUrl: string = "") {
        this.players.set(sessionId, new Player(sessionId, name, discordId, avatarUrl));
    }

    // Helper to remove player
    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }
}
