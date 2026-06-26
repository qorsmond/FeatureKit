---
name: implement-slice
description: Implement one slice of an approved plan as a small, well-tested Angular/TypeScript PR, using TDD for logic. Use when starting to build from a plan or slice, when the user says "implement this", "build this slice", "let's code this", or is ready to write the feature/fix. Requires an approved plan; follows team conventions in AGENTS.md.
---

# implement-slice

Build one slice from the approved plan as a small PR that follows team conventions. Work on a single slice at a time.

## What to do

1. Re-read the plan/slice and `AGENTS.md`. Implement only what this slice covers.
2. Use **TDD** for anything with real logic — business rules, data transformations, services, and bug fixes:
   - Write a failing test that describes the behavior. Run it; confirm it fails.
   - Write the minimum code to make it pass.
   - Refactor with tests green.
   - Test **behavior through public interfaces**, not implementation details.
3. Follow team conventions (from `AGENTS.md`): the component talks to the **facade** only (never straight to a repository or HTTP); new state in a **state slice** exposed as a **Signal**; `takeUntilDestroyed()` for any leftover subscriptions; CUI components where they exist; BTLB semantic tokens for styling (no Bootstrap utilities); `type` vs `interface` per rule; no `any`; no trailing slash on endpoint base paths.
4. Keep the PR under 400 lines, single purpose. Update Storybook for new/changed components.
5. Run `yarn lint && yarn typecheck && yarn test && yarn build` and get them green.

## What not to do

- Don't make out-of-scope changes ("while I'm here" refactors) — they belong in their own slice.
- Don't introduce a new `destroy$` Subject for cleanup.
- Don't let `any` or `Record<string, any>` into types.
- Don't reach past the facade to a repository or HTTP directly.
- Don't reach for RxJS where a Signal is cleaner.
- Don't rebuild what CUI already provides.
- Don't hardcode values or reach for Bootstrap utilities — use BTLB semantic tokens.
- Don't drift from the plan silently; if the plan is wrong, stop and update it (and re-check with another dev, ideally one with more experience in that area, if significant).
- Don't test implementation details that break on every refactor.

## Output format

- The implementation, committed in small steps (per green TDD step or per logical change).
- A short PR description: what the slice does, link to the plan, and a note of anything that diverged from the plan and why.
- A reminder to the developer: **read every diff and understand every line before opening the PR.** Attach screenshots (mobile + desktop) for UI changes.
