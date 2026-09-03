# figma-to-code-aria

Design-system starter monorepo: **tokens → ui → storybook**, built on **React Aria Components**
for behavior/accessibility and Tailwind 4 + `class-variance-authority` for styling. Every
component's interaction, keyboard, focus, and ARIA behavior is composed from React Aria Components
primitives — this repository does not write its own hand-rolled interaction logic. See
[`docs/DESIGN_SYSTEM_CHARTER.md`](docs/DESIGN_SYSTEM_CHARTER.md) §4 for the exact rule, and
[`docs/DECISIONS.md`](docs/DECISIONS.md) for why this exists as a separate repository from
`miren-prjcts/figma-to-code` (that repo's tooling/tests/process were reused here; its hand-written
component behavior was not).

## Structure

```
packages/
  tokens/      @repo/tokens — semantic CSS variables (single source of truth)
  ui/          @repo/ui     — React Aria Components + cva + tokens (Button, Select…)
apps/
  storybook/   @repo/storybook — Storybook 8 + Tailwind 4 + a11y + theme toggle
```

Layers: **tokens** (values) → **ui** (React Aria Components primitives styled via tokens) →
**storybook** (where everything is visible and manually verified).

## Quick start

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm --version          # must print 9.15.4
pnpm install --frozen-lockfile
pnpm storybook          # → http://localhost:6006
```

Other commands:

```bash
pnpm typecheck       # strict TypeScript across all packages
pnpm lint            # ESLint (+ jsx-a11y, react-hooks)
pnpm test            # component unit/a11y tests (Vitest + Testing Library + jest-axe)
pnpm test:e2e        # Playwright e2e placeholder (against the built Storybook shell)
pnpm test:visual     # Playwright visual regression against Storybook stories
pnpm test:visual:update  # accept new baselines after a deliberate visual change
pnpm format          # Prettier --write (+ Tailwind class sorting)
pnpm format:check    # Prettier --check (as in CI)
pnpm build-storybook # static build (as in CI)
pnpm build           # full Storybook build (as in CI)
```

## Adding a component

Before writing any code, check `docs/DESIGN_SYSTEM_CHARTER.md` §4: confirm a
`react-aria-components`/`react-aria` primitive exists to compose the component from. If one
doesn't, that's a Deliberate Exclusion decision to make explicitly _before_ starting, not a reason
to write custom interaction code silently.

Then: create a file in `packages/ui/src/components/`, compose the relevant React Aria Components
primitive(s), style with `cva` + Tailwind's `data-[state]:` variants against semantic tokens only
(never raw `--gray-*`), export it from `src/index.ts`, add a Storybook story in
`apps/storybook/stories/`, and add a Vitest test file with at least one `jest-axe`
"no violations" assertion.

## Tests and pull request requirements

Every behavior change must be accompanied by tests:

- A new or modified UI component: a unit/a11y test in `packages/ui/src/**/*.test.tsx`, including a
  `jest-axe` assertion.
- A new component or variant: a Storybook story (both Light and Dark themes where applicable).
- A change to interaction/accessibility: semantic queries in Testing Library, verified against the
  real installed `react-aria-components` behavior — not assumed from memory or documentation (see
  `docs/tickets/ARIA-002-select.md`'s handoff for a concrete example of a wrong assumption caught
  this way).
- A visual change: an updated `pnpm test:visual:update` baseline, reviewed like any other diff.

To run e2e/visual tests locally, install a Playwright browser once:

```bash
pnpm exec playwright install chromium
```

## Checks

- **TS strict** (per package) · **ESLint** (typescript + react-hooks + jsx-a11y) · **Prettier**
  (+ Tailwind class-sort) · **Vitest + Testing Library + jest-axe** · **Playwright visual
  regression + e2e placeholder** · **Storybook a11y addon** (`a11y.test: error`).
- **Git hooks** (husky): `pre-commit` → lint-staged (`eslint --fix` + Prettier on staged files);
  `pre-push` → typecheck. Installed automatically with `pnpm install` (`prepare`).
- **CI** (`.github/workflows/ci.yml`): two jobs — `checks` (format/typecheck/lint/test/build/e2e on
  `ubuntu-latest`) and `visual-regression` (Storybook build + `pnpm test:visual` on
  `macos-latest`, matched to the committed macOS-generated baselines — see
  `docs/VISUAL_REGRESSION.md`).
- `dist`/`node_modules`/`storybook-static`/`test-results` are in `.gitignore` (build artifacts are
  not committed; Playwright's visual-regression **baselines** under
  `tests/visual/__screenshots__/` are the one generated-image exception, committed deliberately).

## Stack

pnpm workspaces · Turborepo · TypeScript (strict) · React 19 · React Aria Components · Tailwind CSS
4 · `class-variance-authority` + `clsx` + `tailwind-merge` · Storybook 8 (react-vite) · ESLint 9
(flat) · Vitest + Testing Library + jest-axe · Playwright.

## Governance

See [`AGENTS.md`](AGENTS.md) for the mandatory approval-gated workflow (discuss → plan → tickets →
supervised execution → review), and [`docs/DESIGN_SYSTEM_CHARTER.md`](docs/DESIGN_SYSTEM_CHARTER.md)
for what belongs in this design system and the composition-over-custom rule that governs every
component in it.
