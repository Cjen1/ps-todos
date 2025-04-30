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

function calculate_next_order(prev_order: number | null, next_order: number | null) {
  let low = 0;
  let high = 1;
  if (prev_order && next_order) {
      low = Math.min(prev_order, next_order);
      high = Math.max(prev_order, next_order);
  } else if (prev_order || next_order) {
      const v = prev_order ?? next_order;
      low = Math.min(v, 0);
      high = Math.max(v, 1);
  } 
  return low + Math.random() * (high - low);
}

export function move_task(changeDoc: ChangeDoc, task_url: AutomergeUrl, prev_url: AutomergeUrl | null, next_url: AutomergeUrl | null) {
    changeDoc((doc) => {
      doc.tasks[task_url].order = 
          calculate_next_order(prev_url ?? doc.tasks[prev_url]?.order, next_url ?? doc.tasks[next_url]?.order);
    });
}
