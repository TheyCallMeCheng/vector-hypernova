import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { LoveLetterRoom } from "./rooms/LoveLetterRoom";
import path from "path";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

// Serve client static files
const clientBuildPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientBuildPath));

const server = http.createServer(app);
const gameServer = new Server({
    server: server,
});

gameServer.define("love_letter", LoveLetterRoom);

// app.get("(.*)", (req, res) => {
//     res.sendFile(path.join(clientBuildPath, "index.html"));
// });

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
