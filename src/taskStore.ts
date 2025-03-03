import { nanoid } from "nanoid";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import * as A from "./accessors";

const ydoc = new Y.Doc();
new WebsocketProvider("ws://localhost:1234", "yjs-todo", ydoc);

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

// Just a set
export const yprojects = ydoc.getMap<Y.Map<string>>("yjs-projects");

export const projectTids = (pid: string): string[] =>
  Array.from(yprojects.get(pid)?.keys() ?? [])
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
  if (!yprojects.has(pid)) {
    yprojects.set(pid, new Y.Map<string>());
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
  yprojects.get(pid)?.set(tid, "");
  console.log("Adding", tid, task.toJSON());
};

export const updateTask = (tid: string, value: string) => {
  ytasks.get(tid)?.set(A.DESCRIPTION, value);
};

export const moveTask = (
  tid: string,
  pid: string,
  prevId?: string,
  nextId?: string,
) => {
  console.log(tid, pid, prevId, nextId);
  const order = computeOrder(prevId, nextId);
  const task = ytasks.get(tid);
  if (task) {
    const prev_pid = task.get(A.PROJECT) as string;
    console.log(tid, prev_pid, pid);
    task.set(A.PROJECT, pid);
    task.set(A.ORDER, order);
    yprojects.get(prev_pid)?.delete(tid);
    yprojects.get(pid)?.set(tid, "");
  }
};
