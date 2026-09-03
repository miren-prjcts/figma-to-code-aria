import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

// Storybook visual-regression harness, mirroring figma-to-code's DSV2-006 approach.
//
// Drives real screenshots off `storybook-static/index.json` (the manifest Storybook's own
// production build emits) rather than a hand-maintained component list, so this suite picks up
// new stories automatically the next time Storybook is built — no edit to this file is needed
// when a future ticket adds stories.
//
// Deliberately reads the index from disk instead of fetching it over HTTP: `test()` calls must
// be registered synchronously while Playwright loads this file, before the `webServer` in
// playwright.visual.config.ts is guaranteed to be listening.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORYBOOK_STATIC_DIR = path.resolve(__dirname, "../../apps/storybook/storybook-static");
const INDEX_PATH = path.join(STORYBOOK_STATIC_DIR, "index.json");

interface StoryIndexEntry {
  id: string;
  title: string;
  name: string;
  /** Storybook 8: "story" for a real story, "docs" for an autodocs/MDX page. */
  type?: "story" | "docs";
  tags?: string[];
}

interface StoryIndex {
  entries: Record<string, StoryIndexEntry>;
}

function loadStoryEntries(): StoryIndexEntry[] {
  if (!existsSync(INDEX_PATH)) {
    throw new Error(
      `Storybook index not found at ${INDEX_PATH}.\n` +
        'Build Storybook before running this suite: "pnpm --filter @repo/storybook build-storybook".',
    );
  }
  const index = JSON.parse(readFileSync(INDEX_PATH, "utf-8")) as StoryIndex;
  return Object.values(index.entries)
    .filter((entry) => (entry.type ?? "story") === "story")
    .sort((a, b) => a.id.localeCompare(b.id));
}

const THEMES = ["light", "dark"] as const;

const stories = loadStoryEntries();

test.describe("Storybook visual regression", () => {
  test.beforeAll(() => {
    // Fail loudly (rather than silently passing an empty suite) if the index is empty or the
    // build didn't run — an empty story list would otherwise look like "0 failed" in CI.
    expect(stories.length, `No stories found in ${INDEX_PATH}`).toBeGreaterThan(0);
  });

  for (const story of stories) {
    for (const theme of THEMES) {
      test(`${story.title} / ${story.name} [${theme}]`, async ({ page }) => {
        await page.goto(
          `/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story&globals=theme:${theme}`,
        );
        await page.waitForLoadState("networkidle");
        // Geist / Geist Mono are variable webfonts loaded by .storybook/preview.tsx; waiting for
        // document.fonts.ready avoids a flash-of-fallback-font race between page load and the
        // first screenshot.
        await page.evaluate(() => document.fonts.ready);

        await expect(page).toHaveScreenshot(`${slugify(story.id)}-${theme}.png`);
      });
    }
  }
});

function slugify(id: string): string {
  return id.replace(/[^a-z0-9-]/gi, "-");
}
