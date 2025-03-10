import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { type ChangeEvent, type FC, useCallback, useState, useEffect } from "react";
import styles from "./TaskItem.module.css";
import {
  type YTask,
  TaskStore,
  YTaskAccessors,
  REPEAT_TASK_CHECK_INTERVAL_MS,
  RepeatTask,
  TaskMetadata,
  TID,
  IncompleteAfterRepeatTask
} from "../taskStore";
import { useY } from "react-yjs";
import { DragHandleSVG, DeleteHandleSVG } from "../assets/SvgHandles";
import TextareaAutosize from "react-textarea-autosize";
import useLongPress from "./useLongPress";


export const TaskItem: FC<{ taskstore: TaskStore, tid: TID }> = ({ taskstore, tid }) => {
  useY(taskstore.ytasks.get(tid) as YTask);

  // ---- Settings ----
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      const repeat_meta = taskstore.getTaskField(tid, YTaskAccessors.METADATA)?.["repeat"];
      switch (repeat_meta?.["repeat"]?.kind) {
        case undefined:
        case "none": {
          return;
        }
        case "incomplete-after": {
          const last_complete = repeat_meta?.["repeat"]?.lastComplete;
          const duration: number = repeat_meta?.["repeat"]?.duration;

          const is_complete = taskstore.getTaskField(tid, YTaskAccessors.COMPLETE) as boolean;
          const should_uncheck = last_complete && duration && last_complete + duration > Date.now();
          if (is_complete && should_uncheck) {
            const new_repeat: RepeatTask = {
              kind: "incomplete-after",
              duration: duration,
            };
            taskstore.ydoc.transact(() => {
              taskstore.ytasks.get(tid)?.set(YTaskAccessors.COMPLETE, false);
              taskstore.ytasks.get(tid)?.set(YTaskAccessors.METADATA, { ...repeat_meta, repeat: new_repeat });
            });
          }
          return;
        }
      }
    }, REPEAT_TASK_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  });

  const meta: TaskMetadata = taskstore.getTaskField(tid, YTaskAccessors.METADATA);

  const createIncompleteAfter = (): IncompleteAfterRepeatTask => {
    const meta_repeat = meta?.repeat ?? { kind: 'none' };
    let current_lastComplete = meta_repeat.kind === "incomplete-after" ? meta_repeat.lastComplete : undefined;
    let new_lastComplete = current_lastComplete ?? (
      taskstore.getTaskField(tid, YTaskAccessors.COMPLETE) ? Date.now() : undefined
    );
    return {
      kind: "incomplete-after",
      duration: 1,
      lastComplete: new_lastComplete
    };

  };

  const meta_repeat = meta?.repeat ?? { kind: 'none' };
  const repeat_kind = meta_repeat?.kind ?? 'none';

  const handleRepeatTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRepeatType = event.target.value;
    if (newRepeatType === "none") {
      taskstore.ytasks.get(tid)?.set(YTaskAccessors.METADATA, { ...meta, repeat: { kind: "none" } });
    } else if (newRepeatType === "incomplete-after") {
      taskstore.ytasks.get(tid)?.set(YTaskAccessors.METADATA, { ...meta, repeat: createIncompleteAfter() });
    }
  }, []);

  const handleRepeatDaysChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const days = Number(event.target.value);
    if (!isNaN(days)) {
      let new_repeat = createIncompleteAfter();
      new_repeat.duration = days;

      taskstore.ytasks.get(tid)?.set(YTaskAccessors.METADATA, { ...meta, repeat: new_repeat });
    }
  }, []);

  const settingsComponent = isSettingsOpen && (
    <div className={styles["settings-overlay"]}>
      <div className={styles["settings"]}>
        <h2> Settings </h2>
        <div>
          <label htmlFor="repeat-type-select">Repeat:</label>
          <select
            id="repeat-type-select"
            value={repeat_kind}
            onChange={handleRepeatTypeChange}
          >
            <option value="none">None</option>
            <option value="incomplete-after">Incomplete After</option>
          </select>
        </div>
        {repeat_kind !== 'none' && (
          <div>
            <input
              type="number"
              id="repeat-days-input"
              min="1"
              value={meta_repeat.kind === 'incomplete-after' ? meta_repeat.duration : 1}
              onChange={handleRepeatDaysChange}
              placeholder="Days"
            />
          </div>
        )}
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
    () => { console.log("Opening settings"); setIsSettingsOpen(true); },
    // On click
    () => taskstore.ydoc.transact(() => {
      const new_task_complete_status = !taskstore.getTaskField(tid, YTaskAccessors.COMPLETE) as boolean;
      taskstore.ytasks.get(tid)?.set(YTaskAccessors.COMPLETE, new_task_complete_status);
      const meta = taskstore.ytasks.get(tid)?.get(YTaskAccessors.METADATA) as TaskMetadata;
      if (meta.repeat.kind === "incomplete-after" && new_task_complete_status) {
        var new_repeat: IncompleteAfterRepeatTask = meta.repeat;
        new_repeat.lastComplete = Date.now();
        taskstore.ytasks.get(tid)?.set(YTaskAccessors.METADATA, { ...meta, new_repeat });
      }
    }),
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
