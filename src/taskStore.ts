import { proxy, useSnapshot } from "valtio";
import type { Task, TaskStatus } from "./types";
import { nanoid } from "nanoid";

interface TaskStore {
  [taskId: string]: Task;
}

// TODO arbitrary precision int
const computeOrder = (prevId?: string, nextId?: string): number => {
  const prevOrder = taskStore[prevId ?? ""]?.order ?? 0;
  const nextOrder = nextId ? taskStore[nextId].order : 1;

  // TODO jitter
  return (prevOrder + nextOrder) / 2;
}

export const filteredTasks = (
  status: TaskStatus,
  taskStore: TaskStore
): Task[] => Object.values(taskStore)
.filter((task) => task.status === status)
.sort((a,b) => a.order - b.order);

export const taskStore = proxy<TaskStore>({});

export const useTasks = () => useSnapshot(taskStore);

export const addTask = (status: TaskStatus) => {
  const tasks = filteredTasks(status, taskStore);
  const lastTask = tasks[tasks.length - 1];
  const order = computeOrder(lastTask?.id);
  const id = nanoid();
  taskStore[id] = {
    id,
    status,
    value: "",
    check: false,
    order,
  };
};

export const updateTask = (id: string, value: string) => {
  const task = taskStore[id];
  if (task) {
    task.value = value;
  }
};

export const updateTaskCheck = (id: string, value: boolean) => {
  const task = taskStore[id];
  if (task) {
    task.check = value;
  }
};

export const moveTask = (id: string, status: TaskStatus, prevId?: string, nextId?: string) => {
  const order = computeOrder(prevId, nextId);
  const task = taskStore[id];
  if (task) {
    task.status = status;
    task.order = order;
  }
};
