---
name: handoff
description: Prepare compact continuation context or create a fresh implementation task after an approved artifact and explicit user selection. Use when context is long, work is pausing, a prototype result needs to return to planning, or work moves to another session, agent, developer, or tool.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.2"
---

# Handoff

Capture the current state without dumping the whole conversation.

## Process

1. Identify the active objective.
2. Link to the PRD, slice, prototype, or plan.
3. Summarize what is done.
4. List the next steps in order.
5. Record changed files or areas.
6. Capture decisions, risks, security follow-ups, gotchas, and relevant ADRs.
7. Recommend `/record-adr` for unrecorded durable architecture decisions.
8. Record the repository or project, relevant working-tree state, and verification commands.
9. Write the handoff to the configured location, defaulting to `docs/handoff/<slug>.md`, when a durable note is useful or the destination cannot receive a complete prompt directly.

## Fresh Implementation Task

Use this path only when an implementation-ready plan, PRD, or slice has final approval and the user explicitly selected a fresh implementation task.

1. Prepare a self-contained implementation prompt with the approved artifact, objective, scope and out-of-scope boundaries, decisions, governing ADRs, security constraints, risks, repository state, and verification commands.
2. Name the exact next skill: `/implement` for one approved plan or slice, or `/execute-slices` only when the user approved autonomous execution of the ordered slice set.
3. Do not include a conversation transcript, ask the destination to repeat the interview, or substitute a summary for the approved artifact.
4. When the harness can create a task, use its task or session creation tool only after the user selects this path. Keep the new task in the same project and preserve required uncommitted planning artifacts or working-tree state.
5. If task creation exists but the current mode or permissions disable it, explain the exact enabling action and pause. Resume from the approved artifact and selected destination without asking the interview questions again.
6. If task creation is unavailable, provide the exact copy-paste prompt and the handoff-note path when one was written.

## Output File Format

```markdown
# Handoff: <task>

Objective:
<what we are trying to achieve>

Plan:
<link to PRD, slice, or plan>

Approval:
<approved artifact and approval state>

Done:
- <completed item>

Next:
- <next step>

Changed:
- <files or areas>

Repository state:
- <project, branch or checkout, and relevant uncommitted changes>

Decisions:
- <important decision>

ADRs:
- <governing ADRs or pending /record-adr follow-up>

Security:
- <none | open threat, security review, verification, or hardening follow-up>

Watch out for:
- <gotcha>

Suggested next skill:
<skill>

Verification:
- <commands and expected evidence>
```

Tell the user where the handoff was written or which fresh task was created. When creation is queued or asynchronous, surface the task identifier or link and confirm only that the handoff was dispatched, not that implementation completed.
