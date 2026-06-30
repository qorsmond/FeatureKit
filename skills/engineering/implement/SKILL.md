---
name: implement
description: Implement one approved FeatureKit slice in a product repo using the repo's conventions, ADRs, tests, and verification commands. Use explicitly when a PRD or slice is approved and ready to build. Requires a written plan or slice.
disable-model-invocation: true
metadata:
  featurekit-version: "0.3.0"
---

# Implement

Implement exactly one approved slice.

## Preconditions

Before coding, confirm:

- there is a written PRD, plan, or slice,
- the scope is one slice,
- out-of-scope work is explicit,
- relevant ADRs have been checked,
- verification commands are known.

If these are missing, stop and ask to run `/grill-with-docs`, `/to-prd`, or `/to-slices`.

Apply the target repo's `Agent Operating Principles` before coding, refactoring, or verification work.

## Process

1. Read the PRD or slice.
2. Read `AGENTS.md`, `docs/agents/`, relevant ADRs, and relevant code.
3. Restate the slice in a few lines.
4. For logic, data transformations, services, bug fixes, and boundary behavior, use `tdd`.
5. Make the smallest change that satisfies the slice.
6. Do not include unrelated refactors.
7. Use `verify-tests` when new or changed tests look weak, high-risk, generated, or explicitly need proof.
8. Run the configured verification commands.
9. Report the outcome and any divergence from the plan.

## Implementation Rules

- Follow the target repo's stack and architecture.
- Treat accepted ADRs as constraints. If the slice conflicts with an accepted ADR, stop and ask for plan or ADR resolution.
- Ask before adding production dependencies.
- Keep migrations and data changes explicit.
- Handle missing or unavailable integrations gracefully where the PRD requires it.
- Keep public behavior testable through public interfaces.
- Do not silently change scope.

## Output

```markdown
Implemented:
<what changed>

Verification:
<commands run and results>

Tests:
<new or updated tests>

Test verification:
<verify-tests result | skipped and why>

ADRs:
<governing ADRs followed | conflict or update needed>

Divergence:
<none | what changed from the plan and why>

Next:
<review-change | next slice | handoff>
```
