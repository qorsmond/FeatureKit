---
name: frontend-review
description: Review an Angular/TypeScript diff or PR against the story spec and the team's frontend standards, and apply the same standards when generating or refactoring code. Use when reviewing a PR, diff, or snippet, when the user mentions code review, PR review, subscription cleanup, takeUntilDestroyed, CUI components, BTLB styling, OnPush, async pipe, typing conventions, or whenever new Angular code should conform to team standards from the start.
---

# frontend-review

Review code on two axes — **does it meet the spec** and **does it follow our standards** — and report issues so they're easy to act on. Apply the same checks when writing or refactoring code, not just when reviewing.

## What to do

Check the diff against the plan/spec first, then against every standards area:

**Spec**
- Does it do what the plan said — no more, no less? Flag out-of-scope changes.

**Standards (from `AGENTS.md`)**
- **Architecture:** the component talks to the **facade** only — flag anything reaching past it to a repository or HTTP directly. New state lives in a slice exposed as a **Signal**; flag RxJS used where a Signal is cleaner.
- **Subscription cleanup:** `takeUntilDestroyed()` (no args) for any leftover subscriptions in Angular-managed contexts; `DestroyRef` passed outside them. Flag any new `destroy$` Subject.
- **Components:** CUI components used where they exist (not rebuilt).
- **Styling / BTLB:** semantic tokens not hardcoded values; layout patterns not ad-hoc flex/grid; `data-state` + ARIA not state classes; styling hierarchy CUI → BTLB → custom; no Bootstrap utilities; no inline styles; `::ng-deep` scoped with `:host`.
- **TypeScript:** no `any` / `Record<string, any>` for responses; `type` by default, `interface` only when intentionally extended; strict equality; nullable/enum/optional fields typed; explicit param passing.
- **Backend:** endpoint base paths without trailing slash; response types explicit; graceful fallback if an endpoint is unavailable.
- **Tests:** meaningful, assert behavior through public interfaces, cover the logic and any bug being fixed, would fail on regression.
- **PR hygiene:** under 400 lines, single purpose, no commented-out code or `console.log`, `yarn.lock` only if `package.json` changed, Storybook updated, screenshots (mobile + desktop) for UI.

## What not to do

- Don't just list problems — explain the convention and the fix.
- Don't approve code you can't explain.
- Don't nitpick style the linter already enforces; focus on what machines can't catch.

## Output format

Three buckets:

- **Convention violations** — break a team rule, must fix.
- **Improvements** — would make it better, not mandatory.
- **Questions** — need context before judging.

For each item: what the issue is, what the convention says, and what the fix looks like.
