import { type ChangeEvent, type FC, useCallback } from "react";
import styles from "./TaskItem.module.css";
import { ytasks, type YTask} from "./taskStore";
import {useY} from "react-yjs";
import * as A from "./accessors";

export const TaskItem: FC<{tid: string}> = ({ tid }) => {

  const task = ytasks.get(tid) as YTask;
  useY(task);

  const handleChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>) => {
      //updateTask(task.tid, event.target.value);
    },
    [task],
  );
  const handleCheck = useCallback(
    (_event: ChangeEvent<HTMLInputElement>) => {
      //updateTaskCheck(task.tid, event.target.checked);
    },
    [task],
  );

  const isDragging = false;

  return (
    <li 
      className={`${styles.listitem} ${isDragging ? styles.isDragging : ""}`}
    >
      <input type='checkbox' className={styles.checkbox} checked={task.get(A.COMPLETE) as boolean} onChange={handleCheck}/>
      <input className={styles.input} value={task.get(A.DESCRIPTION) as string} onChange={handleChange} />
      <button type="button" className={styles.button}>
        <svg
          width="24"
          height="24"
          viewBox="6 0 12 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Drag</title>
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </button>
    </li>
  );
};

