import * as fs from 'fs'
import { Server } from "@hocuspocus/server";
import express from "express";
import expressWebsockets from "express-ws";
import {SQLite} from "@hocuspocus/extension-sqlite";

const args = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(args[0], 'utf8'));

if (args.length > 1) {
  config.port = Number(args[1]);
}

if (!config.port) {
  config.port = 5000;
}
if (!config.documents) {
  throw new Error("Missing documents field in config");
}
if (!config.static) {
  throw new Error("Missing static field in config");
}
if (!config.database) {
  throw new Error("Missing database path in config");
}

const server = Server.configure({
  async onAuthenticate(data) {
    const {documentName, token} = data;

    if (!config.documents[documentName]?.includes(token)) {
      throw new Error("Not authorized");
    }
  },
  extensions: [
    new SQLite({
      database: config.database
    }),
  ],
});

const {app} = expressWebsockets(express());
app.use(express.static(config.static));

app.ws("/api/test", async (websocket, request) => {
  server.handleConnection(websocket, request);
});

app.ws("/api/docs", async (websocket, request) => {
  server.handleConnection(websocket, request);
});

app.listen(config.port, () => console.log("Listening on http://127.0.0.1:" + config.port));
