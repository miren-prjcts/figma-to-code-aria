import { defineConfig, devices } from "@playwright/test";

// Thin e2e placeholder: this repo has no consuming app yet (no `apps/web`), so there is no real
// product flow to test end-to-end. Rather than leave `pnpm test:e2e` pointing at nothing (or
// skip it silently in CI), this config and tests/e2e/storybook-smoke.spec.ts smoke-test that the
// *built* Storybook artifact boots — a real, if narrow, e2e-shaped check. Replace this with a
// real app's e2e suite once one exists; tracked in docs/BACKLOG.md as a named follow-up, not a
// silent gap.
const PORT = Number(process.env.STORYBOOK_STATIC_E2E_PORT ?? 6008);
const STORYBOOK_STATIC_DIR = process.env.STORYBOOK_STATIC_DIR ?? "apps/storybook/storybook-static";
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `node scripts/serve-storybook-static.mjs --dir ${STORYBOOK_STATIC_DIR} --port ${PORT}`,
    url: `${baseURL}/index.json`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
