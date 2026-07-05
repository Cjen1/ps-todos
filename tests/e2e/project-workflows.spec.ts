import { expect, type Locator, type Page, test } from "@playwright/test";

async function createProject(page: Page, petname: string) {
  await page.getByTestId("dashboard-settings-trigger").click();
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
  await page.goto("/");
  await expect(page.getByText("Connected")).toBeVisible();

  const firstProject = await createProject(page, "Project One");
  await addTasks(firstProject, ["one", "two", "three", "four"]);
  await expectTaskOrder(firstProject, ["one", "two", "three", "four"]);

  await dragTask(firstProject, "two", "one");
  await expectTaskOrder(firstProject, ["two", "one", "three", "four"]);

  await dragTask(firstProject, "four", "one");
  await expectTaskOrder(firstProject, ["two", "four", "one", "three"]);

  await dragTask(firstProject, "two", "one");
  await expectTaskOrder(firstProject, ["four", "one", "two", "three"]);

  await dragTask(firstProject, "three", "two");
  await expectTaskOrder(firstProject, ["four", "one", "three", "two"]);

  const secondProject = await createProject(page, "Project Two");
  await addTasks(secondProject, ["alpha", "beta", "gamma"]);
  await expectTaskOrder(secondProject, ["alpha", "beta", "gamma"]);

  await dragTask(secondProject, "beta", "alpha");
  await expectTaskOrder(secondProject, ["beta", "alpha", "gamma"]);

  await page.getByTestId("dashboard-settings-trigger").click();
  const secondProjectSettings = await projectSettingsByPetname(page, "Project Two");
  const projectUrl = await secondProjectSettings.getByTestId("project-url").textContent();
  expect(projectUrl).toBeTruthy();

  await secondProjectSettings.getByTestId("delete-project").click();
  await page.getByTestId("confirm-delete-project").click();
  await expect(projectByName(page, "Project Two")).toHaveCount(0);

  await page.getByTestId("existing-project-petname").fill("Project Two Restored");
  await page.getByTestId("existing-project-url").fill(projectUrl as string);
  await page.getByTestId("add-existing-project").click();
  await page.keyboard.press("Escape");

  const restoredProject = projectByName(page, "Project Two Restored");
  await expect(restoredProject).toBeVisible();
  await expectTaskOrder(restoredProject, ["beta", "alpha", "gamma"]);
});
