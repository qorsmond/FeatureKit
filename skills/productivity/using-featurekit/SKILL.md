---
name: using-featurekit
description: Lightweight FeatureKit bootstrap and router. Use at the start of FeatureKit sessions, after context compaction, or when a user asks for product or engineering work in a repo that may use FeatureKit, so the agent checks setup, chooses the right FeatureKit skill, and avoids coding before an approved written plan.
metadata:
  featurekit-version: "0.6.2"
---

# Using FeatureKit

Use this skill as a lightweight session bootstrap. It helps choose the right FeatureKit workflow before acting.

This is not a strict global gate. Hard-stop when the user asks for production code without a written plan, PRD, or slice approved through its final approval question. Accepting an interview recommendation is not final approval.

## Interview Tool Gate

Classify the request before repository inspection, fact discovery, or loading task-specific secondary skills. When the request routes to `grilling`, load that skill and apply its question-tool gate immediately:

1. Choose a provisional interview depth from the request and context already present.
2. Discover whether the harness has a native question tool and whether the current mode, configuration, or permissions allow it.
3. Show a provisional initial ledger from the request and context already present.
4. If the native tool exists but is unavailable, explain the exact user action that enables it and pause. Do not inspect the repo, search for facts, or load other task skills first.
5. Continue only after the tool is enabled or the user explicitly accepts numbered plain text. If the harness has no native question tool, use the plain-text fallback from `grilling`.

After this gate clears, discover repo facts and refine the provisional ledger through the normal design-tree process.

## Work Distribution

When the request enters an interview, clear its gate first. Then use `orchestrate-work` for substantive work in the selected workflow; requests without an interview use it directly. It chooses direct tools, the current agent, or bounded workers and selects actual worker models/effort from current host capabilities without requiring a repeated user prompt or model list. Read optional constraints/overrides from `docs/agents/orchestration.md`; a missing mapping does not disable runtime selection. Unavailable workers do not block capable direct work. Worker dispatch does not create a fresh user task or transfer ownership. Assigned workers follow their packet without restarting routing or interviewing.

Make the selected workflow and execution route visible to the user, following `orchestrate-work`'s live-feedback contract. Show requested versus runtime-reported model/effort, worker IDs when available, and meaningful changes in status; do not leave these only in a private ledger. Preserve the interview gate before any additional discovery.

## Process

1. Check whether the repo appears configured for FeatureKit:
   - installed FeatureKit skills,
   - `docs/agents/`,
   - an `Agent skills` block in `AGENTS.md` or equivalent instructions.
2. If the repo is not configured, recommend `/setup-featurekit` before product work.
3. Read the user's request and route to the smallest matching skill.
4. If the request is a raw feature idea or unclear feature scope, begin the `grilling` design-tree interview now. Apply the Interview Tool Gate before repo discovery. Do not return only a route or ask the user to repeat the idea.
5. If the request is implementation work, confirm both:
   - explicit user intent to implement now,
   - a written plan, PRD, or slice approved through its final approval question.
6. If the user only answered an interview question or accepted a recommendation, continue the interview. Only its final approval question approves the clarified plan.
7. If multiple skills might apply, choose the process skill first, then security, implementation, review, or verification skills.
8. After final approval, choose the next workflow from the plan and original request:
   - create a PRD, ADR, prototype, or slices when the approved plan requires one,
   - continue focused implementation in the current task when the approved plan is implementation-ready and the original request authorized implementation,
   - offer the implementation destination choice below only when the implementation work is substantial,
   - stop and ask when intent, authority, or scope is unclear.
9. Continue automatically through required planning artifacts when the harness permits. Focused implementation does not wait for a destination choice; substantial implementation does. If an explicit-only skill cannot be chained, give one exact invocation and preserve the current context so the user does not have to restate it.
10. Treat generated PRDs and slices as staged artifacts. Show each one and get final approval before implementation.
11. Keep non-interview routing short. Do not write production code from this bootstrap; hand control to the selected workflow.

## Implementation Destination

After an implementation-ready plan, PRD, or slice receives final approval, continue in the current task without a destination question when all of the following hold:

- the original request authorized implementation,
- the work is one focused change or slice that is likely to fit in one implementation pass,
- the current task has enough usable context remaining.

Treat implementation as substantial when it spans multiple approved slices, crosses several major subsystems, is expected to need multiple implementation passes, or the planning history has consumed enough context that continuing materially increases delivery risk. Only for substantial work, keep approval and destination choice separate and ask one structured question with these choices:

1. Create a fresh implementation task on the current checkout and branch (recommended).
2. Continue in the current task.
3. Stop after planning.

When the boundary is unclear, prefer continuing in the current task instead of asking. Do not show this implementation choice for a product-depth result that still requires a PRD, ADR resolution, prototype, or slices. If the original request did not authorize implementation, stop after planning rather than treating approval as implementation authority.

The user's fresh-task selection is the authorization to create that task. Discover the harness's task or session creation capability only after selection. Create it in the same saved project, using the current checkout and active branch; do not create a worktree, branch, clone, or isolated checkout. In Codex, use the project's local environment rather than a worktree environment so project-installed FeatureKit skills and project-scoped tools such as Serena remain available. Pass the self-contained context defined by `handoff`, use `/implement` for one approved plan or slice and `/execute-slices` only for an explicitly approved batch, and do not restart grilling in the destination.

If the creation tool cannot start a task on the current checkout or the current mode, configuration, or permissions disable it, explain the exact enabling action and pause while preserving the approved artifact and destination choice. If the harness has no suitable creation tool, provide one exact copy-paste implementation prompt that tells the user to open it from the same checkout and branch. Never silently continue implementation in the planning task when fresh was selected.

## Routes

- New repo setup: `/setup-featurekit`.
- Unsure what to do: `/ask-featurekit`.
- Raw product idea or unclear scope: begin `grilling` now; use `/grill-with-docs` when the user invoked it explicitly.
- Durable spec needed: `/to-prd`.
- Durable architectural decision: `/record-adr`.
- Security requirements, threat modeling, or hardening: `secure-design`.
- Split approved PRD or plan: `/to-slices`.
- Execute multiple approved slices: `/execute-slices`.
- Implement one approved slice after explicit approval: `/implement`.
- Hard bug or unclear failure: `diagnosing-bugs`.
- Verify generated or risky tests: `verify-tests`.
- Validate feature behavior and runtime evidence: `validate-feature`.
- Distribute bounded work or escalate a worker: `orchestrate-work` within the selected workflow.
- Review a diff or PR: `review-change`.
- Focused security review: `security-review`.
- API security work: `secure-api` inside planning, implementation, or review.
- Deployment hardening work: `secure-deploy` inside planning, implementation, or review.
- Architecture or boundary pressure: `codebase-design`.
- Disposable uncertainty check: `/prototype`.
- Pause or move context: `/handoff`.

## Hard Stop

If the user asks for production code and there is no approved written plan:

```markdown
FeatureKit needs a written plan approved through its final approval question before production code.

Recommended next skill: `/grill-with-docs`, `/to-prd`, or `/to-slices`

Why: <one-sentence reason>
```

For small work, the written plan can be short, but the interview must end with the clear final approval question before coding. For larger work, use a PRD and slices and approve those staged artifacts too.

## Output

When routing is useful, use:

```markdown
FeatureKit route:
<skill>

Why:
<short reason>

Next:
<exact prompt or action>
```
