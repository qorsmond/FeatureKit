# Implementation

You have an approved plan (and, for larger work, a set of slices). Now you build — one slice at a time — with the `implement-slice` skill.

## Start from the plan, not from scratch

The agent implements against the written plan. If something in the plan turns out to be wrong or impossible, **stop and update the plan** (and re-check with another dev, ideally one with more experience in that area, if the change is significant). Don't let implementation silently drift from the agreed spec.

## One slice at a time

Build and finish one slice before starting the next. Each slice is its own small PR. This keeps diffs reviewable and makes it trivial to back out a single piece if needed. Resist the urge to "just also fix this while I'm here" — that's how PRs balloon and reviews slow down.

## Use TDD where it earns its place

Write the test first for anything with real logic:

- business logic and rules
- data transformations / mappers
- services
- bug fixes (the regression test comes first and must fail before the fix)

The loop: write a failing test that describes the behavior → write the minimum code to make it pass → refactor with tests green. Tests run with `yarn test` (moving to Vitest with the Angular upgrade). Test **behavior through public interfaces**, not implementation details — tests that assert internal shape break on every refactor and protect nothing.

You don't need TDD for trivial presentational glue, but you do need *some* meaningful test for anything that could break.

## Keep PRs small

Target under 400 lines. Single purpose per PR. If a slice is heading past that, it was too big — split it (see [`04-splitting-work.md`](./04-splitting-work.md)).

## Read every diff

This is the line that keeps AI use safe: **you read every change and understand every line before it goes in a PR.** AI output is never accepted blindly. If you can't explain why a change is there, either understand it or remove it. The PR has your name on it; you own it.

Watch for the common agent failure modes:
- out-of-scope edits the plan didn't call for
- a component reaching past the facade to a repository or HTTP directly
- reaching for RxJS where a Signal is cleaner
- a new `destroy$` Subject instead of `takeUntilDestroyed()`
- `any` sneaking into types
- rebuilding something CUI already provides
- hardcoded values or Bootstrap utilities instead of BTLB tokens

## As you go

- Commit per slice (or per green TDD step) so history is clean and reversible.
- Run lint/typecheck/tests frequently, not just at the end.
- Update Storybook for new or changed components.
- Add screenshots (mobile + desktop) for UI changes when you open the PR.

Next: [`06-review-and-verification.md`](./06-review-and-verification.md).
