import { expect, test } from "@playwright/test";

// Placeholder e2e smoke test — see playwright.config.ts's header comment for why this targets
// the built Storybook shell instead of a product app.
test("built Storybook boots and serves the Button story", async ({ page }) => {
  await page.goto("/?path=/story/components-button--solid");

  await expect(page.locator("#storybook-preview-iframe")).toBeVisible();
});
