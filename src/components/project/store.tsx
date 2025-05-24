import { ChangeFn } from "@automerge/react"
import { new_task, Task, isTask } from '@/components/task/store';
import { AutomergeUrl, generateAutomergeUrl } from "@automerge/automerge-repo";
import { object_map } from "@/lib/utils";

export type ProjectMetadata = {
};

export type TaskMetadata = {
    order: number;
    task: Task;
};

export function isTaskMetadata(obj: any): obj is TaskMetadata {
    if (typeof obj !== "object" || obj === null) {
        console.log("isTaskMetadata: not an object or null");
        return false;
    }
    if (!("order" in obj) || typeof obj.order !== "number") {
        console.log("isTaskMetadata: 'order' not present or not a number");
        return false;
    }
    if (!("task" in obj) || !isTask(obj.task)) {
        console.log("isTaskMetadata: 'task' not present or not a valid Task");
        return false;
    }
    return true;
}

console.assert (isTaskMetadata({ order: 1, task: new_task() }), "isTaskMetadata should return true for valid TaskMetadata");

export type Project = {
    tasks: { [key: AutomergeUrl]: TaskMetadata };
};

export function isProject(obj: any): obj is Project {
    if(typeof obj !== "object" || obj === null) {
        console.log("isProject: not an object or null");
        return false;
    }
    if(!("tasks" in obj) || typeof obj.tasks !== "object") {
        console.log("isProject: 'tasks' not present or not an object");
        return false;
    }
    if(!Object.values(obj.tasks).every(isTaskMetadata)) {
        console.log("isProject: not all tasks are valid TaskMetadata");
        return false;
    }
    return true;
}

console.assert (isProject({ tasks: { 'task1': { order: 1, task: new_task() } } }), "isProject should return true for valid Project");

export type ChangeDoc = (changeFn: ChangeFn<Project>, options?: any) => void;

export function add_new_task(changedoc: ChangeDoc) {
    const task_url = generateAutomergeUrl();
    changedoc((doc) => {
        const sorted_tasks = object_map(
            doc.tasks, (task_url, { order }) => {
                return { order: order, task_url: task_url };
            }).sort((a, b) => a.order - b.order);
        const not_completed_tasks = sorted_tasks.filter((task) => doc.tasks[task.task_url].task.completed === null);
        const last_order = not_completed_tasks.length > 0 ? not_completed_tasks[not_completed_tasks.length - 1].order : 0;
        const new_order = Math.random() * (1 - last_order) * 0.1 + last_order;
        doc.tasks[task_url] = { order: new_order, task: new_task() };
    });
}

export function new_project(): Project {
    return {
        tasks: {}
    };
}

export function delete_task(changeDoc: ChangeDoc, task_url: AutomergeUrl): void {
    changeDoc((doc) => {
        delete doc.tasks[task_url];
    });
}

function calculate_next_order(prev_order: number | null, next_order: number | null) {
    let low = 0;
    let high = 1;
    if (prev_order && next_order) {
        low = Math.min(prev_order, next_order);
        high = Math.max(prev_order, next_order);
    } else if (prev_order || next_order) {
        const v = (prev_order ?? next_order) as number;
        low = Math.min(v, 0);
        high = Math.max(v, 1);
    }
    return low + Math.random() * (high - low);
}

export function move_task(changeDoc: ChangeDoc, task_url: AutomergeUrl, over_url: AutomergeUrl) {
    changeDoc((doc) => {
        const active_order = doc.tasks[task_url].order;
        const over_order = doc.tasks[over_url].order;

        if (task_url === over_url) {
            return;
        }
        const sorted_tasks = object_map(
            doc.tasks, (task_url, { order }) => {
                return { order: order, task_url: task_url };
            }).sort((a, b) => a.order - b.order);
        const over_idx = sorted_tasks.findIndex((task) => task.task_url === over_url);
        if (active_order < over_order) {
            // moving down, so over has moved up
            const prev_order = sorted_tasks[over_idx]?.order;
            const next_order = sorted_tasks[over_idx + 1]?.order ?? 1;
            doc.tasks[task_url].order = calculate_next_order(prev_order, next_order);
        }
        if (active_order > over_order) {
            // moving down, so over has moved up
            const prev_order = sorted_tasks[over_idx - 1]?.order ?? 0;
            const next_order = sorted_tasks[over_idx]?.order;
            doc.tasks[task_url].order = calculate_next_order(prev_order, next_order);
        }
    });
}
