---
name: to-slices
description: Split a PRD or approved plan into small vertical implementation slices that can be built one at a time. Use explicitly after a PRD exists and the work is too large for one implementation session or PR.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.4"
---

# To Slices

Split a PRD into independently reviewable implementation slices.

## Context Budget

- Treat the PRD or approved plan as the primary source. Inspect code only when current architecture materially changes a slice boundary, dependency, acceptance criterion, or verification command.
- When code inspection is needed and Serena or an equivalent semantic tool is available, activate the project and prefer symbol overviews, symbol lookup, and reference lookup over full-file reads.
- When RTK is available, use its appropriate wrappers for noisy searches, reads, diffs, and verification discovery. Otherwise use scoped paths and bounded output. Do not install optional tools unless the user asks.
- Keep each slice self-contained with only the context needed to implement it. Reference shared PRD sections and ADRs instead of copying the whole PRD or repeating common material in every slice.

## Process

1. Read the PRD or approved plan.
2. Read `docs/agents/work-tracker.md`, `docs/agents/workflow-locations.md`, `docs/agents/security.md` if present, and relevant ADRs; do not load unrelated repo guidance.
3. Identify vertical slices that each produce testable value.
4. Order slices by dependency.
5. Include security requirements, abuse cases, and governing ADRs or ADR follow-ups in the relevant slice context.
6. Write slices to the configured work tracker or local Markdown location.
7. Show the completed slices and ask one self-contained final approval question with short context and three clear choices: approve them, ask more questions, or change them. Apply the `grilling` question contract to any reopened decision; uncertainty does not approve or settle it.
8. Treat the slices as staged until the user approves them. After approval, apply the implementation destination rules from `using-featurekit`: continue a focused slice in the current task without asking, and ask about a fresh task only for substantial work. Route a focused slice to `/implement`; route the ordered set to `/execute-slices` only when the user explicitly approved autonomous batch execution. Stop when intent is unclear.

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

Report the slice list and where it was written. Only the final approval question approves the slices. After approval, continue one focused slice in the current task when implementation was requested. For substantial work only, offer a fresh implementation task on the current checkout and branch, the current task, or stop after planning. Choose `/execute-slices` only when the user approved the ordered set to run autonomously, or `/implement` for one focused slice. If the harness cannot create or chain the destination, give one exact self-contained prompt without asking the user to repeat context.
