import * as fs from 'fs'
import express from "express";
import expressWebsockets from "express-ws";
import { WebSocketServer } from "ws";
import { Repo } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"
import os from "os";

const args = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(args[0], 'utf8'));

if (args.length > 1) {
  config.database = args[1]
}

if (!config.database) {
  throw new Error("Missing database field in config");
}
if (!fs.existsSync(config.database)) {
  fs.mkdirSync(config.database);
}

if (!config.port) {
  config.port = 5000;
}
if (!config.dashboards) {
  throw new Error("Missing users field in config");
}
if (!config.application) {
  throw new Error("Missing application field in config");
}

// Serve the app from a relative path
const { app } = expressWebsockets(express());
app.use(express.static(config.application));

const socket = new WebSocketServer({
  noServer: true,
});

// automerge repo config
const repo = new Repo({
  network: [new NodeWSServerAdapter(socket)],
  //storage: new NodeFSStorageAdapter(config.database),
  sharePolicy: async () => false, // Don't actively share any documents
});

app.on("connection", (ws, req) => {
  console.log(`New connection from ${req.socket.remoteAddress} to ${req.url}`);
});

app.on("upgrade", (request, socket, head) => {
  console.log("Received websocket upgrade request to " + request.url);
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});

app.listen(config.port, () => console.log("Listening on http://127.0.0.1:" + config.port));
