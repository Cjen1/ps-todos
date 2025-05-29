import React from "react";
import ReactDOM from "react-dom/client";
import { AutomergeUrl } from "@automerge/automerge-repo";
import { Dashboard } from "./components/dashboard/store.tsx";
import { Dashboard as DashboardApp } from "./components/dashboard/dashboard.tsx";

import {
  isValidAutomergeUrl,
  Repo,
  WebSocketClientAdapter,
  IndexedDBStorageAdapter,
  RepoContext
} from '@automerge/react'

const protocol = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
const repo = new Repo({
  //network: [new WebSocketClientAdapter("wss://sync.automerge.org")],
  network: [new WebSocketClientAdapter(`${protocol}localhost:5000/api/sync`)],
  storage: new IndexedDBStorageAdapter(),
});

let rootDocUrl = `${document.location.hash.substring(1)}`;
let handle;
if (isValidAutomergeUrl(rootDocUrl)) {
  console.log("Trying to find an existing document", rootDocUrl);
  handle = await repo.find(rootDocUrl);
  console.log("Found existing document", handle.url);
} else {
  console.log("Local creation");
  handle = repo.create<Dashboard>({ name: "TBD", projects: {} })
}

const docUrl = document.location.hash = handle.url;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RepoContext.Provider value={repo}>
      <DashboardApp url={docUrl as AutomergeUrl} />
    </RepoContext.Provider>
  </React.StrictMode>
);