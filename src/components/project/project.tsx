import { FC } from "react";
import { AutomergeUrl } from "@automerge/automerge-repo";
import { Label } from "@/components/ui/label";
import { useDocument, useRepo } from "@automerge/automerge-repo-react-hooks";
import { add_new_task, Project as ProjectData } from "./store";
import { object_map } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/task/task";

export const Project: FC<{ project_url: AutomergeUrl, petname: string }> = ({ project_url, petname }) => {
    const repo = useRepo();
    const [project, changeDoc] = useDocument<ProjectData>(project_url);

    if (!project) {
        return <Label>Error: url invalid {project_url}</Label>
    }

    return (
        <div className="bg-card flex flex-col gap-2 p-2">
            <Label className="justify-center">{petname}</Label>
            {object_map(project.tasks, (task_url, { order }) => {
                return { order: order, task_url: task_url };
            }).sort((a, b) => a.order - b.order).map(({ task_url }) => {
                return (
                    <Task task_url={task_url as AutomergeUrl} />
                );
            })}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => add_new_task(repo, changeDoc)}>
                Add Task
            </Button>
        </div>
    );
}