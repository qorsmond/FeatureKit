---
name: to-issues
description: Split a PRD or approved plan into small vertical implementation issues that can be built one at a time. Use explicitly after a PRD exists and the work is too large for one implementation session or PR.
disable-model-invocation: true
metadata:
  featurekit-version: "0.1.2"
---

# To Issues

Split a PRD into independently reviewable implementation issues.

## Process

1. Read the PRD or approved plan.
2. Read `docs/agents/issue-tracker.md`, `docs/agents/workflow-locations.md`, and relevant ADRs.
3. Identify vertical slices that each produce testable value.
4. Order slices by dependency.
5. Include governing ADRs or ADR follow-ups in the relevant issue context.
6. Write issues to the configured issue tracker or local Markdown location.

## Slicing Rules

Each issue must:

- be understandable without the whole conversation,
- have clear acceptance criteria,
- fit in a small PR,
- include verification guidance,
- avoid unrelated cleanup,
- respect accepted ADRs,
- name dependencies on earlier issues.

Avoid horizontal slices such as "add all types", "build all UI", or "wire all backend". A good slice crosses the layers needed for one behavior.

## Issue Format

```markdown
### Issue <n>: <one-line outcome>

Context:
<why this issue exists>

Scope:
<included work>

Out of scope:
<excluded work>

ADRs:
<none | governing ADRs or ADR follow-ups>

Acceptance criteria:
- <criterion>
- <criterion>

Verification:
- <tests or commands>

Depends on:
<none | issue numbers>
```

## Done

Report the issue list and where it was written.
