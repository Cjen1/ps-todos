import { ChangeFn, ChangeOptions } from "@automerge/automerge/slim/next"
import { new_task, Task } from '@/components/task/store';
import { Repo } from "@automerge/automerge-repo";

export type ProjectMetadata = {
};

export type TaskMetadata = {
    order: number;
};

export type Project = {
    tasks: { [key: string]: TaskMetadata };
};

type ChangeDoc = (changeFn: ChangeFn<Project>, options?: ChangeOptions<Project>) => void;

export function add_new_task(repo: Repo, changedoc: ChangeDoc) {
    const task_id = repo.create<Task>(new_task());
    changedoc((doc) => {
        doc.tasks[task_id.url] = { order: 0 };
    });
}

export function new_project() : Project {
    return {
        tasks: {}
    };
}
