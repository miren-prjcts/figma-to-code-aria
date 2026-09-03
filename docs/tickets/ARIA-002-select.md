# ARIA-002 — Select

## Dependency

None on `ARIA-001` directly, but run after it in sequence (see `docs/tickets/README.md`) since
Select is the harder validation of the composition-over-custom rule (overlay + collection, not a
single primitive).

## Objective

Provide a token-styled, accessible Select composed entirely from React Aria Components' `Select` +
`Button` (trigger) + `Popover` + `ListBox` + `ListBoxItem` primitives — open/close, keyboard
navigation (Arrow keys, type-ahead, Home/End, Escape), selection, and label/description/error
`aria-describedby` wiring all owned by those primitives.

## Scope

- `packages/ui/src/components/select.tsx`: generic `Select<T extends SelectOption>` over a static
  `items` array (dynamic-collection API, not hardcoded children).
- `label`, `description`, `errorMessage`/`isInvalid` props rendered via React Aria's `Label`,
  `Text slot="description"`, and `FieldError` — not manually wired `aria-describedby`.
- Per-item `isDisabled` supported and excluded from selection by React Aria's own `ListBox`
  behavior (verified, not assumed — see Handoff).
- A small inline decorative chevron icon (not a new dependency); no icon library added in this
  ticket.
- Vitest + Testing Library + `jest-axe` coverage in `select.test.tsx`: label/placeholder rendering,
  mouse-driven selection with `onSelectionChange`, full keyboard interaction (open, navigate,
  select), disabled-option exclusion, `aria-describedby` association, and an axe-violations check.
- Storybook stories: `Default`, `WithDescription`, `Invalid`, `Disabled`.

## Deliberate exclusions

- Multi-select (`selectionMode="multiple"`) — React Aria Components' `Select` is single-selection
  by design (multi-select is `ComboBox`/custom composition territory); out of scope until a real
  product need names it, per Charter §4.
- Async/remote-loaded options — static `items` array only; React Aria supports async collections,
  but nothing in this repository needs it yet.
- Any hand-written keydown handler, roving-tabindex, or open/close state machine — deliberately
  avoided; all owned by React Aria Components, per Charter §4.

## Acceptance criteria

- `pnpm --filter @repo/ui test` passes, including the axe assertion.
- `tsc --noEmit` clean on `packages/ui` and `apps/storybook`.
- `eslint .` clean.
- Keyboard interaction (open via Enter, navigate via Arrow keys, select via Enter, skip disabled
  options) verified against the real installed package, not assumed from documentation — one test
  assertion was corrected during implementation after the real behavior (Enter opens with the
  first item already focused) differed from the initial assumption.
- Manually verified in a live Storybook instance: popover opens/closes correctly, disabled option
  renders visually muted and is unreachable via selection, Light/Dark theme both render the
  trigger, popover, and listbox items with correct token colors, and Tab-based focus shows a
  visible focus ring on the trigger.
- No raw `--gray-*`/primitive token consumed directly (Charter §3.2).

## Handoff

Implemented against the installed `react-aria-components@1.21.0`. 6/6 unit tests pass, including
axe, after correcting one test's wrong assumption about post-open focus (Enter opens with the
first item already focused, so one `ArrowDown` lands on the second item — this is React Aria's own
keyboard model, not a defect). Typecheck clean on both `packages/ui` and `apps/storybook`.
Storybook production build succeeds. Manually verified live in Storybook: popover open/close,
disabled-option styling and exclusion, description `aria-describedby` association, and full
Light/Dark theme rendering including the trigger's visible focus ring after a real Tab keypress.
No Deliberate Exclusion was needed beyond what's listed above: every required behavior had a
direct React Aria Components primitive to compose from.
