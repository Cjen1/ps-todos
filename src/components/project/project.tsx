import { Fragment, FC } from "react";
import { AutomergeUrl } from "@automerge/automerge-repo";
import { Label } from "@/components/ui/label";
import { useDocument } from "@automerge/react";
import { add_new_task, isProject, move_task, Project as ProjectData } from "./store";
import { object_map } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/task/task";
import { Separator } from "@/components/ui/separator";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

export const Project: FC<{ project_url: AutomergeUrl, petname: string }> = ({ project_url, petname }) => {
    const [project, changeDoc] = useDocument<ProjectData>(project_url);

    if (!project) {
        return <Label>Loading project {project_url}</Label>;
    }

    if (!isProject(project)) {
        return <Label>Error: url invalid {project_url}</Label>
    }

    const handleDragEnd = (event: DragEndEvent) => {
        if (!event.over) {
            return;
        }
        const task_url = event.active.id.toString() as AutomergeUrl;
        const over_url = event.over.id.toString() as AutomergeUrl;
        move_task(changeDoc, task_url, over_url);
    };

    const task_list = object_map(
        project.tasks, (task_url, { order }) => {
            return { order: order, task_url: task_url };
        }).sort((a, b) => a.order - b.order).map(({ task_url }) => task_url);

    const not_completed_tasks = task_list.filter((task_url) => {
        const task = project.tasks[task_url];
        return task && task.task && task.task.completed === null;
    });

    const completed_tasks = task_list.filter((task_url) => {
        const task = project.tasks[task_url];
        return task && task.task && task.task.completed !== null;
    });

    return (
        <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <div className="bg-card flex flex-col gap-2 p-2">
                <Label className="justify-center">{petname}</Label>
                <div>
                    <SortableContext items={task_list} strategy={verticalListSortingStrategy}>
                        {not_completed_tasks.map((task_url) => {
                            return (
                                <div key={task_url}>
                                    <Task
                                        key={task_url}
                                        project_url={project_url as AutomergeUrl}
                                        task_url={task_url as AutomergeUrl} />
                                </div>
                            );
                        })}
                    </SortableContext>
                </div>
                {
                    (completed_tasks.length > 0) ? (
                        <Fragment>
                            <div className="py-1">
                                <Separator />
                            </div>
                            {completed_tasks.map((task_url) => {
                                return (
                                    <div key={task_url} className="w-full max-w-full">
                                        <Task
                                            key={task_url}
                                            project_url={project_url as AutomergeUrl}
                                            task_url={task_url as AutomergeUrl} />
                                    </div>
                                );
                            })}
                        </Fragment>
                    ) : (
                        null
                    )
                }
                <div className="py-1">
                    <Separator />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => add_new_task(changeDoc)}>
                    Add Task
                </Button>
            </div>
        </DndContext>
    );
}