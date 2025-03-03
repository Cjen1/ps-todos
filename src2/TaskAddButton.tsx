import type { FC } from "react";
import styles from "./TaskAddButton.module.css";
import type { TaskStatus } from "./types";
import { addTask } from "./taskStore";

interface Props {
  status: TaskStatus;
}

export const TaskAddButton: FC<Props> = ({ status }) => {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => addTask(status)}
    >
      + Add
    </button>
  );
};
