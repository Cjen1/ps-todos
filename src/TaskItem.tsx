import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { type ChangeEvent, type FC, useCallback } from "react";
import styles from "./TaskItem.module.css";
import {
  ytasks,
  type YTask,
  updateTask,
  updateTaskComplete,
} from "./taskStore";
import { useY } from "react-yjs";
import * as A from "./accessors";

export const TaskItem: FC<{ tid: string }> = ({ tid }) => {
  // render dnd drag
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: tid });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const task = ytasks.get(tid) as YTask;
  useY(task);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    updateTask(tid, event.target.value);
  }, []);
  const handleCheck = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    updateTaskComplete(tid, event.target.checked);
  }, []);
  const handleDelete = useCallback((_: any) => {
    ytasks.delete(tid);
  }, []);

  const move_or_delete_handle = !ytasks.get(tid)?.get(A.COMPLETE) ? (
    <button
      type="button"
      className={styles.button}
      {...listeners}
      {...attributes}
    >
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
  ) : (
    <button type="button" className={styles.button} onClick={handleDelete}>
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
        <title>Delete</title>
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="19" r="1" />

        <circle cx="14" cy="12" r="1" />

        <circle cx="18" cy="5" r="1" />
        <circle cx="18" cy="19" r="1" />
      </svg>
    </button>
  );

  return (
    <li
      className={`${styles.listitem} ${isDragging ? styles.isDragging : ""}`}
      ref={setNodeRef}
      style={style}
    >
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={task.get(A.COMPLETE) as boolean}
        onChange={handleCheck}
      />
      <input
        className={styles.input}
        value={task.get(A.DESCRIPTION) as string}
        placeholder="Lorem ipsum"
        onChange={handleChange}
      />
      {move_or_delete_handle}
    </li>
  );
};
