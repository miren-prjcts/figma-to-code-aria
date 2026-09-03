# Golden Pact — Project Operating Workflow

This repository uses the following mandatory collaboration workflow. Read it before proposing work or taking action.

## 1. Discuss before planning

Start with the user's goal, current project context, best practices, and the perspective most appropriate to the task (for example, senior design-systems engineer, accessibility specialist, staff frontend engineer, or delivery lead). Challenge weak assumptions constructively and identify material trade-offs.

## 2. Plan before tickets

Discuss the most efficient approach, then present a concrete plan with scope, dependencies, acceptance criteria, risks, and verification. Do not create tickets or start execution until the user explicitly approves the plan.

## 3. Ticket and model approval gate

After plan approval, create detailed tickets and propose the most suitable model and reasoning level for each. Wait for explicit user approval again before dispatching agents or making implementation changes.

## 4. Supervised execution

- Run at most a low, explicitly-confirmed number of active agents at a time (this project runs on a
  Claude Pro plan, not a higher-throughput plan — default to small batches, e.g. 2 at a time, or
  fully serial; do not reach for a five-or-six-agent pattern without confirming the budget first).
- Use isolated worktrees for independent code changes.
- **Composition-over-custom, non-negotiable:** every component's interaction/keyboard/focus/ARIA
  behavior is composed from existing `react-aria-components`/`react-aria` primitives. Hand-written
  custom behavioral logic is not permitted unless it is recorded as an explicit Deliberate
  Exclusion in `docs/DESIGN_SYSTEM_CHARTER.md` (with rationale), agreed **before** the ticket
  starts — never added silently and justified after the fact. Purely visual/CSS/token styling is
  not "custom logic" and is not subject to this gate.
- Do not create commits, push remotes, or make external changes unless included in the approved execution scope.

## 5. Review and reporting

The primary agent reviews every delivered ticket before integration: diff quality, tests, build, accessibility, documentation. Report only verified outcomes in a short summary: completed work, evidence, risks/blockers, and the next approval point.

## 6. Close the loop

When the approved batch is complete, update the operating records and propose the next best steps. Do not automatically begin them.

## Project records

- `docs/PROJECT_OPERATIONS.md` — current workflow, scope, and delivery status.
- `docs/BACKLOG.md` — approved/pending work and dependencies.
- `docs/DECISIONS.md` — durable decisions.
- `docs/DESIGN_SYSTEM_CHARTER.md` — what belongs in this design system and the composition-over-custom
  rule in detail.
