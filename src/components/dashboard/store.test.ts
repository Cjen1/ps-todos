import { describe, expect, test } from "vitest";
import { type AutomergeUrl } from "@automerge/react";
import { type Dashboard, move_project, ordered_project_urls } from "./store";

function changeDashboard(dashboard: Dashboard) {
  return (changeFn: (doc: Dashboard) => void) => changeFn(dashboard);
}

function dashboardWithProjects(projects: Array<[AutomergeUrl, number]>): Dashboard {
  return {
    name: "Test",
    projects: Object.fromEntries(
      projects.map(([project_url, order]) => [project_url, { petname: project_url, order }]),
    ),
  };
}

describe("project ordering", () => {
  test("moves projects to the beginning, middle, and end", () => {
    const first = "automerge:first" as AutomergeUrl;
    const second = "automerge:second" as AutomergeUrl;
    const third = "automerge:third" as AutomergeUrl;
    const fourth = "automerge:fourth" as AutomergeUrl;
    const dashboard = dashboardWithProjects([
      [first, 0],
      [second, 1],
      [third, 2],
      [fourth, 3],
    ]);
    const changeDoc = changeDashboard(dashboard);

    move_project(changeDoc, third, first);
    expect(ordered_project_urls(dashboard)).toEqual([third, first, second, fourth]);

    move_project(changeDoc, fourth, second);
    expect(ordered_project_urls(dashboard)).toEqual([third, first, fourth, second]);

    move_project(changeDoc, third, second);
    expect(ordered_project_urls(dashboard)).toEqual([first, fourth, second, third]);
  });
});
