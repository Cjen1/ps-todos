import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type AutomergeUrl } from "@automerge/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { DashboardSettings } from "./settings";

const dashboard = {
  name: "Test dashboard",
  projects: {},
};
const dashboardUrl = "automerge:dashboard" as AutomergeUrl;

vi.mock("@automerge/react", async () => {
  const actual = await vi.importActual<typeof import("@automerge/react")>("@automerge/react");
  return {
    ...actual,
    useDocument: () => [dashboard, vi.fn()],
    useRepo: () => ({}),
  };
});

describe("DashboardSettings back button handling", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("closes the settings sheet when browser back is pressed", async () => {
    const user = userEvent.setup();
    render(<DashboardSettings dashboard_url={dashboardUrl} />);

    await user.click(screen.getByRole("button", { name: "Dashboard settings" }));
    expect(await screen.findByText("Dashboard Settings")).toBeVisible();

    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(screen.queryByText("Dashboard Settings")).not.toBeInTheDocument();
    });
  });

  test("normal sheet close consumes the temporary history entry", async () => {
    const backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<DashboardSettings dashboard_url={dashboardUrl} />);

    await user.click(screen.getByRole("button", { name: "Dashboard settings" }));
    expect(await screen.findByText("Dashboard Settings")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(backSpy).toHaveBeenCalledOnce();
    });
  });
});
