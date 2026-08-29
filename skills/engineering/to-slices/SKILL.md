---
name: to-slices
description: Split a PRD or approved plan into small vertical implementation slices that can be built one at a time. Use explicitly after a PRD exists and the work is too large for one implementation session or PR.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.1"
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
7. Show the completed slices and ask one final approval question with three clear choices: approve them, ask more questions, or change them.
8. Treat the slices as staged until the user approves them. After approval, continue to implementation only when the original request asked to make the change and the harness permits chaining. Otherwise give one exact `/execute-slices` or `/implement` invocation. Stop when intent is unclear.

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

Report the slice list and where it was written. Only the final approval question approves the slices. After approval, choose `/execute-slices` when the original request calls for the ordered set to run autonomously, or `/implement` for one focused slice. If the harness cannot chain an explicit-only skill, give one exact invocation without asking the user to repeat context.
