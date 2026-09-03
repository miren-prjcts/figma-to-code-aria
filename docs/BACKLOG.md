# Backlog

Status meanings: **Proposed** = discussed only; **Planned** = ticket written, execution not
approved; **Active** = explicitly approved and in progress; **Review** = awaiting supervisor
validation; **Done** = verified and integrated.

Governance: before proposing or scoping a new component or token, see the
[Design System Charter](DESIGN_SYSTEM_CHARTER.md) — especially §4's composition-over-custom rule,
which is stricter here than in `figma-to-code`.

## Phase 0 — Repository bootstrap

| Item                                                                                      | Status | Notes                                                                                                                                |
| ----------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Repo scaffold: pnpm + Turborepo workspace, tsconfig/eslint/prettier, Husky, CI            | Done   | Mirrors `figma-to-code`'s tooling/config verbatim.                                                                                   |
| `packages/tokens` — standalone copy of `figma-to-code`'s token contract                   | Done   | No live coupling to the source repo.                                                                                                 |
| `packages/ui` scaffold — Vitest + jest-axe + jsdom, ambient type declarations             | Done   | Extended with React Aria-specific jsdom polyfills (`PointerEvent`, pointer capture, `scrollIntoView`) not needed in `figma-to-code`. |
| `apps/storybook` — Storybook 8.6.18, addon-a11y, token-mapped Tailwind theme              | Done   |                                                                                                                                      |
| Playwright visual-regression harness (auto-discovery from Storybook's build manifest)     | Done   |                                                                                                                                      |
| `docs/` process scaffolding (this Charter/Backlog/Decisions/Project Operations/AGENTS.md) | Done   | Adapted from `figma-to-code`, Figma-specific docs deliberately not carried over (see Charter §7).                                    |

## Phase 1 — First components (composition-over-custom validation)

The point of this phase is as much to validate the composition-over-custom rule in practice as to
ship the components themselves — see `DESIGN_SYSTEM_CHARTER.md` §4.

| Ticket                                 | Scope                                                              | Status |
| -------------------------------------- | ------------------------------------------------------------------ | ------ |
| [ARIA-001](tickets/ARIA-001-button.md) | Button — composed from React Aria Components' `Button`             | Done   |
| [ARIA-002](tickets/ARIA-002-select.md) | Select — composed from `Select` + `Button` + `Popover` + `ListBox` | Done   |

## Deferred / named follow-ups

- **`apps/web` (or any consuming product app)** — does not exist yet. `playwright.config.ts`'s e2e
  suite is a placeholder smoke test against the built Storybook shell until a real app exists to
  test end-to-end. Not a silent gap — see `DESIGN_SYSTEM_CHARTER.md` §7.
- **Linux Docker image for visual-regression CI parity** — `visual-regression` CI runs on
  `macos-latest` to match locally-generated baselines, the same deliberate tradeoff
  `figma-to-code` made. A pinned `mcr.microsoft.com/playwright` Linux image is a valid later
  ticket if CI/local drift becomes a real problem. See `docs/VISUAL_REGRESSION.md`.
- **`eslint-plugin-jsx-a11y` vs. React Aria Components friction** — carried over from
  `figma-to-code` as a standing lint layer; watch for false positives on RAC's context-based
  label association (label↔input association that isn't visible to the linter statically) as more
  components are added, and disable specific rules per-file with a comment if one fires
  incorrectly. None observed yet on Button/Select.
- **Phase 2 component scope** — not yet named. To be scoped once Phase 1's composition-over-custom
  pattern is confirmed stable across a form control (Select) and a simple control (Button); a
  reasonable next candidate set (Checkbox, Radio, Switch, Textarea) mirrors `figma-to-code`'s own
  Phase 1 scope, but each still needs its own React Aria Components primitive check per Charter §4
  before being written as a ticket.

## Out of scope for this starter (Charter §7)

- Figma file, Code Connect mapping, or any design-parity process.
- Publishing, versioning, or a public documentation site.
- Multi-brand or multi-density theming.
