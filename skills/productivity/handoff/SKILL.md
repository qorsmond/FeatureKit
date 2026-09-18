---
name: handoff
description: Prepare compact continuation context or create a fresh implementation task for substantial work after an approved artifact and explicit user selection. Use when context is long, work is pausing, a prototype result needs to return to planning, or work moves to another session, agent, developer, or tool.
disable-model-invocation: true
metadata:
  featurekit-version: "0.6.1"
---

# Handoff

Capture the current state without dumping the whole conversation.

## Process

1. Identify the active objective.
2. Link to the PRD, slice, prototype, or plan.
3. Summarize what is done.
4. List the next steps in order.
5. Record changed files or areas and the relevant symbols when known.
6. Capture decisions, risks, security follow-ups, gotchas, and relevant ADRs.
7. Recommend `/record-adr` for unrecorded durable architecture decisions.
8. Record the repository or project, relevant working-tree state, verification commands, and available context-efficiency tools such as Serena or RTK.
   Preserve the `orchestrate-work` ledger when relevant: accepted findings, worker routes/models where observed, failed attempts, pending ownership and escalations. Stop or explicitly coordinate active workers before transferring write ownership. Ordinary worker packets use `orchestrate-work`; they do not trigger this fresh-task flow.
9. Write the handoff to the configured location, defaulting to `docs/handoff/<slug>.md`, when a durable note is useful or the destination cannot receive a complete prompt directly.

## Fresh Implementation Task

Use this path only when implementation is substantial, an implementation-ready plan, PRD, or slice has final approval, and the user explicitly selected a fresh implementation task. Focused work continues in the current task without this destination question.

1. Prepare a self-contained implementation prompt with the approved artifact, objective, scope and out-of-scope boundaries, decisions, governing ADRs, security constraints, risks, relevant files or symbols, repository state, verification commands, and available context-efficiency tools.
2. Name the exact next skill: `/implement` for one approved plan or slice, or `/execute-slices` only when the user approved autonomous execution of the ordered slice set.
3. Do not include a conversation transcript, raw source bodies, full diffs, raw logs, repeated successful test output, or ask the destination to repeat the interview. Include the approved artifact exactly once: link it when the destination shares access, otherwise include it without also duplicating a summary of it.
4. When the harness can create a task, use its task or session creation tool only after the user selects this path. Start the new task in the same saved project, existing checkout, and active branch so it shares installed FeatureKit skills, project-scoped tools such as Serena, and required uncommitted planning artifacts or working-tree state. Do not create a worktree, branch, clone, or isolated checkout. In Codex, choose the project's local environment rather than a worktree environment.
5. If task creation cannot preserve that checkout or the current mode or permissions disable it, explain the exact enabling action and pause. Resume from the approved artifact and selected destination without asking the interview questions again.
6. If suitable task creation is unavailable, provide the exact copy-paste prompt, instruct the user to open it from the same checkout and branch, and include the handoff-note path when one was written.

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

Relevant code:
- <symbols and paths; no copied source bodies>

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
- <validate-feature verdict; actual results and code/runtime/platform tested, remaining procedures and proof gaps>

Work distribution:
- <relevant routing/results/escalations, active worker ownership, and reusable findings; unknown usage stays unknown>

Context tools:
- <Serena, RTK, equivalent tools, or bounded shell fallbacks>
```

Tell the user where the handoff was written or which fresh task was created. When creation is queued or asynchronous, surface the task identifier or link and confirm only that the handoff was dispatched, not that implementation completed.
