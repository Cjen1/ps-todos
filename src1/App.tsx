import { type FC, useEffect, useState } from "react";
import styles from "./App.module.css";
import { TaskStore } from "./taskStore";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { DndProvider } from "./components/dnd/DndProvider";
import { Project } from "./components/Project";
import {AddProjectButton} from "./components/AddProjectButton";
import { useY } from "react-yjs";

type ProviderConnStatus =
  { kind: "Connecting" | "Authenticated" | "Connected" } |
  { kind: "AuthFailed"; reason: string };

const useConnState = (provider: HocuspocusProvider) => {
  const [connState, setConnState] = useState<ProviderConnStatus>({ kind: "Connecting" });
  useEffect(() => {
    provider.on("connect", () => setConnState({ kind: "Connected" }));
    provider.on("disconnect", () => setConnState({ kind: "Connecting" }));
    provider.on("authenticated", () => setConnState({ kind: "Authenticated" }));
    provider.on("authenticationFailed", (reason: string) => setConnState({ kind: "AuthFailed", reason: reason }));
  }, []);
  useEffect(() => console.log(connState), [connState]);
  return connState;
}

const ProviderState: FC<{ provider: HocuspocusProvider | undefined }> = ({ provider }) => {
  if (provider) {
    const connState = useConnState(provider);
    return (
      <h1 className={styles.heading}>{JSON.stringify(connState)}</h1>
    );
  } else {
    <h1 className={styles.heading}>Not connected</h1>
  }
}

function TodosApp(docId: string, docToken: string): FC {
  const protocol = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
  const url = `${protocol}${window.location.host}/api/docs`;
  const taskstore = TaskStore.make(url, docId, docToken);
  const provider = taskstore.provider;
  return () => {
    useY(taskstore.yprojectmetadata);
    return (
      <DndProvider taskstore={taskstore}>
        <div className={styles.wrapper}>
          <div className={styles.banner}>
            <h1 className={styles.heading}>Jensen-King Todos</h1>
            <ProviderState provider={provider} />
          </div>
          <div className={styles.main}>
            {
              Array.from(taskstore.yprojectmetadata.keys()).map((pid, _) => (
                <Project taskstore={taskstore} pid={pid} key={pid} />
              ))
            }
          </div>
          <AddProjectButton taskstore={taskstore}/>
        </div>
      </DndProvider>
    );
  };
}
const WaitApp = () => {
  return () => {
    return (
      <div className={styles.wrapper}>
        <h1 className={styles.heading}>Pass ID and Token in URL query</h1>
      </div>
    );
  };
}

const searchParams = new URLSearchParams(window.location.search)
const docId = searchParams.get('id')
const docToken = searchParams.get('token');
export const App: FC = docId && docToken ? TodosApp(docId, docToken) : WaitApp();
