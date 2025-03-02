
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { type ChangeEvent, type FC, useCallback } from "react";
import styles from "./TaskItem.module.css";
import { updateTask, updateTaskCheck } from "./taskStore";
import type { Task } from "./types";

interface Props {
  task: Task;
}

export const TaskItem: FC<Props> = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateTask(task.id, event.target.value);
    },
    [task],
  );
  const handleCheck = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateTaskCheck(task.id, event.target.checked);
    },
    [task],
  );

  return (
    <li 
      className={`${styles.listitem} ${isDragging ? styles.isDragging : ""}`}
      ref={setNodeRef}
      style={style}
    >
      <input type='checkbox' className={styles.checkbox} checked={task.check} onChange={handleCheck}/>
      <input className={styles.input} value={task.value} onChange={handleChange} />
      <button type="button" className={styles.button} {...listeners} {...attributes}>
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

