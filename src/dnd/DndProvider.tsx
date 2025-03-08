import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { type FC, type PropsWithChildren, useCallback } from "react";
import { TaskStore } from "../taskStore";

export const DndProvider: FC<{taskstore: TaskStore} & PropsWithChildren> = ({ taskstore, children }) => {
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!event.over) {
      return;
    }
    const data = event.over.data.current;
    if (!data?.pid) {
      return;
    }

    taskstore.moveTask(String(event.active.id), data.pid, data?.prevId, data?.nextId);
  }, []);

  return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
};
