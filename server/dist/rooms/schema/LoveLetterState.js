"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoveLetterState = exports.Player = exports.Card = void 0;
const schema_1 = require("@colyseus/schema");
class Card extends schema_1.Schema {
    constructor(value, name, description) {
        super();
        this.value = 0;
        this.name = "";
        this.description = "";
        this.value = value;
        this.name = name;
        this.description = description;
    }
}
exports.Card = Card;
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Card.prototype, "value", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Card.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Card.prototype, "description", void 0);
class Player extends schema_1.Schema {
    constructor(id, name, discordId = "", avatarUrl = "") {
        super();
        this.discordId = ""; // Discord user ID for reconnection
        this.avatarUrl = ""; // Discord avatar URL
        this.isConnected = true; // Track connection status
        this.hand = new schema_1.ArraySchema();
        this.isEliminated = false;
        this.isProtected = false; // Handmaid effect
        this.score = 0;
        this.id = id;
        this.name = name;
        this.discordId = discordId;
        this.avatarUrl = avatarUrl;
    }
}
exports.Player = Player;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Player.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Player.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Player.prototype, "discordId", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Player.prototype, "avatarUrl", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "isConnected", void 0);
__decorate([
    (0, schema_1.type)([Card]),
    __metadata("design:type", Object)
], Player.prototype, "hand", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "isEliminated", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "isProtected", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Player.prototype, "score", void 0);
class LoveLetterState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.deck = new schema_1.ArraySchema();
        this.discardPile = new schema_1.ArraySchema(); // Track played cards
        this.currentTurn = "";
        this.gamePhase = "waiting"; // waiting, playing, round_end
        this.winner = "";
        this.hostId = "";
        this.winningScore = 3;
    }
    // Helper to add player
    createPlayer(sessionId, name, discordId = "", avatarUrl = "") {
        this.players.set(sessionId, new Player(sessionId, name, discordId, avatarUrl));
    }
    // Helper to remove player
    removePlayer(sessionId) {
        this.players.delete(sessionId);
    }
}
exports.LoveLetterState = LoveLetterState;
__decorate([
    (0, schema_1.type)({ map: Player }),
    __metadata("design:type", Object)
], LoveLetterState.prototype, "players", void 0);
__decorate([
    (0, schema_1.type)([Card]),
    __metadata("design:type", Object)
], LoveLetterState.prototype, "deck", void 0);
__decorate([
    (0, schema_1.type)([Card]),
    __metadata("design:type", Object)
], LoveLetterState.prototype, "discardPile", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], LoveLetterState.prototype, "currentTurn", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], LoveLetterState.prototype, "gamePhase", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], LoveLetterState.prototype, "winner", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], LoveLetterState.prototype, "hostId", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], LoveLetterState.prototype, "winningScore", void 0);
//# sourceMappingURL=LoveLetterState.js.map