---
name: review-change
description: Review a code change, diff, PR, or implementation against the PRD, issue, product context, and repo conventions. Use before human review or whenever code needs risk-focused review.
---

# Review Change

Review for bugs, risk, scope drift, and missing verification.

## Process

1. Read the PRD, issue, or stated goal.
2. Read the diff or changed files.
3. Check spec match first.
4. Check repo conventions from `AGENTS.md` and `docs/agents/`.
5. Check tests and verification.
6. Report findings ordered by severity.

## Review Areas

- Does the change implement the requested behavior?
- Did it add out-of-scope work?
- Are edge cases and error states handled?
- Are data migrations or deployment steps safe?
- Are tests meaningful and behavior-focused?
- Are public interfaces typed and stable?
- Are dependencies justified?
- Did verification actually run?

## Output

Lead with findings:

```markdown
Findings:
- P1: <bug or serious risk>
- P2: <important issue>

Questions:
- <open question>

Verification gaps:
- <missing checks>

Summary:
<brief change summary only after findings>
```

If there are no findings, say so clearly and mention remaining risk or unrun checks.
