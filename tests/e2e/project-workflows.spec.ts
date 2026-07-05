import { expect, type Locator, type Page, test } from "@playwright/test";

async function openSettings(page: Page) {
  const newProjectInput = page.getByTestId("new-project-petname");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await newProjectInput.isVisible()) {
      return;
    }

    await page.getByTestId("dashboard-settings-trigger").click({ force: true });

    try {
      await expect(newProjectInput).toBeVisible({ timeout: 1000 });
      return;
    } catch {
      await page.keyboard.press("Escape");
    }
  }

  await expect(newProjectInput).toBeVisible();
}

async function createProject(page: Page, petname: string) {
  await openSettings(page);
  await page.getByTestId("new-project-petname").fill(petname);
  await page.getByTestId("create-project").click();
  await expect(page.getByTestId("project").filter({ hasText: petname })).toBeVisible();
  await page.keyboard.press("Escape");

  return projectByName(page, petname);
}

function projectByName(page: Page, petname: string) {
  return page.getByTestId("project").filter({ has: page.getByTestId("project-title").filter({ hasText: petname }) });
}

async function addTask(project: Locator, description: string) {
  await project.getByTestId("add-task").click();
  const task = project.getByTestId("task").last();
  await task.getByTestId("task-description").fill(description);
  await expect(task.getByTestId("task-description")).toHaveValue(description);
}

async function taskDescriptions(project: Locator) {
  return project.getByTestId("task-description").evaluateAll((textareas) => {
    return textareas.map((textarea) => (textarea as HTMLTextAreaElement).value);
  });
}

async function taskByDescription(project: Locator, description: string) {
  const tasks = project.getByTestId("task");
  const count = await tasks.count();

  for (let i = 0; i < count; i += 1) {
    const task = tasks.nth(i);
    if (await task.getByTestId("task-description").inputValue() === description) {
      return task;
    }
  }

  throw new Error(`Task not found: ${description}`);
}

async function expectTaskOrder(project: Locator, expected: string[]) {
  await expect.poll(() => taskDescriptions(project)).toEqual(expected);
}

async function dragTask(project: Locator, from: string, to: string) {
  const source = await taskByDescription(project, from);
  const target = await taskByDescription(project, to);
  const sourceBox = await source.getByTestId("task-drag-handle").boundingBox();
  const targetBox = await target.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error(`Unable to drag ${from} to ${to}`);
  }

  const page = project.page();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
  await page.mouse.up();
}

async function addTasks(project: Locator, descriptions: string[]) {
  for (const description of descriptions) {
    await addTask(project, description);
  }
}

async function projectSettingsByPetname(page: Page, petname: string) {
  const settings = page.getByTestId("project-settings");
  const count = await settings.count();

  for (let i = 0; i < count; i += 1) {
    const projectSettings = settings.nth(i);
    if (await projectSettings.getByTestId("project-petname").inputValue() === petname) {
      return projectSettings;
    }
  }

  throw new Error(`Project settings not found: ${petname}`);
}

test("creates projects, reorders tasks, and re-adds an existing project", async ({ page }) => {
  test.setTimeout(60_000);

  await test.step("load dashboard", async () => {
    await page.goto("/");
    await expect(page.getByText("Connected")).toBeVisible();
  });

  let firstProject: Locator;
  await test.step("create first project with four tasks", async () => {
    firstProject = await createProject(page, "Project One");
    await addTasks(firstProject, ["one", "two", "three", "four"]);
    await expectTaskOrder(firstProject, ["one", "two", "three", "four"]);
  });

  await test.step("reorder first project: middle task to top", async () => {
    await dragTask(firstProject, "two", "one");
    await expectTaskOrder(firstProject, ["two", "one", "three", "four"]);
  });

  await test.step("reorder first project: bottom task to middle", async () => {
    await dragTask(firstProject, "four", "one");
    await expectTaskOrder(firstProject, ["two", "four", "one", "three"]);
  });

  await test.step("reorder first project: top task to middle", async () => {
    await dragTask(firstProject, "two", "one");
    await expectTaskOrder(firstProject, ["four", "one", "two", "three"]);
  });

  await test.step("reorder first project: bottom task to middle", async () => {
    await dragTask(firstProject, "three", "two");
    await expectTaskOrder(firstProject, ["four", "one", "three", "two"]);
  });

  let secondProject: Locator;
  await test.step("create second project with three tasks", async () => {
    secondProject = await createProject(page, "Project Two");
    await addTasks(secondProject, ["alpha", "beta", "gamma"]);
    await expectTaskOrder(secondProject, ["alpha", "beta", "gamma"]);
  });

  await test.step("reorder second project tasks", async () => {
    await dragTask(secondProject, "beta", "alpha");
    await expectTaskOrder(secondProject, ["beta", "alpha", "gamma"]);
  });

  let projectUrl: string;
  await test.step("copy second project URL and delete project", async () => {
    await openSettings(page);
    const secondProjectSettings = await projectSettingsByPetname(page, "Project Two");
    const maybeProjectUrl = await secondProjectSettings.getByTestId("project-url").textContent();
    expect(maybeProjectUrl).toBeTruthy();
    projectUrl = maybeProjectUrl as string;

    await secondProjectSettings.getByTestId("delete-project").click();
    await page.getByTestId("confirm-delete-project").click();
    await expect(projectByName(page, "Project Two")).toHaveCount(0);
  });

  await test.step("re-add deleted project by URL", async () => {
    await page.getByTestId("existing-project-petname").fill("Project Two Restored");
    await page.getByTestId("existing-project-url").fill(projectUrl);
    await page.getByTestId("add-existing-project").click();
    await page.keyboard.press("Escape");
  });

  await test.step("verify restored project still has reordered tasks", async () => {
    const restoredProject = projectByName(page, "Project Two Restored");
    await expect(restoredProject).toBeVisible();
    await expectTaskOrder(restoredProject, ["beta", "alpha", "gamma"]);
  });
});
