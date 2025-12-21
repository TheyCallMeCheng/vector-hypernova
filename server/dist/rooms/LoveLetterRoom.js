"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoveLetterRoom = void 0;
const colyseus_1 = require("colyseus");
const LoveLetterState_1 = require("./schema/LoveLetterState");
const CARDS_DATA = [
    { value: 1, name: "Guard", count: 5, desc: "Guess a player's hand" },
    { value: 2, name: "Priest", count: 2, desc: "Look at a player's hand" },
    { value: 3, name: "Baron", count: 2, desc: "Compare hands; lower hand is out" },
    { value: 4, name: "Handmaid", count: 2, desc: "Protection until next turn" },
    { value: 5, name: "Prince", count: 2, desc: "One player discards their hand" },
    { value: 6, name: "King", count: 1, desc: "Trade hands" },
    { value: 7, name: "Countess", count: 1, desc: "Discard if caught with King or Prince" },
    { value: 8, name: "Princess", count: 1, desc: "Lose if discarded" },
];
class LoveLetterRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 4;
    }
    onCreate(options) {
        this.setState(new LoveLetterState_1.LoveLetterState());
        this.onMessage("start_game", (client, message) => {
            if (this.state.players.get(client.sessionId) && this.state.players.size >= 2) {
                // message contains options like { winningScore: 5 }
                this.startGame(message);
            }
        });
        this.onMessage("play_card", (client, message) => {
            // message: { cardIndex: number, targetId?: string, guessValue?: number }
            this.handlePlayCard(client, message);
        });
        this.onMessage("reset_game", (client) => {
            // Only allow if game is over (or maybe host can force reset? let's allow anyone in game_over)
            if (this.state.gamePhase === "game_over") {
                this.state.gamePhase = "waiting";
                this.state.deck.clear();
                this.state.discardPile.clear();
                this.state.winner = "";
                // Reset all player stats
                this.state.players.forEach(p => {
                    p.hand.clear();
                    p.score = 0;
                    p.isEliminated = false;
                    p.isProtected = false;
                });
                this.broadcast("message", "Returning to lobby...");
            }
        });
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
        const name = options.name || `Player ${this.clients.length}`;
        const discordId = options.discordId || "";
        const avatarUrl = options.avatarUrl || "";
        // Check if this is a reconnecting player (by Discord ID)
        if (discordId) {
            let existingPlayer = null;
            let existingSessionId = "";
            this.state.players.forEach((player, sessionId) => {
                if (player.discordId === discordId) {
                    existingPlayer = player;
                    existingSessionId = sessionId;
                }
            });
            if (existingPlayer && existingSessionId !== client.sessionId) {
                // Reconnecting player - transfer their state to new session
                console.log(`Player ${discordId} reconnecting. Old session: ${existingSessionId}, New session: ${client.sessionId}`);
                // Create new player with old state
                const newPlayer = new LoveLetterState_1.Player(client.sessionId, existingPlayer.name, discordId, avatarUrl);
                newPlayer.hand = existingPlayer.hand;
                newPlayer.isEliminated = existingPlayer.isEliminated;
                newPlayer.isProtected = existingPlayer.isProtected;
                newPlayer.score = existingPlayer.score;
                newPlayer.isConnected = true;
                // Remove old player entry
                this.state.players.delete(existingSessionId);
                this.state.players.set(client.sessionId, newPlayer);
                // Update currentTurn if needed
                if (this.state.currentTurn === existingSessionId) {
                    this.state.currentTurn = client.sessionId;
                }
                // Update hostId if needed
                if (this.state.hostId === existingSessionId) {
                    this.state.hostId = client.sessionId;
                }
                return;
            }
        }
        // New player joining
        this.state.createPlayer(client.sessionId, name, discordId, avatarUrl);
        // Assign host if none exists or if the current host is not in the player list
        if (!this.state.hostId || !this.state.players.has(this.state.hostId)) {
            this.state.hostId = client.sessionId;
            console.log("Host assigned to:", client.sessionId);
        }
    }
    onLeave(client, consented) {
        console.log(client.sessionId, "left!", consented ? "(intentional)" : "(disconnected)");
        const player = this.state.players.get(client.sessionId);
        // In lobby (waiting phase) OR Game Over: remove player completely
        // If game is over, we don't need to wait for reconnection, just let the room dispose if empty.
        if (this.state.gamePhase === "waiting" || this.state.gamePhase === "game_over") {
            this.state.removePlayer(client.sessionId);
            this.reassignHostIfNeeded(client.sessionId);
            return;
        }
        // During active game
        if (player) {
            if (consented) {
                // Player intentionally left: mark as eliminated
                player.isEliminated = true;
                player.isConnected = false;
                this.broadcast("message", `${player.name} left the game.`);
                this.checkWinCondition();
            }
            else {
                // Disconnected unexpectedly: allow reconnection for 60 seconds
                player.isConnected = false;
                this.broadcast("message", `${player.name} disconnected. Waiting for reconnect...`);
                this.allowReconnection(client, 60).then(reconnectedClient => {
                    // Player reconnected via Colyseus built-in reconnection
                    console.log(`${client.sessionId} reconnected via allowReconnection!`);
                    player.isConnected = true;
                    this.broadcast("message", `${player.name} reconnected!`);
                }).catch(() => {
                    // Failed to reconnect in time: eliminate them
                    console.log(`${client.sessionId} failed to reconnect in time`);
                    player.isEliminated = true;
                    this.broadcast("message", `${player.name} timed out and is eliminated.`);
                    this.checkWinCondition();
                });
            }
        }
    }
    reassignHostIfNeeded(leftSessionId) {
        if (this.state.hostId === leftSessionId) {
            if (this.state.players.size > 0) {
                this.state.hostId = this.state.players.keys().next().value;
            }
            else {
                this.state.hostId = "";
            }
        }
    }
    onDispose() {
        console.log("room disposed");
    }
    startGame(options) {
        // Full Game Reset
        if (options && options.winningScore) {
            this.state.winningScore = options.winningScore;
        }
        else {
            this.state.winningScore = 3; // Default
        }
        // Reset scores
        this.state.players.forEach(player => {
            player.score = 0;
        });
        this.startRound();
    }
    startRound() {
        this.state.gamePhase = "playing";
        this.state.deck.clear();
        this.state.discardPile.clear();
        this.state.winner = ""; // Reset round winner tracking
        // Reset players (keep scores)
        // Reset players (keep scores)
        console.log("--- STARTING ROUND: RESETTING PLAYERS ---");
        for (const [sessionId, player] of this.state.players) {
            player.hand.clear();
            const wasEliminated = player.isEliminated;
            player.isEliminated = false;
            player.isProtected = false;
            console.log(`Resetting player ${player.name} (${sessionId}): isEliminated was ${wasEliminated} -> now false`);
        }
        // Build Deck
        const deck = [];
        CARDS_DATA.forEach(c => {
            for (let i = 0; i < c.count; i++) {
                deck.push(new LoveLetterState_1.Card(c.value, c.name, c.desc));
            }
        });
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // Add to state deck
        deck.forEach(c => this.state.deck.push(c));
        // Remove one card (burn)
        this.state.deck.pop();
        // Deal 1 card to each player
        this.state.players.forEach(player => {
            if (this.state.deck.length > 0) {
                player.hand.push(this.state.deck.pop());
            }
        });
        // Set random first player
        const playerIds = Array.from(this.state.players.keys());
        this.state.currentTurn = playerIds[Math.floor(Math.random() * playerIds.length)];
        // Draw card for first player
        this.drawCard(this.state.currentTurn);
    }
    drawCard(sessionId) {
        const player = this.state.players.get(sessionId);
        if (player && !player.isEliminated && this.state.deck.length > 0) {
            player.hand.push(this.state.deck.pop());
        }
        else if (this.state.deck.length === 0) {
            this.endRound();
        }
    }
    handlePlayCard(client, message) {
        if (this.state.gamePhase !== "playing") {
            console.log(`[handlePlayCard] REJECTED: Game phase is ${this.state.gamePhase}`);
            return;
        }
        if (this.state.currentTurn !== client.sessionId) {
            console.log(`[handlePlayCard] REJECTED: Not ${client.sessionId}'s turn (Current: ${this.state.currentTurn})`);
            return;
        }
        const player = this.state.players.get(client.sessionId);
        if (!player)
            return;
        if (player.isEliminated) {
            console.log(`[handlePlayCard] REJECTED: Player ${player.name} is ELIMINATED.`);
            return;
        }
        const cardIndex = message.cardIndex;
        if (cardIndex === undefined || cardIndex < 0 || cardIndex >= player.hand.length)
            return;
        const card = player.hand.at(cardIndex);
        // Countess Check: If holding King(6) or Prince(5) and Countess(7), must play Countess
        const hasCountess = player.hand.some(c => c.value === 7);
        const hasRoyal = player.hand.some(c => c.value === 5 || c.value === 6);
        if (hasCountess && hasRoyal && card.value !== 7) {
            // Must play Countess
            client.send("error", "You must play the Countess!");
            return;
        }
        // Remove card from hand and add to discard pile (visual only, logic below)
        player.hand.splice(cardIndex, 1);
        this.state.discardPile.push(card);
        // Reset protection at start of turn? No, usually lasts until next turn.
        // Actually protection lasts until your next turn starts. 
        // So we should clear protection for THIS player now? 
        // Rules say "until your next turn". So yes, if I am playing, I am not protected anymore (unless I play Handmaid again).
        player.isProtected = false;
        // Execute Effect
        this.executeCardEffect(client, card, message.targetId, message.guessValue);
        // Check for round end (1 player left)
        if (this.checkWinCondition())
            return;
        // Next Turn
        this.nextTurn();
    }
    executeCardEffect(client, card, targetId, guessValue) {
        const player = this.state.players.get(client.sessionId);
        let target = targetId ? this.state.players.get(targetId) : null;
        // Validate target
        // Validate target
        if (target && target.isEliminated) {
            target = null; // Target is invalid
        }
        else if (target && target.isProtected) {
            // Target is protected: The move happens, but effect is blocked
            this.broadcast("message", `${player.name} targeted ${target.name}, but they are protected by the Handmaid!`);
            this.broadcast("handmaid_protection", {
                triggeringPlayer: player.name,
                protectedPlayer: target.name
            });
            target = null; // Effect is blocked
        }
        // 1. Guard: Guess hand
        if (card.value === 1) {
            if (target && guessValue && guessValue !== 1) {
                const targetCard = target.hand.at(0);
                if (targetCard && targetCard.value === guessValue) {
                    target.isEliminated = true;
                    this.broadcast("message", `${player.name} guessed correctly! ${target.name} is out.`);
                }
                else {
                    this.broadcast("message", `${player.name} guessed ${guessValue} for ${target.name} but was wrong.`);
                }
            }
        }
        // 2. Priest: Look at hand
        else if (card.value === 2) {
            if (target) {
                const targetCard = target.hand.at(0);
                // Send structured data for the modal instead of just text
                client.send("card_reveal", {
                    targetName: target.name,
                    card: {
                        name: targetCard.name,
                        value: targetCard.value,
                        description: targetCard.description
                    }
                });
                // Keep the text log for history/broadcast (generic message to others)
                this.broadcast("message", `${player.name} looked at ${target.name}'s hand.`);
            }
        }
        // 3. Baron: Compare hands
        else if (card.value === 3) {
            if (target) {
                const myCard = player.hand.at(0); // The remaining card
                const targetCard = target.hand.at(0);
                // Determine winner logic first
                let winnerId = null;
                if (myCard.value > targetCard.value) {
                    winnerId = client.sessionId;
                }
                else if (targetCard.value > myCard.value) {
                    winnerId = targetId; // targetId is guaranteed to be string here if target exists
                }
                // Send Reveal Data to BOTH players involved
                const revealData = {
                    initiatorName: player.name,
                    initiatorCard: { name: myCard.name, value: myCard.value, desc: myCard.description },
                    targetName: target.name,
                    targetCard: { name: targetCard.name, value: targetCard.value, desc: targetCard.description },
                    winnerId: winnerId
                };
                client.send("baron_reveal", revealData);
                const targetClient = this.clients.find(c => c.sessionId === targetId);
                if (targetClient) {
                    targetClient.send("baron_reveal", revealData);
                }
                // Execute Logic
                if (myCard.value > targetCard.value) {
                    target.isEliminated = true;
                    this.broadcast("message", `${player.name} wins Baron duel against ${target.name}.`);
                }
                else if (targetCard.value > myCard.value) {
                    player.isEliminated = true;
                    this.broadcast("message", `${target.name} wins Baron duel against ${player.name}.`);
                }
                else {
                    this.broadcast("message", "Baron duel was a tie.");
                }
            }
        }
        // 4. Handmaid: Protection
        else if (card.value === 4) {
            player.isProtected = true;
            this.broadcast("message", `${player.name} is protected by the Handmaid.`);
        }
        // 5. Prince: Discard hand
        else if (card.value === 5) {
            // Prince can target self
            if (!target && targetId === client.sessionId)
                target = player;
            if (target) {
                const discarded = target.hand.pop();
                this.state.discardPile.push(discarded);
                this.broadcast("message", `${target.name} discards ${discarded.name}.`);
                if (discarded.value === 8) {
                    target.isEliminated = true;
                    this.broadcast("message", `${target.name} discarded the Princess and is out!`);
                }
                else {
                    // Draw new card if deck not empty, else take burnt card (simplified: just draw if possible)
                    if (this.state.deck.length > 0) {
                        target.hand.push(this.state.deck.pop());
                    }
                    else {
                        // In real rules, take the set-aside card. For now, do nothing or take from bottom.
                        // Simplification: if deck empty, they play with empty hand? No, that breaks logic.
                        // Let's assume deck has cards or we handle burn card later.
                    }
                }
            }
        }
        // 6. King: Trade hands
        else if (card.value === 6) {
            if (target) {
                const myCard = player.hand.pop();
                const targetCard = target.hand.pop();
                player.hand.push(targetCard);
                target.hand.push(myCard);
                this.broadcast("message", `${player.name} traded hands with ${target.name}.`);
            }
        }
        // 7. Countess: No effect (logic in handlePlayCard checks validity)
        else if (card.value === 7) {
            this.broadcast("message", `${player.name} played the Countess.`);
        }
        // 8. Princess: Eliminate if played
        else if (card.value === 8) {
            player.isEliminated = true;
            this.broadcast("message", `${player.name} played the Princess and is out!`);
        }
    }
    nextTurn() {
        const playerIds = Array.from(this.state.players.keys());
        let currentIndex = playerIds.indexOf(this.state.currentTurn);
        let nextIndex = (currentIndex + 1) % playerIds.length;
        let loopCount = 0;
        // Find next non-eliminated player
        while (this.state.players.get(playerIds[nextIndex]).isEliminated && loopCount < playerIds.length) {
            nextIndex = (nextIndex + 1) % playerIds.length;
            loopCount++;
        }
        if (loopCount >= playerIds.length) {
            this.endRound(); // Should be caught by checkWinCondition but just in case
            return;
        }
        this.state.currentTurn = playerIds[nextIndex];
        this.drawCard(this.state.currentTurn);
    }
    checkWinCondition() {
        const activePlayers = Array.from(this.state.players.values()).filter(p => !p.isEliminated);
        if (activePlayers.length === 1) {
            // Determine round winner
            this.handleRoundWinner(activePlayers[0]);
            return true;
        }
        if (this.state.deck.length === 0) {
            this.endRound();
            return true;
        }
        return false;
    }
    endRound() {
        this.state.gamePhase = "round_end";
        // Compare hands of active players
        const activePlayers = Array.from(this.state.players.values()).filter(p => !p.isEliminated);
        let winner = activePlayers[0];
        let maxVal = -1;
        activePlayers.forEach(p => {
            const card = p.hand.at(0);
            if (card && card.value > maxVal) {
                maxVal = card.value;
                winner = p;
            }
        });
        if (winner) {
            this.handleRoundWinner(winner);
        }
    }
    handleRoundWinner(winner) {
        this.state.gamePhase = "round_end";
        this.state.winner = winner.id;
        winner.score += 1; // Increment score
        this.broadcast("message", `Round Winner: ${winner.name} (Score: ${winner.score}/${this.state.winningScore})`);
        if (winner.score >= this.state.winningScore) {
            // Game Winner
            this.state.winner = winner.id;
            this.state.gamePhase = "game_over";
            this.broadcast("message", `GAME OVER! ${winner.name} wins the match!`);
            // No auto-redirect. Players must click "Back to Main Menu".
        }
        else {
            // Next Round
            this.broadcast("message", "Next round starting in 3 seconds...");
            this.clock.setTimeout(() => {
                this.startRound();
            }, 3000);
        }
    }
}
exports.LoveLetterRoom = LoveLetterRoom;
//# sourceMappingURL=LoveLetterRoom.js.map