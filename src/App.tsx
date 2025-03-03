import type { FC } from "react";
import styles from "./App.module.css";
import { Project } from "./Project";
import {AddProjectButton} from "./AddProjectButton";
import { DndProvider } from "./dnd/DndProvider";
import { useY } from "react-yjs";
import {yprojects} from "./taskStore.ts";

const App: FC = () => {
  useY(yprojects);

  return (
    <DndProvider>
      <div className={styles.wrapper}>
        <h1 className={styles.heading}>Jensen-King Todos</h1>
        <div className={styles.grid}>
          { Array.from(yprojects.keys()).map((pid, _) => 
            <Project pid={pid} key={pid} /> 
          )}
        </div>
        <AddProjectButton />
      </div>
    </DndProvider>
  );
};

export default App;
