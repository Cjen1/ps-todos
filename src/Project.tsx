import { type FC, Fragment, useCallback } from "react";
import { AddTaskButton } from "./AddTaskButton";
import styles from "./Project.module.css";
import { TaskItem } from "./TaskItem";
import { DroppableMarker } from "./dnd/DroppableMarker";
import {
  ytasks,
  projectTids,
  yprojectmetadata,
  updateProjectName,
} from "./taskStore";
import * as Y from "yjs";
import * as A from "./accessors.ts";

import { useY } from "react-yjs";

export const Project: FC<{ pid: string }> = ({ pid }) => {
  if (!yprojectmetadata.has(pid)) {
    yprojectmetadata.set(pid, { name: "" });
  }
  // rerender on change to yprojects[pid]
  useY(yprojectmetadata);
  useY(ytasks);
  const tids = projectTids(pid);
  const incomplete_tids = tids.filter(
    (tid) => !ytasks.get(tid)?.get(A.COMPLETE),
  );
  const complete_tids = tids.filter((tid) => ytasks.get(tid)?.get(A.COMPLETE));

  const handleNameChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>) => {
      const metadata = yprojectmetadata.get(pid);
      yprojectmetadata.set(pid, { name: event.target.value });
    },
    [],
  );

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>
        <input
          className={styles.input}
          value={(yprojectmetadata.get(pid) as ProjectMetadata).name}
          onChange={handleNameChange}
        />
      </h2>
      <ul className={styles.list}>
        <DroppableMarker pid={pid} nextId={incomplete_tids[0]} />
        {incomplete_tids.map((tid, index) => (
          <Fragment key={tid}>
            <TaskItem tid={tid} />
            <DroppableMarker
              key={`${tid}-border`}
              pid={pid}
              prevId={tid}
              nextId={incomplete_tids[index + 1]}
            />
          </Fragment>
        ))}
      </ul>
      <AddTaskButton pid={pid} />
      <ul>
        {complete_tids.map((tid, _) => (
          <TaskItem key={tid} tid={tid} />
        ))}
      </ul>
    </div>
  );
};
