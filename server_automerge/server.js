import { webcrypto } from 'node:crypto';

// Polyfill crypto.getRandomValues for Automerge
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

import * as fs from 'fs'
import express from "express";
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

console.log(config)

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

console.log("Supported dashboards: ", config.dashboards);

// Create express app without express-ws since we're handling WebSockets manually
const app = express();
app.use(express.static(config.application));

// Create WebSocket server
const wss = new WebSocketServer({
  noServer: true,
});

// automerge repo config
const repo = new Repo({
  network: [new NodeWSServerAdapter(wss)],
  storage: new NodeFSStorageAdapter(config.database),
  sharePolicy: async () => false, // Don't actively share any documents
});

// Create HTTP server
const server = app.listen(config.port, () => 
  console.log("Listening on http://127.0.0.1:" + config.port)
);

// Handle WebSocket upgrades
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  // Check if the request is for the /api/sync path
  if (url.pathname !== '/api/sync') {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }

  const dashboard = url.searchParams.get("dashboard");

  if (!dashboard) {
    console.error(`Unable to parse dashboard from websocket request: ${url}`)
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  if (!(dashboard in config.dashboards)) {
    console.error(`Unauthorized access attempt to dashboard: ${dashboard} from ${request.socket.remoteAddress}`);
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  console.log(`WebSocket connection for dashboard: ${dashboard} from ${request.socket.remoteAddress}`);

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

