import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "phone-preview.spec.ts",
  expect: { timeout: 15_000 },
  use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3200" },
  webServer: [
    { command: "pnpm --filter @yami/canvas dev", cwd: "../..", url: "http://localhost:3200", reuseExistingServer: !process.env.CI },
    { command: "pnpm dev:storybook", cwd: "../..", url: "http://localhost:6006/index.json", reuseExistingServer: !process.env.CI },
  ],
});
