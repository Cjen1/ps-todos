import { ChangeFn, ChangeOptions } from "@automerge/automerge/slim/next"
import { new_task, Task } from '@/components/task/store';
import { Repo, AutomergeUrl, generateAutomergeUrl } from "@automerge/automerge-repo";

export type ProjectMetadata = {
};

export type TaskMetadata = {
    order: number;
    task: Task;
};

export type Project = {
    tasks: { [key: AutomergeUrl]: TaskMetadata };
};

type ChangeDoc = (changeFn: ChangeFn<Project>, options?: ChangeOptions<Project>) => void;

export function add_new_task(changedoc: ChangeDoc) {
    const task_url = generateAutomergeUrl();
    changedoc((doc) => {
        doc.tasks[task_url] = { order: 0, task: new_task() };
    });
}

export function new_project() : Project {
    return {
        tasks: {}
    };
}

export function delete_task(changeDoc: ChangeDoc, task_url: AutomergeUrl) : void {
    changeDoc((doc) => {
        delete doc.tasks[task_url];
    });
}
