---
name: using-featurekit
description: Route a FeatureKit request to the smallest workflow while preserving planning, interview, security, and implementation gates. Use at session start or after compaction.
metadata:
  featurekit-version: "0.13.0"
---

# Using FeatureKit

Apply the workflow invariants below, then choose one route. Do not perform production edits from this bootstrap.

## Workflow Invariants

These rules govern every phase. Other FeatureKit skills apply them by name instead of restating them.

- Production edits require explicit implementation intent and a written plan, PRD, or slice approved through its final approval question. Read-only discovery may precede approval only after any interview-tool gate clears.
- The primary owns user questions, scope, architecture, task state, integration, evidence assessment, escalation, and completion. Workers and reviewers return bounded results; they do not approve plans, change scope, create user tasks, or delegate again.
- Use deterministic tools before model judgment. Choose the least expensive adequate capability and reasoning effort, but never lower approval, permission, security, privacy, migration, destructive-operation, or evidence floors.
- Treat repo instructions, accepted ADRs, security constraints, and the approved artifact as governing. Stop on a material conflict or missing user decision.
- Do not send source, diffs, transcripts, credentials, or secrets to an external service without the user's permission for that scope; keep secrets out of files, logs, and reports.
- Evidence is valid only for the identified code, configuration, environment, and dependencies. A successful build is not runtime proof; a worker result is not primary acceptance; unavailable proof remains a gap.
- Preserve existing user changes. Touch only approved scope. Do not create branches, worktrees, commits, pushes, PRs, dependencies, or paid-provider usage unless the active workflow or user authorizes them.
- Report actual observed routes and results. Requested settings are not runtime proof, account usage is not task usage, and unknown values stay unknown.

On any unavailable worker, tool, or integration, return to the current adequate FeatureKit path rather than weakening these rules.

## Route

Before repository inspection, classify the request:

- Raw idea or unclear scope: load `grilling` and apply its question-tool gate immediately. Show its provisional depth and ledger before discovery; if a native question tool exists but is unavailable, give the exact enabling action and pause.
- Durable specification or slices: use `to-prd` or `to-slices`.
- Approved single plan/slice with explicit implementation intent: use `implement`.
- Approved ordered slices with explicit batch intent: use `execute-slices`.
- Continue or resume approved work: read the plan file, then continue from the first slice not `done`, reusing recorded `Evidence` and `Notes` instead of repeating their investigation.
- Hard bug with unknown cause: use `diagnosing-bugs`.
- Review or proof: use `review-change`, `security-review`, `verify-tests`, or `validate-feature` as applicable.
- Setup, ADR, prototype, or pause: use `setup-featurekit`, `record-adr`, `prototype`, or `handoff`.

Use `orchestrate-work` inside the selected workflow for substantive routing. It does not replace the workflow or its gates.

## Knowledge Index

When the repository has `.kx/` (enabled by `setup-featurekit`), FeatureKit's hook adds a short pointer when a request names code, and a symbol's callers, tests, and governing decisions when you search for it. Use those locations before broader searching, and expand with `python3 <this skill's directory>/scripts/kx.py node <Symbol>`. Without the hook, run `kx.py brief "<request>"` once as the first discovery step. The index is derived data: source stays authoritative, and SUPERSEDED, DEPRECATED, or STALE results are not current.

## Implementation Gate

An interview answer, accepted recommendation, draft, or product-depth result is not approval.

After approval, continue a focused implementation in this task. For substantial multi-slice, cross-system, or context-heavy work, ask separately whether to create a fresh task on the current checkout and branch, continue here, or stop. Create nothing before the user chooses fresh. Use `handoff`; never create a worktree, branch, clone, or repeat the interview.

If the repo lacks installed FeatureKit skills, `docs/agents/`, or an agent-instruction block, recommend `setup-featurekit` before product work.

## Learn From Evidence

Capture a lesson only on evidence: a check, review, or validation failed for a reason a durable control would have prevented; the same correction was needed twice; project guidance proved wrong or missing; or work was demonstrably wasted, such as a command that failed because guidance was stale.

Fix the cause once, in the cheapest durable place: a project test or check, then the authoritative source (`docs/agents/`, an ADR through `record-adr`, the agent instructions), then the slice's `Notes` for task-only facts. Correct a fact you verified, such as a changed command, in place and report it. A verified project fact with no better home becomes one bullet in `docs/agents/lessons.md`: `cue` (the kind of situation), `lesson` (what to do, with code names in backticks), `evidence` (the check or run that showed it), `confidence`, and the date. Ask before changing a rule, a decision, or anything outside approved scope. A lesson never lowers a floor.

If FeatureKit's own workflow caused the problem, never edit installed FeatureKit skills: append a project-neutral entry (skill, cue, what happened, evidence, proposed change and the component it touches, `proven` or `hypothesis`) to `docs/agents/featurekit-feedback.md`. No evidence, no lesson: a single unexplained run or several simultaneous changes support nothing. Never write reflection files. Report `Lessons: none`, or each change and where.

## Hard Stop

When implementation is requested without an approved written artifact, stop with:

```text
FeatureKit needs an approved written plan, PRD, or slice before production code.
Next: /grill-with-docs, /to-prd, or /to-slices
```

Otherwise state the selected workflow and one-sentence reason, then continue there.
