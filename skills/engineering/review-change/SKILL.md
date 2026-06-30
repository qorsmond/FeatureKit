---
name: review-change
description: Review a code change, diff, PR, or implementation against the PRD, issue, product context, ADRs, and repo conventions. Use before human review or whenever code needs risk-focused review.
metadata:
  featurekit-version: "0.1.0"
---

# Review Change

Review for bugs, risk, scope drift, and missing verification.

## Process

1. Read the PRD, issue, or stated goal.
2. Read relevant ADRs.
3. Read the diff or changed files.
4. Check spec match first.
5. Check accepted ADRs and repo conventions from `AGENTS.md` and `docs/agents/`.
6. Check tests and verification.
7. Report findings ordered by severity.

## Review Areas

- Does the change implement the requested behavior?
- Did it add out-of-scope work?
- Does it conflict with accepted ADRs?
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

ADR gaps:
- <none | missing ADR update or conflict>

Summary:
<brief change summary only after findings>
```

If there are no findings, say so clearly and mention remaining risk or unrun checks.
