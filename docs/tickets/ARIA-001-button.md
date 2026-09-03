# ARIA-001 — Button

## Dependency

None. First component in the repository, establishing the composition-over-custom pattern
(`DESIGN_SYSTEM_CHARTER.md` §4) that `ARIA-002` (Select) then validates on a harder case.

## Objective

Provide a token-styled Button whose interaction/keyboard/focus/ARIA behavior is entirely composed
from React Aria Components' `Button` primitive — no hand-written event handler, focus logic, or
ARIA attribute.

## Scope

- `packages/ui/src/components/button.tsx`: wraps `react-aria-components`' `Button`, styled via
  `class-variance-authority` + semantic tokens, using `data-[hovered]/[pressed]/[focus-visible]/
[disabled]/[pending]` Tailwind variants for state styling (Charter §3.5).
- Variants: `solid` / `outline` / `ghost` / `destructive`. Sizes: `sm` / `md` / `lg`.
- `leadingIcon` / `trailingIcon` decorative slots (`aria-hidden`).
- Pending/loading state via React Aria Components' native `isPending` prop — not a custom `loading`
  boolean — so the accessible-name-preservation and non-interactivity behavior during the pending
  state is React Aria's guarantee, not this repository's.
- Vitest + Testing Library + `jest-axe` coverage in `button.test.tsx`, including a `has no axe
violations` assertion.
- Storybook stories: all four variants, all three sizes, `Disabled`, `Pending (loading)`.

## Deliberate exclusions

- Icon-only buttons (an `IconButton` variant) — not scoped here; would be its own ticket per
  Charter §4 if a real consumer need appears.
- Any hand-written keyboard handler, `aria-busy`, or focus-management code — deliberately avoided
  in favor of React Aria Components' own `isPending`/`isDisabled` handling, per Charter §4's
  composition-over-custom gate.

## Acceptance criteria

- `pnpm --filter @repo/ui test` passes, including the axe assertion.
- `tsc --noEmit` clean on `packages/ui`.
- `eslint .` clean on `packages/ui` (including `jsx-a11y` rules).
- Storybook stories render correctly in both Light and Dark themes (manually verified in a live
  Storybook instance, not just build success).
- No raw `--gray-*`/primitive token consumed directly (Charter §3.2).

## Handoff

Implemented against the installed `react-aria-components@1.21.0` (resolved via `pnpm install`,
not assumed). 13/13 unit tests pass, including axe. Typecheck and lint clean on `packages/ui`.
Manually verified in a live Storybook dev instance: Solid/Outline/Ghost/Destructive variants, all
three sizes, and the Pending state (spinner + "Loading…" with the original accessible name
preserved via `sr-only`) all render correctly in Light theme; the Variants story was also
screenshotted directly in Dark theme (inverted solid variant, correct contrast on all four
variants) confirming the token contract, not just inferred from Select's dark-theme check.
No Deliberate Exclusion was needed: `isPending` covers the loading-state requirement with no
custom code.
