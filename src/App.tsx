import { type FC, useEffect, useState } from "react";
import styles from "./App.module.css";
import { TaskStore } from "./taskStore";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { DndProvider } from "./dnd/DndProvider";

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
}

const ProviderState: FC<{ provider: HocuspocusProvider }> = ({ provider }) => {
  const connState = useConnState(provider);
  return (
    <h1 className={styles.heading}>{JSON.stringify(connState)}</h1>
  );
}

async function TodosApp(docId: string, docToken: string) : Promise<FC> {
  const url = "TODO"; // TODO 
  const taskStore = await TaskStore.make(url, docId, docToken);
  const provider = await taskStore.provider;
  return () => {
    return (
      <DndProvider taskstore={taskStore}>
        <div className={styles.wrapper}>
          <div className={styles.banner}>
            <h1 className={styles.heading}>Jensen-King Todos</h1>
            <ProviderState provider={provider}/>
          </div>
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
export const App: FC = docId && docToken ? await TodosApp(docId, docToken) : WaitApp();
