import * as Colyseus from "colyseus.js";

// 1. Get the protocol (http -> ws, https -> wss)
const protocol = window.location.protocol.replace("http", "ws");

// 2. Get the host (e.g., "localhost:5173" or "cool-app.trycloudflare.com")
const host = window.location.host;

// 3. Combine them. This tells the app to connect to "Itself" (which Vite will forward)
const endpoint = `${protocol}//${host}/colyseus`; 

// -----------------------
export const client = new Colyseus.Client(endpoint);

export interface JoinOptions {
    name: string;
    discordId?: string;
    avatarUrl?: string;
    discordInstanceId?: string;
}

export const joinRoom = async (options: JoinOptions) => {
    try {
        const room = await client.joinOrCreate("love_letter", options);
        console.log("Joined room", room.sessionId);
        return room;
    } catch (e) {
        console.error("Join error", e);
        throw e;
    }
};
