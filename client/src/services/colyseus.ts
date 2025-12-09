import * as Colyseus from "colyseus.js";

// Use localhost for development, but in production this should be dynamic
const endpoint = "ws://localhost:2567";

export const client = new Colyseus.Client(endpoint);

export let room: Colyseus.Room | null = null;

export const joinRoom = async (name: string) => {
    try {
        room = await client.joinOrCreate("love_letter", { name });
        console.log("Joined room", room.sessionId);
        return room;
    } catch (e) {
        console.error("Join error", e);
        throw e;
    }
};
