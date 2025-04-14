import { type FC } from "react";

export const DragHandleSVG: FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="6 0 12 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <title>Drag</title>
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

export const DeleteHandleSVG: FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="6 0 12 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <title>Delete</title>
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />

    <circle cx="14" cy="12" r="1" />

    <circle cx="18" cy="5" r="1" />
    <circle cx="18" cy="19" r="1" />
  </svg>
);
