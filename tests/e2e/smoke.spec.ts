import { expect, test } from "@playwright/test";

test("loads the dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Connected")).toBeVisible();
  await expect(page.getByText("TBD")).toBeVisible();
});
