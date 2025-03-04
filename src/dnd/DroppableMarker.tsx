import { useDroppable } from "@dnd-kit/core";
import { type FC, useId } from "react";
import styles from "./DroppableMarker.module.css";

type Props = {
  pid: string;
  prevId?: string | undefined;
  nextId?: string | undefined;
};

export const DroppableMarker: FC<Props> = ({ pid, prevId, nextId }) => {
  const id = useId();
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { pid, prevId, nextId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.wrapper} ${isOver ? styles.isOver : ""}`}
    />
  );
};
