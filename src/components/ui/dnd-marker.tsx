import { useDroppable } from "@dnd-kit/core";
import { type FC, useId } from "react";
import { Separator } from "./separator.tsx";
import {cn} from "@/lib/utils.ts";

type Props = {
  className?: string | undefined;
  pid: string;
  prevId?: string | undefined;
  nextId?: string | undefined;
};

export const DroppableMarker: FC<Props> = ({ className, pid, prevId, nextId }) => {
  const id = useId();
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { pid, prevId, nextId },
  });

  const internal = !isOver ? null : (
    <div className={cn(
      "px-2",
      className)}>
      <Separator
        className="bg-background p-1 rounded"
      />
    </div>
  );

  return (
    <div ref={setNodeRef}>{internal}</div>
  );
};
