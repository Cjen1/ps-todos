import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type AutomergeUrl } from "@automerge/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Task } from "./task";
import { type Project } from "../project/store";

const projectUrl = "automerge:project" as AutomergeUrl;
const taskUrl = "automerge:task" as AutomergeUrl;

let project: Project;

function resetProject(description: string) {
  project = {
    tasks: {
      [taskUrl]: {
        order: 0,
        task: {
          description,
          completed: null,
          repeat: { kind: "none" },
        },
      },
    },
  };
}

const changeDoc = vi.fn((changeFn: (doc: Project) => void) => changeFn(project));

vi.mock("@automerge/react", async () => {
  const actual = await vi.importActual<typeof import("@automerge/react")>("@automerge/react");
  return {
    ...actual,
    useDocument: () => [project, changeDoc],
  };
});

vi.mock("@dnd-kit/sortable", async () => {
  const actual = await vi.importActual<typeof import("@dnd-kit/sortable")>("@dnd-kit/sortable");
  return {
    ...actual,
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
    }),
  };
});

vi.mock("./settings", () => ({
  Settings: () => <button type="button">Task settings</button>,
}));

describe("Task backspace behavior", () => {
  beforeEach(() => {
    changeDoc.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test("deletes the task when Backspace is pressed in an empty description", async () => {
    resetProject("");
    const user = userEvent.setup();
    render(<Task project_url={projectUrl} task_url={taskUrl} />);

    await user.click(screen.getByRole("textbox"));
    await user.keyboard("{Backspace}");

    expect(project.tasks[taskUrl]).toBeUndefined();
  });

  test("does not delete the task when Backspace is pressed in a non-empty description", async () => {
    resetProject("Keep me");
    render(<Task project_url={projectUrl} task_url={taskUrl} />);

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Backspace" });

    expect(project.tasks[taskUrl]).toBeDefined();
  });
});
