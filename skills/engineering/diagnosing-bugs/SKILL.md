---
name: diagnosing-bugs
description: Diagnose and fix hard, flaky, unclear, or production-impacting bugs. Use when the user reports broken behavior, cannot reproduce an issue, sees intermittent failures, or needs a root-cause-driven regression fix.
metadata:
  featurekit-version: "0.12.0"
---

# Diagnosing Bugs

Find the real cause before fixing.

Apply the target repo's `Agent Operating Principles` before coding, refactoring, or verification work.

Use `orchestrate-work` for bounded reproduction/investigation or approved fixes. Keep ambiguous root-cause decisions with adequate reasoning. Read-only diagnosis may precede approval; production edits still require an approved written plan under `using-featurekit`. Assigned workers do not delegate again.

## Process

1. Reproduce the bug.
2. Minimize the reproduction.
3. State a hypothesis and why it fits the evidence.
4. Read relevant ADRs and `docs/agents/security.md` if present before changing architecture, data flow, integrations, security-sensitive behavior, or deployment behavior.
5. Instrument only if needed, and remove temporary instrumentation.
6. Write a failing regression test.
7. Fix the smallest cause.
8. Use `secure-code`, `secure-api`, or `secure-deploy` when the bug touches their trigger areas.
9. Use `verify-tests` for production-impacting, security-sensitive regressions or when the regression test might not fail for the right reason.
10. Run verification and use `validate-feature` to reproduce the fix in the affected runtime/platform. Carry any device, environment or manual-proof gap explicitly; a passing regression test may not prove the full runtime requirement.

## Do Not

- Do not guess and patch without a reproduction.
- Do not ship without a regression test unless impossible and explicitly explained.
- Do not leave temporary logs or debug code.
- Do not broaden the change beyond the bug.
- Do not violate accepted ADRs; recommend `/record-adr` if the bug fix requires changing one.

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

Test verification:
<verify-tests result | skipped and why>

Security:
<secure-code/secure-api/secure-deploy result | skipped and why>

Verification:
<validate-feature verdict, commands/runtime evidence and remaining gaps>

Work distribution:
<direct work or worker route, evidence, escalation and primary disposition>

ADRs:
<none | governing ADRs followed or ADR update needed>
```
