import type { FC } from "react";
import styles from "./App.module.css";
import { Project } from "./Project";
import { AddProjectButton } from "./AddProjectButton";
import { DndProvider } from "./dnd/DndProvider";
import { useY } from "react-yjs";
import { yprojectmetadata } from "./taskStore.ts";

const searchParams = new URLSearchParams(window.location.search)
const docId = searchParams.get('id')

const App: FC = () => {
  if (docId) {
    useY(yprojectmetadata);

    return (
      <DndProvider>
        <div className={styles.wrapper}>
          <h1 className={styles.heading}>Jensen-King Todos</h1>
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
          <h1 className={styles.heading}>Pass list in URL</h1>
        </div>
        );
  }
};

export default App;
