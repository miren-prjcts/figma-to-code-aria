# Decisions

## 2026-09-03 — Repository founded on React Aria Components

`figma-to-code-aria` (`miren-prjcts/figma-to-code-aria`) is a new, separate repository, not a fork
or a live dependency of `miren-prjcts/figma-to-code`. `figma-to-code`'s `packages/ui` (8
components, Phase 1 complete) is frozen as a reference; no further work happens there in the
context of this project.

Reason: `figma-to-code`'s component behavior (keyboard, focus, ARIA) is entirely hand-written, and
a prior review there (`DSV2-016`) found a real gap between a claimed and actual completion state
for its automated accessibility coverage (`DSV2-014`'s axe integration claim). This repository's
behavior layer is instead composed from React Aria Components (Adobe, MIT-licensed), specifically
to move that class of risk off hand-written code and onto an actively maintained, WAI-ARIA- and
Section 508-oriented library.

What is reused from `figma-to-code`, and how: pnpm 9.15.4 + Turborepo workspace layout, tsconfig/
eslint/prettier config, Husky hooks, CI job shape, Vitest + jest-axe test setup and its ambient
type-declaration pattern, the Storybook + Tailwind v4 token-mapping setup, the Playwright visual-
regression harness (auto-discovery from Storybook's build manifest), and the docs/process
conventions (Charter/Backlog/Decisions/Project Operations/Golden Pact workflow) — all copied and
adapted, not symlinked or workspace-linked. The design-token file
(`packages/tokens/src/tokens.css`) is a standalone copy with no live coupling to the source repo.

What is new, not reused: the component behavior layer itself (React Aria Components instead of
native elements + hand-written handlers), and the composition-over-custom rule in
`DESIGN_SYSTEM_CHARTER.md` §4, which is stricter than anything `figma-to-code` enforced.

## 2026-09-03 — Composition-over-custom is a hard gate

Every component's interaction/keyboard/focus/ARIA behavior must be composed from existing
`react-aria-components`/`react-aria` primitives. Hand-written custom behavioral logic requires an
explicit, pre-agreed Deliberate Exclusion in the Charter — never added silently and justified
after the fact. Visual/CSS/token styling is not "custom logic" and is not subject to this gate.

Reason: this is the direct answer to the user's stated preference — compose complex components
from existing primitives rather than writing new ones — and it is the mechanism that makes this
repository's accessibility baseline (Charter §6) trustworthy: if a component's behavior is React
Aria's, its ARIA/keyboard conformance is React Aria's responsibility, not a claim this repository
has to independently prove and maintain.

## 2026-09-03 — CI visual-regression platform: macOS, not Linux Docker (for now)

`visual-regression`'s CI job runs on `macos-latest`, matching locally-generated baselines, the
same choice `figma-to-code` made — deliberately repeated here, not silently copied.
`figma-to-code`'s own `VISUAL_REGRESSION.md` recommends a pinned Linux Docker image for CI-runner
parity but its CI job never actually switched off macOS; this repository makes the same
macOS-for-now tradeoff explicitly, choosing simplicity at repo start over solving a problem that
has not yet caused any real CI/local drift. See `docs/VISUAL_REGRESSION.md`.

## 2026-09-03 — Golden Pact carried forward, concurrency stays low

This repository follows the same approval-gated, supervisor-led workflow as `figma-to-code`
(`AGENTS.md`, `docs/PROJECT_OPERATIONS.md`): discuss → plan → ticket/model approval → supervised
execution → review → close the loop. Concurrency defaults to a low, explicitly-confirmed batch
size (this project runs on a Claude Pro plan) rather than the five-or-six-agent pattern
`figma-to-code` used for some of its larger batches.

## 2026-09-03 — ARIA-001/ARIA-002: Button and Select

Button and Select were chosen as the first two components specifically to exercise the
composition-over-custom rule on both a simple control (Button, a direct composition of React Aria
Components' `Button`) and a non-trivial overlay/collection control (Select, a composition of
`Select` + `Button` + `Popover` + `ListBox`). Both integrated with full Vitest/jest-axe coverage,
Storybook stories in both themes, and a working visual-regression baseline. Verification ran
directly (typecheck, lint, `pnpm exec vitest run`, Storybook build, and a manual keyboard/visual
check in a live Storybook instance) rather than by claim — see `docs/tickets/ARIA-001-button.md`
and `docs/tickets/ARIA-002-select.md` for each ticket's handoff. Integrated 2026-09-03.
