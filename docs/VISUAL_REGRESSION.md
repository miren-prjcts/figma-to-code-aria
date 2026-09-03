# Visual Regression (Storybook)

Self-hosted, free-only visual-diffing for `packages/ui`'s Storybook stories, using Playwright's
built-in `toHaveScreenshot()` — no Chromatic/Percy/hosted SaaS, mirroring the `figma-to-code`
approach and its "no paid tooling" constraint.

## How it works

- `tests/visual/storybook.spec.ts` reads `apps/storybook/storybook-static/index.json` (the story
  manifest Storybook's own production build emits) and generates one test per story × Light/Dark
  theme. New stories are picked up automatically — no edit to this file is needed when a future
  component ticket adds stories.
- `playwright.visual.config.ts` is a separate Playwright config from the root `playwright.config.ts`
  (the e2e placeholder suite): different `testDir`, a static-file-server `webServer` for the built
  Storybook, and screenshot-specific `expect` defaults.
- Baselines live in `tests/visual/__screenshots__/`, committed to the repository, named
  `{story}-{theme}-{platform}.png`.

## Running it

```bash
pnpm --filter @repo/storybook build-storybook
pnpm test:visual
```

To accept new baselines after a deliberate visual change (a token tweak, a new component state):

```bash
pnpm --filter @repo/storybook build-storybook
pnpm test:visual:update
```

Review the changed `.png` files as you would any other diff before committing — a baseline update
is a reviewed, explicit commit, never automatic on merge.

## Platform baseline note (deliberate choice, not an accident)

Snapshot filenames are platform-scoped (`{platform}` = Playwright's coarse `darwin`/`linux`/`win32`
tag) so renders from different OSes never get compared against each other — font hinting and
anti-aliasing genuinely differ between macOS (Quartz) and Linux (FreeType).

Baselines are generated locally on macOS (this project's actual dev platform), so the
`visual-regression` CI job runs on `macos-latest` rather than the rest of the suite's
`ubuntu-latest` (see `.github/workflows/ci.yml`) — matching the runner to the baseline's platform.
This mirrors `figma-to-code`'s own documented tradeoff there: that repo's `VISUAL_REGRESSION.md`
recommends a pinned `mcr.microsoft.com/playwright` Linux Docker image for CI-runner parity but
never actually switched its CI job off macOS. This repo makes the same choice deliberately at
repo start, for the same reason (simplicity, one less moving part) — not by silently copying the
inconsistency. Moving to a pinned Linux image (regenerating baselines inside it, then switching
`visual-regression`'s `runs-on` to `ubuntu-latest`) is a valid later ticket if CI/local drift
becomes a real problem, not a standing gap.

## Rendering-stability notes

- `animations: "disabled"` plus `reducedMotion: "reduce"` settle CSS transitions/animations
  (e.g. Button's pending spinner) into their static end state deterministically.
- No `maxDiffPixelRatio` screenshot budget is set: a percentage-of-image tolerance generous enough
  to absorb rendering noise on a mostly-empty canvas would also hide a real token-color regression
  confined to a small swatch. Playwright's default per-pixel `threshold` (0.2) is relied on
  instead, for anti-aliasing tolerance only.
- Font loading timing is a residual risk common to any Storybook screenshot harness (Geist/Geist
  Mono variable fonts loading asynchronously) — not yet stress-tested under CI's cold cache; worth
  revisiting if CI shows flaky first-run diffs unrelated to real changes.
