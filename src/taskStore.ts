import { nanoid } from "nanoid";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import * as A from "./accessors";

const ydoc = new Y.Doc();
const docName = "yjs-todo";
new WebsocketProvider("ws://localhost:1234", docName, ydoc);
new IndexeddbPersistence(docName, ydoc);

interface TaskMetadata {}

export type YTask = Y.Map<
  | string // Project
  | string // "description"
  | boolean // "complete"
  | TaskMetadata // "metadata"
  | number // "order"
>;
// (nanoid -> YTask)
export const ytasks = ydoc.getMap<YTask>("yjs-tasks");

export interface ProjectMetadata {
  name: string;
}
export const yprojectmetadata = ydoc.getMap<Y.Map<string>>(
  "yjs-project-metadata",
);

export const projectTids = (pid: string): string[] =>
  Array.from(ytasks.keys())
    .filter((tid: string) => ytasks.get(tid)?.get(A.PROJECT) === pid)
    .sort((tid1: string, tid2: string) => {
      const o1 = ytasks.get(tid1)?.get(A.ORDER);
      const o2 = ytasks.get(tid2)?.get(A.ORDER);
      if (o1 && o2) {
        return (o1 as number) - (o2 as number);
      }
      return 0;
    });

export const addProject = () => {
  const pid = nanoid();
  if (!yprojectmetadata.has(pid)) {
    yprojectmetadata.set(pid, {
      name: "",
    });
  }
};

// TODO arbitrary precision int
export const computeOrder = (prevId?: string, nextId?: string): number => {
  const prevOrder = (prevId ? ytasks.get(prevId)?.get(A.ORDER) : null) ?? 0;
  const nextOrder = (nextId ? ytasks.get(nextId)?.get(A.ORDER) : null) ?? 1;

  // TODO jitter
  return ((prevOrder as number) + (nextOrder as number)) / 2;
};

export const addTask = (pid: string) => {
  const tids = projectTids(pid);
  const last_tid = tids[tids.length - 1];
  const order = computeOrder(last_tid);
  const tid = nanoid();
  const task: YTask = new Y.Map();
  task.set(A.PROJECT, pid);
  task.set(A.DESCRIPTION, "");
  task.set(A.COMPLETE, false);
  task.set(A.METADATA, {});
  task.set(A.ORDER, order);
  ytasks.set(tid, task);
};

export const updateTask = (tid: string, value: string) => {
  ytasks.get(tid)?.set(A.DESCRIPTION, value);
};

export const updateTaskComplete = (tid: string, complete: boolean) => {
  ytasks.get(tid)?.set(A.COMPLETE, complete);
};

export const moveTask = (
  tid: string,
  pid: string,
  prevId?: string,
  nextId?: string,
) => {
  const order = computeOrder(prevId, nextId);
  const task = ytasks.get(tid);
  if (task) {
    const prev_pid = task.get(A.PROJECT) as string;
    task.set(A.PROJECT, pid);
    task.set(A.ORDER, order);
  }
};
