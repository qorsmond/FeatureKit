---
name: implement
description: Implement one approved FeatureKit slice in a product repo using the repo's conventions, ADRs, tests, and verification commands. Use explicitly when a PRD or slice is approved and ready to build. Requires a written plan or slice.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.1"
---

# Implement

Implement exactly one approved slice.

## Preconditions

Before coding, confirm:

- the original or current request explicitly asked to make the change,
- there is a written PRD, plan, or slice,
- the written PRD, plan, or slice has been shown to the user and approved,
- the scope is one slice,
- out-of-scope work is explicit,
- relevant ADRs have been checked,
- security context from `docs/agents/security.md` has been checked when present,
- verification commands are known.

If these are missing, stop and ask to run `/grill-with-docs`, `/to-prd`, or `/to-slices`.

A clarified feature summary is not enough by itself. Accepting an interview recommendation is not approval. A final confirmation of an implementation-ready clarified plan satisfies plan approval; final approval of a PRD or slice satisfies approval for that artifact. If implementation intent is unclear, stop and ask.

Apply the target repo's `Agent Operating Principles` before coding, refactoring, or verification work.

## Process

1. Read the PRD or slice.
2. Read `AGENTS.md`, `docs/agents/`, relevant ADRs, and relevant code.
3. Restate the slice in a few lines.
4. Use `secure-code` before coding when the slice touches untrusted input, auth, authorization, sensitive data, secrets, crypto, storage, files, network calls, dependencies, errors, logging, or generated code.
5. Use `secure-api` for API routes, webhooks, GraphQL, RPC, service boundaries, or third-party API consumption.
6. Use `secure-deploy` for deployment, runtime, CI/CD, secrets, IAM, migrations, artifact, or environment changes.
7. For logic, data transformations, services, bug fixes, and boundary behavior, use `tdd`.
8. Make the smallest change that satisfies the slice.
9. Do not include unrelated refactors.
10. Use `verify-tests` when new or changed tests look weak, high-risk, generated, security-sensitive, or explicitly need proof.
11. Run the configured verification commands.
12. Report the outcome and any divergence from the plan.

## Implementation Rules

- Follow the target repo's stack and architecture.
- Treat accepted ADRs as constraints. If the slice conflicts with an accepted ADR, stop and ask for plan or ADR resolution.
- Ask before adding production dependencies.
- Keep migrations and data changes explicit.
- Preserve security requirements from the PRD or slice; do not silently weaken them to simplify implementation.
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

Security:
<secure-code/secure-api/secure-deploy result | skipped and why>

ADRs:
<governing ADRs followed | conflict or update needed>

Divergence:
<none | what changed from the plan and why>

Next:
<review-change | next slice | handoff>
```
