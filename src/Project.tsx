import { type FC, Fragment } from "react";
import { AddTaskButton } from "./AddTaskButton";
import styles from "./Project.module.css";
import { TaskItem } from "./TaskItem";
import { DroppableMarker } from "./dnd/DroppableMarker";
import { yprojects, projectTids } from "./taskStore";
import * as Y from "yjs";

import { useY } from "react-yjs";

export const Project: FC<{ pid: string }> = ({ pid }) => {
  // rerender on change to yprojects[pid]
  useY(yprojects.get(pid) as Y.Map<any>);
  const tids = projectTids(pid);

  //return (
  //  <div className={styles.wrapper}>
  //    <h2 className={styles.heading}>{pid}</h2>
  //    <ul className={styles.list}>
  //     <DroppableMarker pid={pid} nextId={tids[0]} />
  //     {tids.map((tid, index) => (
  //       <Fragment key={tid}>
  //         <TaskItem tid={tid} />
  //         <DroppableMarker
  //           key={`${tid}-border`}
  //           project={project}
  //           prevId={tid}
  //           nextId={tids[index + 1]}
  //         />
  //       </Fragment>
  //     ))}
  //    </ul>
  //    <AddTaskButton pid={pid} />
  //  </div>
  //);
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>{pid}</h2>
      <ul className={styles.list}>
        <DroppableMarker pid={pid} nextId={tids[0]} />
        {tids.map((tid, index) => (
          <Fragment key={tid}>
            <TaskItem tid={tid} />
            <DroppableMarker
              key={`${tid}-border`}
              pid={pid}
              prevId={tid}
              nextId={tids[index + 1]}
            />
          </Fragment>
        ))}
      </ul>
      <AddTaskButton pid={pid} />
    </div>
  );
};
