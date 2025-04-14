import { nanoid } from "nanoid";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

export const CURRENT_SCHEMA = "2025-03-08";
export const REPEAT_TASK_CHECK_INTERVAL_MS = 1000;

export type PID = string;

export interface ProjectMetadata {
  name: string;
}

export type TID = string;

interface Order {
  order: number,
  cid: number,
}

// add interval
export type NoneRepeatTask = { kind: "none" };
export type IncompleteAfterRepeatTask = { kind: "incomplete-after", duration: number, lastComplete?: number };
export type RepeatTask = NoneRepeatTask | IncompleteAfterRepeatTask;


export interface TaskMetadata {
  repeat: RepeatTask,
}

export type YTask = Y.Map<
  | string // Project
  | string // "description"
  | boolean // "complete"
  | TaskMetadata // "metadata"
  | Order // "order"
>;

export enum YTaskAccessors {
  PROJECT = "project",
  DESCRIPTION = "description",
  COMPLETE = "complete",
  METADATA = "metadata",
  ORDER = "order",
};

export class TaskStore {
  provider: HocuspocusProvider | undefined;
  readonly iddb: IndexeddbPersistence;
  readonly ydoc: Y.Doc;
  // (nanoid -> YTask)
  readonly ytasks: Y.Map<YTask>;
  readonly yprojectmetadata: Y.Map<ProjectMetadata>;
  readonly yschema: Y.Map<any>;
  private constructor(id: string) {
    // Fully local constructor
    this.ydoc = new Y.Doc();
    this.iddb = new IndexeddbPersistence(id, this.ydoc);
    this.ytasks = this.ydoc.getMap<YTask>("yjs-tasks");
    this.yprojectmetadata = this.ydoc.getMap<ProjectMetadata>(
      "yjs-project-metadata",
    );
    this.yschema = this.ydoc.getMap<any>("schema");
  }

  maxSchema(): string | undefined {
    const max_schema = Array.from(this.yschema.keys())
      .reduce(
        (prev: string | undefined, curr: string, _idx, _arr): string | undefined => {
          if (!prev) {
            return curr
          }
          if (prev < curr) {
            return curr;
          }
          return prev;
        },
        undefined);
    return max_schema;
  }

  static make(url: string, id: string, token: string) {
    const ts = new TaskStore(id);
    ts.iddb.on('synced', () => {
      const on_load_doc_schema = ts.maxSchema();
      if (on_load_doc_schema) {
        ts.yschema.observe(() => {
          const newMaxSchema = ts.maxSchema() as string;
          if (newMaxSchema > on_load_doc_schema) {
            console.log("ERR: MUST UPGRADE SCHEMA");
          }
        });
      }
      // Invalidate everyone older
      ts.yschema.set(CURRENT_SCHEMA, "");
    });

    // hook up remote
    ts.provider = new HocuspocusProvider({
      document: ts.ydoc,
      url: url,
      name: id,
      token: token
    });

    return ts;
  }

  getTIDs(pid: string): TID[] {
    return Array.from(this.ytasks.keys())
      .filter((tid: string) => this.ytasks.get(tid)?.get(YTaskAccessors.PROJECT) === pid)
      .sort((tid1: string, tid2: string) => {
        const o1 = this.ytasks.get(tid1)?.get(YTaskAccessors.ORDER) as Order;
        const o2 = this.ytasks.get(tid2)?.get(YTaskAccessors.ORDER) as Order;
        if (o1 && o2) {
          if (o1.order != o2.order) {
            return o1.order - o2.order;
          }
          if (o1.cid != o2.cid) {
            return o1.cid - o2.cid;
          }
          return 0
        }
        return 0;
      });
  }

  addProject(name?: string | undefined): PID {
    while (true) {
      var pid = nanoid();
      if (this.yprojectmetadata.has(pid)) {
        continue;
      }
      this.yprojectmetadata.set(pid, {
        name: name ?? ""
      });
      break;
    }
    return pid;
  }

  defaultTaskField(field: YTaskAccessors): any {
    switch (field) {
      case YTaskAccessors.PROJECT: {
        throw new Error("Cannot have a default value for PROJECT")
      }
      case YTaskAccessors.DESCRIPTION: {
        return "";
      }
      case YTaskAccessors.COMPLETE: {
        return false;
      }
      case YTaskAccessors.METADATA: {
        return {
          repeat: {
            "kind": "Never"
          },
        };
      }
      case YTaskAccessors.ORDER: {
        return 0;
      }
      default:
        throw new Error(`Could not find default for field: ${field}`);
    }
  }

  getTaskField(tid: TID, field: YTaskAccessors): any {
    const task = this.ytasks.get(tid);
    if (!task) {
      throw new Error(`Unknown task ${tid}`);
    }
    return task.get(field) ?? this.defaultTaskField(field);
  }

  // TODO arbitrary precision based on div by 2 (0=0,1=1,01=0.5,001=0.25,011=0.75
  // 01 vs 001 => 010 vs 001 => 011 / 2 => 0011
  // 1 vs 0 => 1 / 2 => 01
  // 1 vs 1 => 10 => 1 
  computeOrder = (prevId?: TID, nextId?: TID): Order => {
    const low = (prevId ? (this.ytasks.get(prevId)?.get(YTaskAccessors.ORDER) as Order).order : null) ?? (0);
    const high = (nextId ? (this.ytasks.get(nextId)?.get(YTaskAccessors.ORDER) as Order).order : null) ?? (1);

    const cid = this.ydoc.clientID;

    return { order: ((low as number) + (high as number)) / 2, cid: cid };
  };

  addTask(pid: PID): TID {
    const tids = this.getTIDs(pid);
    // Sorted so can just grab last one
    const last_tid = tids[tids.length - 1];
    const order = this.computeOrder(last_tid);
    const tid = nanoid();
    const task: YTask = new Y.Map();
    task.set(YTaskAccessors.PROJECT, pid);
    task.set(YTaskAccessors.DESCRIPTION, "");
    task.set(YTaskAccessors.COMPLETE, false);
    task.set(YTaskAccessors.METADATA, { repeat: { kind: "none" } });
    task.set(YTaskAccessors.ORDER, order);
    this.ytasks.set(tid, task);
    return tid;
  };

  moveTask(tid: TID, dst_pid: PID, prevId?: TID, nextId?: TID) {
    const order = this.computeOrder(prevId, nextId);
    const task = this.ytasks.get(tid);
    if (task) {
      task.set(YTaskAccessors.PROJECT, dst_pid);
      task.set(YTaskAccessors.ORDER, order);
    }
  }
}

