"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // Load .env file
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const colyseus_1 = require("colyseus");
const LoveLetterRoom_1 = require("./rooms/LoveLetterRoom");
const path_1 = __importDefault(require("path"));
const port = Number(process.env.PORT || 2567);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve client static files
const clientBuildPath = path_1.default.join(__dirname, "../../client/dist");
app.use(express_1.default.static(clientBuildPath));
// Discord OAuth token exchange endpoint
app.post("/api/discord/token", async (req, res) => {
    // accept redirect_uri from the client
    const { code, redirect_uri } = req.body;
    if (!code) {
        return res.status(400).json({ error: "Missing authorization code" });
    }
    try {
        const discordClientId = process.env.DISCORD_CLIENT_ID || process.env.VITE_DISCORD_CLIENT_ID || "";
        const discordClientSecret = process.env.DISCORD_CLIENT_SECRET || process.env.VITE_DISCORD_CLIENT_SECRET || "";
        // Use the redirect_uri provided by the client, fallback to origin header if missing
        const origin = req.headers.origin || req.headers.referer || "";
        const finalRedirectUri = (redirect_uri || origin).replace(/\/$/, "");
        const params = new URLSearchParams({
            client_id: discordClientId,
            client_secret: discordClientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: finalRedirectUri,
        });
        const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("Discord token exchange FAILED!");
            console.error("Status:", tokenResponse.status);
            console.error("Response:", errorText);
            return res.status(tokenResponse.status).json({ error: "Token exchange failed", details: errorText });
        }
        const tokenData = await tokenResponse.json();
        console.log("Token exchange SUCCESS! Access token received.");
        res.json(tokenData);
    }
    catch (error) {
        console.error("Discord token exchange error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const server = http_1.default.createServer(app);
const gameServer = new colyseus_1.Server({
    server: server,
});
gameServer.define("love_letter", LoveLetterRoom_1.LoveLetterRoom)
    .filterBy(['discordInstanceId']);
app.get(/.*/, (req, res) => {
    res.sendFile(path_1.default.join(clientBuildPath, "index.html"));
});
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
//# sourceMappingURL=index.js.map