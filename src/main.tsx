import React from "react";
import ReactDOM from "react-dom/client";
import { isValidAutomergeUrl, Repo } from "@automerge/automerge-repo";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { Dashboard } from "./components/dashboard/store.tsx";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import { Dashboard as App } from "./components/dashboard/dashboard.tsx";

const repo = new Repo({
  // network : ...
  storage: new IndexedDBStorageAdapter(),
})

let hashParams
if (window.location.hash === "") {
  hashParams = new URLSearchParams();
}
else {
  hashParams = new URLSearchParams(window.location.hash.substring(1));
}
const hashDocUrl = hashParams.get('doc');

let handle
if (isValidAutomergeUrl(hashDocUrl)) {
  handle = repo.find(hashDocUrl);
} else {
  handle = repo.create<Dashboard>({name: "TBD", projects: {}});
}
const docUrl = handle.url 
hashParams.set('doc', docUrl);
console.log("hashParams", hashParams.toString());
window.location.hash = hashParams.toString();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RepoContext.Provider value={repo}>
      <App url={docUrl} />
    </RepoContext.Provider>
  </React.StrictMode>
);