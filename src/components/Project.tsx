import { type FC, Fragment, useCallback, ChangeEvent } from "react";
import styles from "./Project.module.css";
import { TaskItem } from "./TaskItem";
import { DroppableMarker } from "./dnd/DroppableMarker";
import { TaskStore, PID, YTaskAccessors, ProjectMetadata } from "../taskStore";
import { AddTaskButton } from "./AddTaskButton";

import { useY } from "react-yjs";

export const Project: FC<{ taskstore: TaskStore, pid: PID }> = ({ taskstore, pid }) => {
  useY(taskstore.yprojectmetadata);
  useY(taskstore.ytasks);

  const tids = taskstore.getTIDs(pid);
  const incomplete_tids = tids.filter(
    (tid) => !taskstore.getTaskField(tid, YTaskAccessors.COMPLETE)
  );
  const complete_tids = tids.filter(
    (tid) => taskstore.getTaskField(tid, YTaskAccessors.COMPLETE)
  );

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      taskstore.yprojectmetadata.set(pid, { name: event.target.value });
    },
    [],
  );

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>
        <input
          className={styles.input}
          value={(taskstore.yprojectmetadata.get(pid) as ProjectMetadata).name}
          onChange={handleNameChange}
        />
      </h2>
      <ul className={styles.list}>
        <DroppableMarker pid={pid} nextId={incomplete_tids[0]} />
        {incomplete_tids.map((tid, index) => (
          <Fragment key={tid}>
            <TaskItem taskstore={taskstore} tid={tid} />
            <DroppableMarker
              key={`${tid}-border`}
              pid={pid}
              prevId={tid}
              nextId={incomplete_tids[index + 1]}
            />
          </Fragment>
        ))}
      </ul>
      <AddTaskButton taskstore={taskstore} pid={pid} />
      <ul>
        {complete_tids.map((tid, _) => (
          <TaskItem key={tid} taskstore={taskstore} tid={tid} />
        ))}
      </ul>
    </div>
  )
};
