---
name: diagnosing-bugs
description: Diagnose and fix hard, flaky, unclear, or production-impacting bugs. Use when the user reports broken behavior, cannot reproduce an issue, sees intermittent failures, or needs a root-cause-driven regression fix.
---

# Diagnosing Bugs

Find the real cause before fixing.

## Process

1. Reproduce the bug.
2. Minimize the reproduction.
3. State a hypothesis and why it fits the evidence.
4. Instrument only if needed, and remove temporary instrumentation.
5. Write a failing regression test.
6. Fix the smallest cause.
7. Run verification.

## Do Not

- Do not guess and patch without a reproduction.
- Do not ship without a regression test unless impossible and explicitly explained.
- Do not leave temporary logs or debug code.
- Do not broaden the change beyond the bug.

## Output

```markdown
Reproduction:
<steps or conditions>

Cause:
<root cause>

Fix:
<what changed>

Regression test:
<what fails before and passes after>

Verification:
<commands run>
```
