# Design System Charter

What this repository's design system is for, what it deliberately is not for, how its tokens and
components are architected, and the standards a contribution must meet. This charter is the entry
point for "does my proposed component/token belong here, and what do I need to prove?" For process
mechanics (golden workflow, approval gates, repository scope), see
[`PROJECT_OPERATIONS.md`](./PROJECT_OPERATIONS.md) — this charter does not repeat it.

Every claim below is labeled **Verified** (true in the current codebase as read at the time of
writing), **Roadmap** (approved future direction, not yet built), or **Deliberate exclusion** (in
scope for consideration, out of scope by decision). Do not treat Roadmap items as available today.

## 0 · Relationship to `figma-to-code`

This repository (`miren-prjcts/figma-to-code-aria`) is a **fresh start**, not a fork or a live
dependency of `miren-prjcts/figma-to-code`. That repository's `packages/ui` (8 components on
native elements + `class-variance-authority`, hand-written interaction/ARIA logic) is **frozen as
a reference** — its tooling, tests, and process conventions were deliberately copied here (see
`docs/DECISIONS.md`'s founding entry), but this repository's design-token file
(`packages/tokens/src/tokens.css`) is a standalone copy, and no package here depends on anything
in `figma-to-code` at runtime or via workspace link. The reason for the fresh start, not an
in-place rewrite: `figma-to-code`'s accessibility/keyboard/focus behavior is entirely
hand-maintained, and a prior review there (`DSV2-016`) found a real gap between a claimed and
actual completion state for its automated accessibility coverage. This repository's behavior layer
is instead **composed from React Aria Components**, an actively maintained, WAI-ARIA- and
Section-508-oriented primitive library, specifically to remove that class of risk. **Verified.**

## 1 · Intended reusable scope

This is a **private, product-agnostic starter design system**. It exists to give any future product
built from this repository a small set of code-and-Storybook-verified primitives — Button, Select
today — that do not need to be reinvented or renamed per product, and whose accessibility
guarantees rest on React Aria Components rather than on this repository's own hand-written
behavior code. **Verified.**

It is not yet, and has no committed date to become, any of the following:

- A publicly published npm package or component library. **Deliberate exclusion** (see
  [§7](#7--deliberate-exclusions)).
- A general-purpose UI kit covering every possible interaction pattern. Component scope grows only
  by validated, product-driven discovery (§4).
- A multi-brand or multi-density system. One palette, one type scale, two themes (Light/Dark).
  **Verified**, see [§3](#3--architecture).
- A Figma-synced design system. No Figma file, Code Connect mapping, or parity-checklist process
  exists for this repository today. **Deliberate exclusion** — see [§7](#7--deliberate-exclusions).

## 2 · Non-goals

- Product-specific components or behavior (e.g., a domain object card, a checkout flow) do not
  belong in this package. They belong in the consuming product.
- Visual variety for its own sake. A new variant needs a real, named consumer — not "might be
  useful."
- Automated publishing, versioned releases, or a public documentation site. This is a private `0.x`
  starter.
- Hand-written interaction/keyboard/focus/ARIA logic as a default choice — see §4's
  composition-over-custom rule. This is a stricter non-goal than `figma-to-code` carried, adopted
  specifically because that repository's hand-written approach is what this one exists to avoid
  repeating.

## 3 · Architecture

### 3.1 Two-tier token model

Tokens live in `packages/tokens/src/tokens.css` as two explicit levels (the file's own header
comment states the rule; this section explains the reasoning). Copied as a standalone file from
`figma-to-code`'s token contract at this repository's founding — see §0. **Verified** against the
file as of this writing.

- **Level 1 — primitives.** The raw `--gray-50` … `--gray-950` neutral scale, plus the raw
  `--green-*` / `--amber-*` / `--red-*` / `--blue-*` status scales. Constants. They do not change
  between Light and Dark and carry no semantic meaning of their own.
- **Level 2 — semantics.** Named roles (`--background`, `--primary`, `--success-surface`,
  `--invalid-border`, …) that alias primitives. `:root` defines the Light values; `.dark` overrides
  only the semantic layer for Dark — primitives are never redefined per theme.

The reason for the split: a theme or palette change should require editing aliases in one place,
never hunting through components for a raw value.

### 3.2 Semantic-only consumption rule

Components consume **only** Level 2 semantic tokens (`bg-primary`, `text-muted-foreground`,
`border-invalid-border`) — never a raw `--gray-*` or status-primitive value directly. Reviewing a
component's className output for a bare `gray-`, hex, or `rgb()` literal is a fast way to catch a
violation. **Verified** as current practice (Button, Select).

### 3.3 Token naming conventions

- **Primitives**: `--{family}-{step}` (`--gray-500`, `--green-700`).
- **Semantic surfaces/text**: role nouns, not appearance (`--card`, `--card-foreground`,
  `--muted-foreground`) so the same name stays correct when its underlying color changes.
- **Semantic state roles**: `--{base}-{state}` (`--primary-hover`, `--primary-pressed`,
  `--invalid-border`, `--invalid-ring`).
- **Foundation/interaction scales**: `--{category}-{name}` (`--size-icon-sm`, `--layer-overlay`,
  `--opacity-disabled`, `--size-dialog-sm`).

New tokens follow whichever of these shapes fits; do not invent a fifth naming scheme.

### 3.4 Theme policy

Exactly two themes: **Light** (`:root` defaults) and **Dark** (`.dark` class override on an
ancestor element). **Verified.** There is no system-preference auto-switch logic, density mode, or
third theme in this repository; adding one is a **Roadmap** decision requiring its own ticket and
approval.

### 3.5 Styling layer over React Aria Components state

Components style React Aria Components' render-prop/DOM state (`data-hovered`, `data-pressed`,
`data-focus-visible`, `data-disabled`, `data-selected`, `data-invalid`, `data-pending`, …) using
Tailwind's `data-[attr]:` variant, combined with `class-variance-authority` for the
variant/size axis. **Verified** (Button, Select). This is the styling half of §4's
composition-over-custom split: React Aria owns _when_ a state is true; this repository only maps
that state to a token-driven class.

## 4 · Component-selection and composition principles

Whether a proposed component belongs in this starter is a design decision, not a vote on
usefulness. A component **earns a place now** when all of these hold:

1. **Cross-product necessity** — near every product built on this starter needs it, not just the
   first one.
2. **A single correct API exists** — its props/variants can be fully specified today without
   guessing a specific product's behavior.
3. **A React Aria Components (or `react-aria` hook) primitive exists to compose it from** — see the
   composition-over-custom rule immediately below. This is a harder gate than `figma-to-code`
   applied, adopted for this repository specifically.
4. **No net-new token category required**, or the new roles are scoped and approved in their own
   ticket before any component consumes them.
5. **It survives on semantic tokens alone** — no component-local raw value, per §3.2.

### Composition-over-custom (hard gate)

**Every component's interaction, keyboard, focus, and ARIA behavior is composed from existing
`react-aria-components` / `react-aria` primitives** (`Button`, `Select`, `ListBox`, `Popover`,
`Dialog`, `useFocusRing`, and so on). Complex components are composition of several primitives
(e.g. `Select` = `Select` + `Button` + `Popover` + `ListBox` from React Aria Components), never new
behavioral logic written from scratch.

Hand-written custom keyboard/focus/ARIA logic is **not permitted** unless it is recorded as an
explicit **Deliberate Exclusion** in this Charter (§7), with a stated reason (e.g. "React Aria
Components has no primitive for X"), agreed **before** the ticket implementing it starts — never
added silently and justified after the fact. Purely visual/CSS/token styling (§3.5) is not
"custom logic" and is not subject to this gate.

Both `Button` and `Select` (the current component set) satisfy this gate: their behavior layer is
a direct composition of React Aria Components primitives, with no hand-written event handler,
focus-trap, or ARIA attribute. **Verified** by direct inspection of
`packages/ui/src/components/button.tsx` and `select.tsx`.

### Evidence required to propose a component

1. Name it in `BACKLOG.md` (Proposed or Planned status, with its real dependency).
2. Confirm a React Aria Components primitive exists to compose it from (§4's composition rule) —
   or write the Deliberate Exclusion this Charter requires before proceeding without one.
3. Write a contract ticket that specifies props, variants, states, and any new token roles it
   needs.
4. Get explicit user approval per the Golden workflow in `PROJECT_OPERATIONS.md` before any
   implementation begins. Writing the ticket is not the approval.

## 5 · State model

Current interactive states and their token/consumer mapping, **Verified** against
`packages/tokens/src/tokens.css` and the two current components:

| State         | Token(s)                                                   | Consumer(s)                           |
| ------------- | ---------------------------------------------------------- | ------------------------------------- |
| Hover         | `--primary-hover` / variant-specific hover roles           | Button, Select trigger                |
| Pressed       | `--primary-pressed` / variant-specific pressed roles       | Button, Select trigger                |
| Focus-visible | `--ring` (existing semantic role)                          | Button, Select trigger, ListBox items |
| Disabled      | `--opacity-disabled`                                       | Button, Select                        |
| Pending       | _visual only — behavior owned by React Aria's `isPending`_ | Button                                |
| Invalid       | `--invalid-border`, `--invalid-ring`                       | Select trigger                        |
| Selected      | `--secondary` (listbox item background)                    | Select's `ListBoxItem`                |

Every state above is driven by a React Aria Components render-prop/DOM attribute (§3.5) — none is
tracked in component-local React state.

## 6 · Accessibility baseline

Unlike `figma-to-code`, this repository's accessibility baseline is **anchored on React Aria
Components' own WAI-ARIA and Section 508 conformance work** (Adobe's published accessibility
practices, screen-reader-tested across NVDA/JAWS/VoiceOver), not on this repository's own
hand-written keyboard/focus/ARIA code — see §4's composition-over-custom rule. This repository is
responsible only for: (a) not breaking that baseline through styling (§3.5's data-attribute
styling, not property overrides that would fight React Aria's own ARIA attribute management), and
(b) verifying it automatically where practical.

| Requirement                                                                      | Status                                                                                                                                                                        |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard model (Tab/Arrow/Enter/Escape per component) owned by React Aria        | **Verified** — Button, Select; no hand-written keydown handler exists in either file.                                                                                         |
| Focus-visible ring on all interactive elements                                   | **Verified** — Button and Select's trigger/listbox items render `data-[focus-visible]:ring-2` matched to their own surface.                                                   |
| Accessible name preserved through async/pending state                            | **Verified** — Button's `isPending` state keeps the visible label in the accessible tree (`sr-only`, not removed) while showing "Loading…" via a separate `aria-hidden` node. |
| Label/description/error association via `aria-describedby`                       | **Verified** — Select's `label`/`description`/`errorMessage` props render React Aria `Label`/`Text`/`FieldError`, which own the `aria-describedby` wiring.                    |
| Semantic-token-only color usage (theming, contrast maintained across Light/Dark) | **Verified**, see §3.2.                                                                                                                                                       |

Treat this table, not memory of what a ticket intended, as the source of truth for what is actually
built. Update it only when a change has landed and been verified, not when a ticket is merely
approved.

**Automated axe coverage (Verified).** `packages/ui`'s Vitest suite runs `jest-axe` (chosen over
`vitest-axe`, effectively unmaintained — same choice `figma-to-code` made, carried forward here).
The setup file (`packages/ui/src/test/setup.ts`) registers `toHaveNoViolations` globally via
`expect.extend`, and additionally polyfills `PointerEvent`/pointer-capture/`scrollIntoView` for
jsdom — a requirement `figma-to-code` never had, since React Aria Components' overlay/collection
primitives (Select's `Popover`/`ListBox`) drive interaction through APIs jsdom does not implement,
unlike that repository's plain native elements. Two local ambient-type files in
`packages/ui/src/test/` (`jest-axe.d.ts`, `vitest-matchers.d.ts`) cover `jest-axe`'s missing types,
copied from `figma-to-code`'s working pattern. Every component test file adds at least one case in
this shape: `const { container } = render(<Component .../>); expect(await axe(container)).toHaveNoViolations();`
This check is a floor, not a replacement for keyboard-model verification — axe does not evaluate
color contrast under jsdom and catches only a subset of WCAG failures; React Aria Components'
own accessibility conformance work is the primary guarantee, not this test.

## 7 · Deliberate exclusions

Explicitly out of scope for this charter's governance and for the design system in its current
phase — raising these as "gaps" is not useful without a new approved ticket:

- Public documentation site or hosted Storybook.
- Publishing this package to any registry, or any package version bump tied to design-system work.
- An automated release pipeline.
- Any Figma file, Code Connect mapping, or parity-checklist process (see §0, §1) — this repository
  has no design-file counterpart today. If one is added later, it is a **Roadmap** decision
  requiring its own ticket, not an assumed extension of this charter.
- Hand-written custom interaction/keyboard/focus/ARIA logic, except where explicitly recorded here
  as a named exclusion with its component and reason (none recorded as of this writing — Button
  and Select both compose cleanly from React Aria Components primitives).
- `apps/web` / any consuming product application — `playwright.config.ts`'s e2e suite is a
  placeholder against the built Storybook shell until one exists (see `docs/BACKLOG.md`).
- A pinned Linux Docker image for visual-regression CI parity — the `visual-regression` CI job
  runs on `macos-latest` to match locally-generated baselines, mirroring (deliberately, not
  accidentally) the same choice `figma-to-code` made; see `docs/VISUAL_REGRESSION.md`.

## 8 · Minimum documentation for a new component

Before a component is considered done, it needs, at minimum:

1. **Code-API reference** — exact prop names, types, and defaults.
2. **Usage notes** — when to use it, and, if relevant, when not to.
3. **Accessibility notes** — which React Aria Components primitive(s) it composes, and any state
   that needs manual verification beyond axe (see §6).
4. **Deliberate-exclusion notes** — what the component intentionally does not do.
5. **Storybook coverage** — stories for every public variant and meaningful state (loading/pending,
   disabled, invalid, both themes where applicable).

## See also

- [`PROJECT_OPERATIONS.md`](./PROJECT_OPERATIONS.md) — golden workflow, approval gates, current
  repository state.
- [`BACKLOG.md`](./BACKLOG.md) — current roadmap status.
- [`DECISIONS.md`](./DECISIONS.md) — durable decisions, including this repository's founding
  decision and its relationship to `figma-to-code`.
- [`VISUAL_REGRESSION.md`](./VISUAL_REGRESSION.md) — the Playwright/Storybook visual-diffing
  harness.
