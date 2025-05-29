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

let rootDocUrl = `${document.location.hash.substring(1)}`;

const protocol = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
const sync_url = `${protocol}localhost:5000/api/sync?dashboard=${rootDocUrl}`
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