# Tickets

Tickets are planning artifacts, not authorization to begin work — see `AGENTS.md` and
`docs/PROJECT_OPERATIONS.md`'s Golden workflow. Naming convention: `ARIA-{seq}-{kebab-slug}.md`
(a fresh sequence, deliberately not continuing `figma-to-code`'s `DSV*` numbering — see
`docs/DECISIONS.md`'s founding entry for why this is a separate repository, not a continuation).

Ticket shape (mirrors `figma-to-code`'s template): `## Dependency`, `## Objective`, `## Scope`,
`## Deliberate exclusions`, `## Acceptance criteria`, `## Handoff`.

## Phase 1 — First components

| Ticket                         | Scope                                                              | Status |
| ------------------------------ | ------------------------------------------------------------------ | ------ |
| [ARIA-001](ARIA-001-button.md) | Button — composed from React Aria Components' `Button`             | Done   |
| [ARIA-002](ARIA-002-select.md) | Select — composed from `Select` + `Button` + `Popover` + `ListBox` | Done   |

## Sequencing

`ARIA-001` and `ARIA-002` were run sequentially (not concurrently) in one session, since both were
also serving as the first real test of `DESIGN_SYSTEM_CHARTER.md` §4's composition-over-custom
rule — running them one after another let each real API question (e.g. React Aria Components'
exact `isPending`/keyboard-focus behavior) get resolved once, against the installed package, before
starting the next component, rather than guessing twice in parallel.
