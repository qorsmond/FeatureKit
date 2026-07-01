---
name: to-slices
description: Split a PRD or approved plan into small vertical implementation slices that can be built one at a time. Use explicitly after a PRD exists and the work is too large for one implementation session or PR.
disable-model-invocation: true
metadata:
  featurekit-version: "0.4.0"
---

# To Slices

Split a PRD into independently reviewable implementation slices.

## Process

1. Read the PRD or approved plan.
2. Read `docs/agents/work-tracker.md`, `docs/agents/workflow-locations.md`, `docs/agents/security.md` if present, and relevant ADRs.
3. Identify vertical slices that each produce testable value.
4. Order slices by dependency.
5. Include security requirements, abuse cases, and governing ADRs or ADR follow-ups in the relevant slice context.
6. Write slices to the configured work tracker or local Markdown location.

## Slicing Rules

Each slice must:

- be understandable without the whole conversation,
- have clear acceptance criteria,
- fit in a small PR,
- include verification guidance,
- include security verification when the slice touches auth, authorization, sensitive data, APIs, deployment, integrations, generated code, or untrusted input,
- avoid unrelated cleanup,
- respect accepted ADRs,
- name dependencies on earlier slices.

Avoid horizontal slices such as "add all types", "build all UI", or "wire all backend". A good slice crosses the layers needed for one behavior.

## Slice Format

```markdown
### Slice <n>: <one-line outcome>

Context:
<why this slice exists>

Scope:
<included work>

Out of scope:
<excluded work>

ADRs:
<none | governing ADRs or ADR follow-ups>

Security:
<none | security requirements, abuse cases, or checks>

Acceptance criteria:
- <criterion>
- <criterion>

Verification:
- <tests or commands>

Depends on:
<none | slice numbers>
```

## Done

Report the slice list and where it was written. Recommend `/execute-slices` when the user wants the approved slice set executed autonomously, or `/implement` when they want one slice built in a focused session.
