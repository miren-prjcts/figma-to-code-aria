# Project Operations

## Golden workflow

1. Discuss the goal with the appropriate senior-level expertise.
2. Agree on the most efficient approach.
3. Present a plan and wait for approval.
4. Create detailed tickets and propose model assignments; wait for approval again.
5. Execute with a low, explicitly-confirmed number of active agents, supervised by the primary
   agent (this project runs on a Claude Pro plan — do not default to a high-concurrency batch).
6. Review evidence, report verified results, update these records, and propose the next steps.

Tickets are planning artifacts, not authorization to begin work. Execution requires an explicit
user approval after ticket review.

## Current product scope

This is a new, standalone repository: `miren-prjcts/figma-to-code-aria`. It is not a fork of, and
has no runtime dependency on, `miren-prjcts/figma-to-code` — that repository's `packages/ui` is
frozen as a reference only. See `docs/DECISIONS.md`'s founding entry for what was reused (tooling,
tests, process) versus what is new (the React Aria Components behavior layer, the
composition-over-custom rule).

There is no code-backed Figma file for this repository (Charter §7's deliberate exclusion).

## Current state — 2026-09-03

- Repository bootstrapped: pnpm 9.15.4 + Turborepo workspace, tsconfig/eslint/prettier/Husky/CI
  mirroring `figma-to-code`'s tooling. `packages/tokens` holds a standalone copy of that repo's
  token contract. `packages/ui` scaffolded with Vitest + `jest-axe`, extended with React
  Aria-specific jsdom polyfills (`PointerEvent`, pointer capture, `scrollIntoView`) that
  `figma-to-code` never needed. `apps/storybook` set up with Storybook 8.6.18, `addon-a11y`, and
  the same token-to-Tailwind `@theme inline` mapping pattern.
- `ARIA-001` (Button) and `ARIA-002` (Select) are integrated: both compose React Aria Components
  primitives with no hand-written interaction logic, per `DESIGN_SYSTEM_CHARTER.md` §4's
  composition-over-custom gate. Full verification run directly: `tsc --noEmit` clean on both
  `packages/ui` and `apps/storybook`, `pnpm exec eslint .` clean, 19/19 Vitest tests passing
  (including a `jest-axe` "no violations" assertion per component), Storybook production build
  succeeds, and a live Storybook instance was manually checked — Button variants/sizes/pending
  state, Select's open/close/keyboard-navigation/disabled-option/description-association behavior,
  and both Light and Dark themes rendering correctly off the token contract.
- Playwright visual-regression harness (`tests/visual/storybook.spec.ts`) wired up with
  auto-discovery from Storybook's build manifest; baselines established and committed
  (`tests/visual/__screenshots__/`, 24 screenshots — every Button/Select story × Light/Dark) and
  re-verified passing against those baselines in a second, non-updating run (`pnpm test:visual`).
- `playwright.config.ts`'s placeholder e2e suite (`tests/e2e/storybook-smoke.spec.ts`) passes —
  there is no consuming product app yet (see `BACKLOG.md`).
- Full root-level verification suite run directly, not by claim: `pnpm format` (0 files needed
  reformatting after initial authoring pass), `pnpm typecheck`, `pnpm lint`, `pnpm test` (19/19),
  `pnpm build`, `pnpm test:visual` (24/24), `pnpm test:e2e` (1/1) — all green.
- Next approval point: scoping Phase 2 (which components, in what order) now that Phase 1's
  composition-over-custom pattern is confirmed stable end-to-end, including CI-shaped
  verification.

## Verification standard

Each implementation ticket must define and meet proportionate checks:

- Typecheck, relevant unit/accessibility tests (`jest-axe`), formatting, and production build.
- Storybook stories for variants and meaningful states, in both themes.
- Semantic-token-only implementation (Charter §3.2).
- Composition-over-custom confirmed (Charter §4) — no hand-written keyboard/focus/ARIA logic
  without a pre-agreed Deliberate Exclusion.
- Visual-regression baseline present (or explicitly deferred with a stated reason) once the
  harness is fully wired up.
