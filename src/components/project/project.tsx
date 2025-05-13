import { FC } from "react";
import { AutomergeUrl, parseAutomergeUrl } from "@automerge/automerge-repo";
import { Label } from "@/components/ui/label";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { add_new_task, move_task, Project as ProjectData } from "./store";
import { object_map } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/task/task";
import { Separator } from "@/components/ui/separator";

import { DroppableMarker } from "@/components/ui/dnd-marker.tsx";
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
      const doc_url = event.active.id.toString();
      move_task(changeDoc, doc_url, data?.prev_id, data?.next_id);
    };

    const task_list = object_map(
      project.tasks, (task_url, { order }) => {
        return { order: order, task_url: task_url };
      }).sort((a, b) => a.order - b.order);

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="bg-card flex flex-col gap-2 p-2">
                <Label className="justify-center">{petname}</Label>
                <div>
                {task_list.map(({ task_url }) => {
                    return (
                      <div key={task_url}>
                        <DroppableMarker 
                          className="pb-2" 
                          pid={project_url}
                          />
                        <Task
                            key={task_url}
                            project_url={project_url as AutomergeUrl}
                            task_url={task_url as AutomergeUrl} />
                      </div>
                    );
                })}
                  <DroppableMarker 
                    className="pb-2"
                    pid={project_url}
                    />
                </div>
                <div className="py-1">
                  <Separator/>
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