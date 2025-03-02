import type { FC } from "react";
import styles from "./AddTaskButton.module.css";
import { addTask } from "./taskStore";

export const AddTaskButton: FC<{pid : string}> = ({ pid }) => {
  return (
    <button type="button" className={styles.button} onClick={() => addTask(pid)}>
      + Add
    </button>
  );
};

