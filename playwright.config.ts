import { defineConfig } from "@playwright/test";

export default defineConfig({
  testMatch: ["**/orby-nav-e2e.spec.ts"],
  use: {
    headless: true,
    baseURL: "http://localhost:3000",
    viewport: { width: 1280, height: 900 },
    actionTimeout: 15000,
  },
  projects: [
    {
      name: "firefox",
      use: { browserName: "firefox" },
    },
  ],
  workers: 1,
  retries: 0,
  timeout: 90000,
});
