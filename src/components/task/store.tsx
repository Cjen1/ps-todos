import { updateText } from '@automerge/automerge/next'
import { ChangeFn, ChangeOptions} from "@automerge/automerge/slim/next"

export type Task = {
    description: string;
    completed: Date | null;
}

type ChangeDoc = (changeFn : ChangeFn<Task>, options?: ChangeOptions<Task>) => void;

export function update_task_completed(changedoc: ChangeDoc, completed: Date | null) {
    changedoc((doc) => {
        doc.completed = completed;
    });
}

export function update_task_description(changedoc: ChangeDoc, description: string) {
    changedoc((doc) => {
        updateText(doc, ['description'], description);
    });
};

export function new_task() : Task {
    return {
        description: "",
        completed: null
    };
}
