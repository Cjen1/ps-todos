import type { FC } from "react";
import styles from "./AddTaskButton.module.css";
import { addProject } from "./taskStore";

export const AddProjectButton: FC<> = () => {
  // optimally some kind of popup
  return (
    <button type="button" className={styles.button} onClick={() => addProject()}>
      + Add Project
    </button>
  );
};
