import React from "react";
import ReactDOM from "react-dom/client";
import { Repo, AutomergeUrl, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { Dashboard } from "./components/dashboard/store.tsx";
import { Dashboard as DashboardApp } from "./components/dashboard/dashboard.tsx";

import {
//  isValidAutomergeUrl,
//  Repo,
  WebSocketClientAdapter,
  IndexedDBStorageAdapter,
  RepoContext
} from '@automerge/react'
//import { WebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'

let rootDocUrl = `${document.location.hash.substring(1)}`;

const protocol = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
const sync_url = `${protocol}${window.location.host}/api/sync?dashboard=${rootDocUrl}`;
//const sync_url = `wss://sync.automerge.org`;
const repo = new Repo({
  network: [new WebSocketClientAdapter(sync_url)],
  storage: new IndexedDBStorageAdapter(),
});

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