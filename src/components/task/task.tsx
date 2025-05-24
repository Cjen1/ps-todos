import { FC } from "react";
import { AutomergeUrl } from "@automerge/automerge-repo";
import { Label } from "@/components/ui/label";
import { useDocument } from "@automerge/react";
import { update_task_description } from "./store";
import { Input } from "@/components/ui/input";
import { DragHandle, DeleteHandle } from "@/components/ui/handles";
import { Project, delete_task} from "../project/store";
import { Settings } from "./settings";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Textarea } from "@/components/ui/textarea";

export const Task: FC<{ project_url: AutomergeUrl, task_url: AutomergeUrl}> = ({ project_url, task_url }) => {
    const [project, changeDoc] = useDocument<Project>(project_url);
    if (!project?.tasks[task_url]) {
        return <Label>Error: url invalid {project_url}</Label>
    }

    const task = project.tasks[task_url].task;

    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: task_url});
    const transform_style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    const move_or_delete_handle = ! task.completed ? (
        <button
            type="button"
            className=""
            {...listeners}
            {...attributes}>
            <DragHandle />
        </button>
    ) : (<button
            type="button"
            className=""
            onClick={() => delete_task(changeDoc, task_url)}>
            <DeleteHandle />
        </button>
    );

    return (
        <li 
          key={task_url} 
          className="flex flex-row gap-2 p-1 bg-card rounded" 
          style={transform_style} 
          ref={setNodeRef}>
            <div className="flex items-center justify-center">
                <Settings project_url={project_url} task_url={task_url} />
            </div>
            <Textarea
                ref={(textarea) => {
                    if (textarea) {
                        textarea.style.height = `${textarea.scrollHeight}px`;
                    }
                }}
                className="resize-none"
                value={task.description}
                onChange={
                    (event) => update_task_description(changeDoc, task_url, event.target.value)
                }
            />
            <div className="flex items-center justify-center">
                {move_or_delete_handle}
            </div>
        </li>
    );
};
