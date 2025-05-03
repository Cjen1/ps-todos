import { updateText } from '@automerge/automerge/next'
import { ChangeFn, ChangeOptions} from "@automerge/automerge/slim/next"
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

type ChangeDoc = (changeFn : ChangeFn<Project>, options?: ChangeOptions<Project>) => void;

export function new_task() : Task {
    return {
        description: "",
        completed: null,
        repeat: {kind: "none"}
    };
}

export function update_task_completed(changedoc: ChangeDoc, task_url : AutomergeUrl, completed: number | null) {
    changedoc((doc) => {
        doc.tasks[task_url].task.completed = completed;
    });
}

export function update_task_description(changedoc: ChangeDoc, task_url : AutomergeUrl, description: string) {
    changedoc((doc) => {
        updateText(doc.tasks, [task_url, 'task', 'description'], description);
    });
};

export function update_repeat_task_type(changedoc: ChangeDoc, task_url : AutomergeUrl, repeat: "none" | "incomplete-after") {
    changedoc((doc) => {
        if (!doc.tasks[task_url]) return
        if (doc.tasks[task_url].task.repeat?.kind == repeat) return

        switch( repeat) {
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
export function update_repeat_task_duration(changedoc: ChangeDoc, task_url : AutomergeUrl, duration: number) {
    changedoc((doc) => {
        if (!doc.tasks[task_url]) return
        if (doc.tasks[task_url].task.repeat?.kind !== "incomplete-after") return

        doc.tasks[task_url].task.repeat.duration = duration;
    });
}
