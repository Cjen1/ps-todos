import { updateText, ChangeFn } from '@automerge/react'
import { Project } from '../project/store';
import { AutomergeUrl } from '@automerge/automerge-repo';

export type NoneRepeatTask = { kind: "none" };
export type IncompleteAfterRepeatTask = { kind: "incomplete-after", duration: number, lastComplete?: number };
export type RepeatTask = NoneRepeatTask | IncompleteAfterRepeatTask;

export type Task = {
    description: string;
    completed: number | null;
    repeat: RepeatTask;
}

export function isRepeatTask(obj: any): obj is RepeatTask {
    if (typeof obj !== "object" || obj === null) {
        console.log("isRepeatTask: not an object or null");
        return false;
    }
    if (!("kind" in obj) || typeof obj.kind !== "string") {
        console.log("isRepeatTask: 'kind' not present or not a string");
        return false;
    }
    if (!(obj.kind === "none" || obj.kind === "incomplete-after")) {
        console.log(`isRepeatTask: 'kind' ${obj.kind} not a valid repeat type`);
        return false;
    }
    if (obj.kind === "none") {
        return true;
    }
    if (obj.kind === "incomplete-after") {
        if (!("duration" in obj) || typeof obj.duration !== "number") {
            console.log("isRepeatTask: 'duration' not present or not a number");
            return false;
        }
        if ("lastComplete" in obj && (typeof obj.lastComplete !== "number" && obj.lastComplete !== undefined)) {
            console.log("isRepeatTask: 'lastComplete' not a number or undefined");
            return false;
        }
        return true;
    }
    console.log("isRepeatTask: unknown error");
    return false;
}

export function isTask(obj: any): obj is Task {
    if (typeof obj !== "object" || obj === null) {
        console.log("isTask: not an object or null");
        return false;
    }
    if (!("description" in obj) || typeof obj.description !== "string") {
        console.log("isTask: 'description' not present or not a string");
        return false;
    }
    if (!("completed" in obj) || (typeof obj.completed !== "number" && obj.completed !== null)) {
        console.log("isTask: 'completed' not present or not a number or null");
        return false;
    }
    if (!("repeat" in obj) || !isRepeatTask(obj.repeat)) {
        console.log("isTask: 'repeat' not present or not a valid RepeatTask");
        return false;
    }
    return true;
}

type ChangeDoc = (changeFn: ChangeFn<Project>, options?: any) => void;

export function new_task(): Task {
    return {
        description: "",
        completed: null,
        repeat: { kind: "none" }
    };
}

export function update_task_completed(changedoc: ChangeDoc, task_url: AutomergeUrl, completed: number | null) {
    changedoc((doc) => {
        doc.tasks[task_url].task.completed = completed;
    });
}

export function update_task_description(changedoc: ChangeDoc, task_url: AutomergeUrl, description: string) {
    changedoc((doc) => {
        updateText(doc.tasks, [task_url, 'task', 'description'], description);
    });
};

export function update_repeat_task_type(changedoc: ChangeDoc, task_url: AutomergeUrl, repeat: "none" | "incomplete-after") {
    changedoc((doc) => {
        if (!doc.tasks[task_url]) return
        if (doc.tasks[task_url].task.repeat?.kind == repeat) return

        switch (repeat) {
            case "none":
                doc.tasks[task_url].task.repeat = { kind: "none" };
                break;
            case "incomplete-after":
                doc.tasks[task_url].task.repeat = { kind: "incomplete-after", duration: 0 };
                break;
            default:
                throw new Error(`Unknown repeat type: ${repeat}`);
        }
    });
}
export function update_repeat_task_duration(changedoc: ChangeDoc, task_url: AutomergeUrl, duration: number) {
    changedoc((doc) => {
        if (!doc.tasks[task_url]) return
        if (doc.tasks[task_url].task.repeat?.kind !== "incomplete-after") return

        doc.tasks[task_url].task.repeat.duration = duration;
    });
}
