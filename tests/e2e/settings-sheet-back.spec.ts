import { expect, test } from "@playwright/test";

test("browser back closes the dashboard settings sheet", async ({ page }) => {
  await test.step("load dashboard", async () => {
    await page.goto("/");
    await expect(page.getByText("Connected")).toBeVisible();
  });

  await test.step("open settings sheet", async () => {
    await page.getByRole("button", { name: "Dashboard settings" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard Settings" })).toBeVisible();
  });

  await test.step("browser back closes sheet", async () => {
    await page.goBack();
    await expect(page.getByRole("heading", { name: "Dashboard Settings" })).toBeHidden();
    await expect(page.getByText("Connected")).toBeVisible();
  });
});
