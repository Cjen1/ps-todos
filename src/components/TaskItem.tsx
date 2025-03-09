import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { type ChangeEvent, type FC, useCallback, useState } from "react";
import styles from "./TaskItem.module.css";
import {
  type YTask,
  TaskStore,
  YTaskAccessors,
} from "../taskStore";
import { useY } from "react-yjs";
import { DragHandleSVG, DeleteHandleSVG } from "../assets/SvgHandles";
import TextareaAutosize from "react-textarea-autosize";
import useLongPress from "./useLongPress";


export const TaskItem: FC<{ taskstore: TaskStore, tid: string }> = ({ taskstore, tid }) => {
  useY(taskstore.ytasks.get(tid) as YTask);

  // Settings popup

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsComponent = isSettingsOpen && (
    <div className={styles["settings-overlay"]}>
      <div className={styles["settings"]}>
        <h2> Settings for {tid} </h2>
        <button onClick={() => setIsSettingsOpen(false)}>
          Close
        </button>
      </div>
    </div>
  );

  // render dnd drag
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: tid });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const onInput = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    taskstore.ytasks.get(tid)?.set(YTaskAccessors.DESCRIPTION, event.target.value);
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

  const checkbox_callbacks = useLongPress(
    // Long press
    () => { console.log("Opening settings") ;setIsSettingsOpen(true);},
    // On click
    () => taskstore.ytasks.get(tid)?.set(YTaskAccessors.COMPLETE, !taskstore.getTaskField(tid, YTaskAccessors.COMPLETE)),
  );
    
  const checkbox_style = (taskstore.getTaskField(tid, YTaskAccessors.COMPLETE) as boolean) ? styles["complete-checkbox"] : styles["incomplete-checkbox"];

  return (
    <li
      className={`${styles.listitem} ${isDragging ? styles.isDragging : ""}`}
      ref={setNodeRef}
      style={style}
    >
      {settingsComponent}
      <div className={styles['wrapper-checkbox']}>
        <button
          type="button"
          className={`${styles["base-checkbox"]} ${checkbox_style}`}
          {...checkbox_callbacks}
        />
      </div>
      <div className={styles.inputwrapper}>
        <TextareaAutosize
          className={styles.input}
          value={false ? tid : taskstore.getTaskField(tid, YTaskAccessors.DESCRIPTION) as string}
          onChange={onInput}
        />
      </div>
      {move_or_delete_handle}
    </li>
  );
};
