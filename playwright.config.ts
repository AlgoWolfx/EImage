import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 3,
  use: {
    viewport: { width: 1440, height: 1100 },
    baseURL: "http://127.0.0.1:4176",
    headless: true,
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
  },
  reporter: [["list"], ["json", { outputFile: ".impeccable/review/e2e.json" }]],
  webServer: {
    command: "npm run build && npm run preview:site",
    url: "http://127.0.0.1:4176",
    reuseExistingServer: true,
  },
});
