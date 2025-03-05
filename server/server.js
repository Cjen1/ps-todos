import * as fs from 'fs'
import { Server } from "@hocuspocus/server";
import { WebSocketExpress, Router } from 'websocket-express';

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
  async onConnect(data) {
    console.log("New connection");
  }
});

const app = new WebSocketExpress();
app.use(WebSocketExpress.static(config.static));

const router = new Router();

router.ws("/api/test", async (websocket, request) => {
  server.handleConnection(websocket, request);
});

router.ws("/api/docs", async (websocket, request) => {
  console.log(request);
  const docId = request?.req?.query?.id;
  server.handleConnection(websocket, request, {id: docId});
//  if (docId && config.documents?.includes(docId)) {
//    console.log("Handling request to " + docId); 
//    server.handleConnection(websocket, request, {});
//  } else {
//    console.log("Invalid docId");
//    throw new Error("Invalid request");
//  }
});

app.use(router)

app.listen(config.port, () => console.log("Listening on http://127.0.0.1:" + config.port));
