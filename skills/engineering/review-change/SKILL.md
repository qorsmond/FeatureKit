---
name: review-change
description: Review a code change, diff, PR, or implementation against the PRD, slice, product context, ADRs, and repo conventions. Use before human review or whenever code needs risk-focused review.
metadata:
  featurekit-version: "0.5.0"
---

# Review Change

Review for bugs, security risk, scope drift, and missing verification.

Apply the target repo's `Agent Operating Principles` when checking scope, simplicity, and unrelated changes.

## Process

1. Read the PRD, slice, or stated goal.
2. Read relevant ADRs and `docs/agents/security.md` if present.
3. Read the diff or changed files.
4. Check spec match first.
5. Check accepted ADRs and repo conventions from `AGENTS.md` and `docs/agents/`.
6. Check tests and verification.
7. Check security-sensitive changes with `secure-code`, `secure-api`, or `secure-deploy` as applicable.
8. Use `security-review` when the diff touches material auth, authorization, tenant isolation, secrets, sensitive data, APIs, deployment, generated code, or other exploitable risk.
9. Use `verify-tests` when tests look weak, generated, assertion-light, high-risk, security-sensitive, or mutation testing was requested.
10. Report findings ordered by severity.

## Review Areas

- Does the change implement the requested behavior?
- Did it add out-of-scope work?
- Does it conflict with accepted ADRs?
- Are edge cases and error states handled?
- Are data migrations or deployment steps safe?
- Are auth, authorization, tenant boundaries, secrets, sensitive data, and security-relevant errors handled safely?
- Are API and deployment changes checked against the repo's security context?
- Are tests meaningful and behavior-focused?
- Would the tests fail if the protected behavior were wrong?
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

Security gaps:
- <none | security-review needed, missing threat model, or security control gap>

ADR gaps:
- <none | missing ADR update or conflict>

Summary:
<brief change summary only after findings>
```

If there are no findings, say so clearly and mention remaining risk or unrun checks.
