import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { type ChangeEvent, type FC, useCallback } from "react";
import styles from "./TaskItem.module.css";
import {
  type YTask,
  TaskStore,
  YTaskAccessors,
} from "../taskStore";
import { useY } from "react-yjs";
import { DragHandleSVG, DeleteHandleSVG } from "../assets/SvgHandles";

export const TaskItem: FC<{ taskstore: TaskStore, tid: string }> = ({ taskstore, tid }) => {
  // render dnd drag
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: tid });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  useY(taskstore.ytasks.get(tid) as YTask);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    taskstore.ytasks.get(tid)?.set(YTaskAccessors.DESCRIPTION, event.target.value);
  }, []);
  const handleCheck = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    taskstore.ytasks.get(tid)?.set(YTaskAccessors.COMPLETE, event.target.checked);
  }, []);
  const handleDelete = useCallback((_: any) => {
    taskstore.ytasks.delete(tid);
  }, []);

  const move_or_delete_handle = !taskstore.getTaskField(tid, YTaskAccessors.COMPLETE) ? (
    <button
      type="button"
      className={`${styles.button} ${styles.movehandle}`}
      {...listeners}
      {...attributes}
    >
      <DragHandleSVG />
    </button>
  ) : (
    <button
      type="button"
      className={`${styles.button} ${styles.deletehandle}`}
      onClick={handleDelete}
    >
      <DeleteHandleSVG />
    </button>
  );

  return (
    <li
      className={`${styles.listitem} ${isDragging ? styles.isDragging : ""}`}
      ref={setNodeRef}
      style={style}
    >
      <div>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={taskstore.getTaskField(tid, YTaskAccessors.COMPLETE) as boolean}
          onChange={handleCheck}
        />
      </div>
      <input
        className={styles.input}
        value={taskstore.getTaskField(tid, YTaskAccessors.DESCRIPTION) as string}
        onChange={handleChange}
      />
      {move_or_delete_handle}
    </li>
  );
};
