import { FC, Fragment, useCallback } from "react";
import { AutomergeUrl } from "@automerge/automerge-repo";
import { Label } from "@/components/ui/label";
import { useDocument, useRepo } from "@automerge/automerge-repo-react-hooks";
import { add_new_task, move_task, Project as ProjectData } from "./store";
import { object_map } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/task/task";
import { Separator } from "@/components/ui/separator";

import { DroppableMarker } from "@/components/dnd/DroppableMarker";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";

export const Project: FC<{ project_url: AutomergeUrl, petname: string }> = ({ project_url, petname }) => {
    const [project, changeDoc] = useDocument<ProjectData>(project_url);

    if (!project) {
        return <Label>Error: url invalid {project_url}</Label>
    }

    const handleDragEnd = (event: DragEndEvent) => {
      if (!event.over) {
        return;
      }
      const data = event.over.data.current;
      move_task(changeDoc, event.active.id, data?.prev_id, data?.next_id);
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="bg-card flex flex-col gap-2 p-2">
                <Label className="justify-center">{petname}</Label>
                {object_map(project.tasks, (task_url, { order }) => {
                    return { order: order, task_url: task_url };
                }).sort((a, b) => a.order - b.order).map(({ task_url }) => {
                    return (
                      <Fragment key={task_url}>
                        <DroppableMarker/>
                        <Task
                            key={task_url}
                            project_url={project_url as AutomergeUrl}
                            task_url={task_url as AutomergeUrl} />
                      </Fragment>
                    );
                })}
                <DroppableMarker/>
                <Separator/>
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