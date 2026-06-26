# Review & Verification

Two things stand between a slice and merge: **mechanical verification** (machines check it) and **review** (the spec and our standards). Both are required.

## Mechanical verification (the baseline, not optional)

Before review, every slice passes:

```
yarn lint
yarn typecheck
yarn test
yarn build
```

All green. No skipped or commented-out tests to "make it pass."

**Pre-commit hooks and branch protection are the baseline guardrails — not extras.** Pre-commit hooks catch lint/type/test failures before they reach a PR; branch protection stops anything from merging to a protected branch without the required checks and an approving review. We don't have these wired up yet, so setting them up is part of bringing this in (see [`07-tool-setup.md`](./07-tool-setup.md)). They protect the team regardless of which AI tool wrote the code.

## Review axes

Run `frontend-review` first to catch the mechanical and convention issues, then a human reviews. Check every axis:

1. **Meets the spec.** Does it do what the plan said — no more, no less? Out-of-scope changes get pulled out.
2. **Follows frontend standards.** The facade boundary is respected (components don't reach past it to a repository or HTTP); new state in slices exposed as Signals; `takeUntilDestroyed()` for any leftover subscriptions (no new `destroy$` Subjects); CUI components used where they exist; no trailing slash on endpoint base paths; graceful fallback if an endpoint is missing.
3. **Aligns with BTLB / design system** (where relevant). Semantic tokens not hardcoded values, layout patterns not ad-hoc flex/grid, `data-state` + ARIA not state classes, styling hierarchy respected (CUI → BTLB → custom), no Bootstrap utilities. Screenshots attached (mobile + desktop).
4. **Typed correctly.** No `any`, no `Record<string, any>` for responses; `type` vs `interface` used per convention; nullable/enum/optional fields typed; strict equality.
5. **Tests are meaningful.** They assert behavior through public interfaces, cover the logic and the bug being fixed, and would actually fail if the behavior regressed. Coverage theatre doesn't count.
6. **PR is small and understandable.** Under 400 lines, single purpose, no commented-out code or `console.log`, `yarn.lock` only committed if `package.json` changed, Storybook updated.

## Review output

`frontend-review` reports issues in three buckets so feedback is actionable:

- **Convention violations** — break a team rule, must fix.
- **Improvements** — would make it better, not mandatory.
- **Questions** — need context before judging.

For each, it states the issue, the convention, and the fix.

## Getting more eyes on it

For large stories and unclear-risk work, someone with more experience in that area reviewed the **plan** before code (see [`02-work-types.md`](./02-work-types.md)); they should also be on the PR review. This is about getting relevant experience on hard problems, not gating anyone — everyone uses the flow from the start.
