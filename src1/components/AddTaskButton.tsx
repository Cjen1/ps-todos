import type { FC } from "react";
import styles from "./AddTaskButton.module.css";
import { TaskStore } from "../taskStore";

export const AddTaskButton: FC<{ taskstore: TaskStore, pid: string }> = ({ taskstore, pid }) => {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => taskstore.addTask(pid)}
    >
      + Add
    </button>
  );
};
