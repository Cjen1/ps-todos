import { FC } from "react";
import { AutomergeUrl } from "@automerge/automerge-repo";
import { Label } from "@/components/ui/label";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { Task as TaskData, update_task_description } from "./store";
import { Input } from "@/components/ui/input";
import { DragHandle, DeleteHandle } from "@/components/ui/handles";

export const Task: FC<{ task_url: AutomergeUrl}> = ({ task_url }) => {
    const [task, changeDoc] = useDocument<TaskData>(task_url);

    if (!task) {
        return <Label>Error: url invalid {task_url}</Label>
    }

    const move_or_delete_handle = !task.completed ? (
        <button
            type="button"
            className=""> 
          <DragHandle/>
        </button>
    ) : (
        <button
          type="button"
          className=""> 
          <DeleteHandle/>
        </button>
    )
        
    return (
        <li key={task_url} className="flex flex-row gap-2">
            <input type="checkbox" />
            <Input
                type="text"
                value={task.description}
                onChange={
                    (event) => update_task_description(changeDoc, event.target.value)
                } />
            {move_or_delete_handle}
        </li>
    );
};
