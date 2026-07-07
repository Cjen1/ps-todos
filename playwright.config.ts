import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: process.env.CI
    ? [["github"], ["list", { printSteps: true }]]
    : [["list", { printSteps: true }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : undefined,
      },
    },
  ],
  webServer: {
    command: "bash tests/e2e/run-flake-server.sh",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
});
