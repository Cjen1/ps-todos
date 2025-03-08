import type { FC } from "react";
import styles from "./AddProjectButton.module.css";
import { TaskStore } from "../taskStore";

export const AddProjectButton: FC<{taskstore: TaskStore}> = ({taskstore}) => {
  // optimally some kind of popup
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => taskstore.addProject()}
    >
      + Add Project
    </button>
  );
};
