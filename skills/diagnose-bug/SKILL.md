---
name: diagnose-bug
description: Systematically diagnose and fix a frontend bug, especially one that is hard to reproduce or whose cause is unclear. Use when the user reports a bug, says "this is broken", "can't reproduce", "intermittent", "flaky", or asks why something is failing. Produces a fix plus a regression test.
---

# diagnose-bug

Find the real cause of a bug before fixing it, and lock the fix in with a regression test. Resist jumping straight to a guessed fix.

## What to do

1. **Reproduce.** Establish a reliable way to trigger the bug. If it's intermittent, narrow the conditions until it's consistent. If you can't reproduce it, gather what's needed (steps, data, environment) before guessing.
2. **Minimize.** Strip the reproduction down to the smallest case that still shows the bug. This usually points at the cause.
3. **Hypothesize.** State what you think is causing it and why, based on the minimized case and the code.
4. **Instrument if needed.** Add temporary logging/inspection to confirm the hypothesis. Remove it afterward.
5. **Write a failing test** that captures the bug (it should fail for the current code).
6. **Fix** with the minimum change that makes the test pass, following team conventions in `AGENTS.md`.
7. **Verify** the test now passes and nothing else broke: `yarn lint && yarn typecheck && yarn test && yarn build`.

## What not to do

- Don't fix before you can reproduce and explain the cause.
- Don't ship a fix without a regression test.
- Don't leave temporary logging or `console.log` in the code.
- Don't expand the change beyond what fixes the bug.

## Output format

```
**Reproduction:** <steps / conditions>
**Cause:** <the actual root cause>
**Fix:** <what changed and why>
**Regression test:** <what it asserts; failed before, passes after>
```
