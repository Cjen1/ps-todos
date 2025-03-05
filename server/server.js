import * as fs from 'fs'
import { Server } from "@hocuspocus/server";
import express from "express";
import expressWebsockets from "express-ws";

const args = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(args[0], 'utf8'));

if (!config.port) {
  throw new Error("Missing port number in config")
}
if (!config.documents) {
  throw new Error("Missing documents field in config")
}
if (!config.static) {
  throw new Error("Missing static field in config")
}

const server = Server.configure({
  async onAuthenticate(data) {
    const {documentName, token} = data;

    if (!config.documents[documentName]?.includes(token)) {
      throw new Error("Not authorized");
    }
  }
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
