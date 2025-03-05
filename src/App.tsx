import { type FC, useEffect, useState } from "react";
import styles from "./App.module.css";
import { Project } from "./Project";
import { AddProjectButton } from "./AddProjectButton";
import { DndProvider } from "./dnd/DndProvider";
import { useY } from "react-yjs";
import { yprojectmetadata, provider } from "./taskStore.ts";

const searchParams = new URLSearchParams(window.location.search)
const docId = searchParams.get('id')

type ProviderConnStatus =
  { kind: "Connecting" | "Authenticated" | "Connected" } |
  { kind: "AuthFailed"; reason: string };

const App: FC = () => {
  if (docId) {
    useY(yprojectmetadata);

    const [connState, setConnState] = useState<ProviderConnStatus>({kind: "Connecting"});
    useEffect(()=>{
        provider.on("connect", ()=>setConnState({kind: "Connected"}));
        provider.on("disconnect", ()=>setConnState({kind: "Connecting"}));
        provider.on("authenticated", ()=>setConnState({kind: "Authenticated"}));
        provider.on("authenticationFailed", (reason : string)=>setConnState({kind:"AuthFailed", reason:reason})) ;
    }, []);
    useEffect(()=> console.log(connState), [connState]);

    return (
      <DndProvider>
        <div className={styles.wrapper}>
          <div className={styles.banner}>
            <h1 className={styles.heading}>Jensen-King Todos</h1>
            <h1 className={styles.heading}>{JSON.stringify(connState)}</h1>
          </div>
          <div className={styles.grid}>
            {Array.from(yprojectmetadata.keys()).map((pid, _) => (
              <Project pid={pid} key={pid} />
            ))}
          </div>
          <AddProjectButton />
        </div>
      </DndProvider>
    );
  } else {
    return (
        <div className={styles.wrapper}>
          <h1 className={styles.heading}>Pass ID and Token in URL query</h1>
        </div>
        );
  }
};

export default App;
