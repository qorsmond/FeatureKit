---
name: using-featurekit
description: Route a FeatureKit request to the smallest workflow while preserving planning, interview, security, and implementation gates. Use at session start or after compaction.
metadata:
  featurekit-version: "0.7.1"
---

# Using FeatureKit

Apply the shared [workflow invariants](../orchestrate-work/references/invariants.md), then choose one route. Do not perform production edits from this bootstrap.

## Route

Before repository inspection, classify the request:

- Raw idea or unclear scope: load `grilling` and apply its question-tool gate immediately. Show its provisional depth and ledger before discovery; if a native question tool exists but is unavailable, give the exact enabling action and pause.
- Durable specification or slices: use `to-prd` or `to-slices`.
- Approved single plan/slice with explicit implementation intent: use `implement`.
- Approved ordered slices with explicit batch intent: use `execute-slices`.
- Hard bug with unknown cause: use `diagnosing-bugs`.
- Review or proof: use `review-change`, `security-review`, `verify-tests`, or `validate-feature` as applicable.
- Setup, ADR, prototype, or pause: use `setup-featurekit`, `record-adr`, `prototype`, or `handoff`.

Use `orchestrate-work` inside the selected workflow for substantive routing. It does not replace the workflow or its gates.

## Implementation Gate

Production code requires both explicit implementation intent and a written plan, PRD, or slice approved through its final approval question. An interview answer, accepted recommendation, draft, or product-depth result is not approval.

After approval, continue a focused implementation in this task. For substantial multi-slice, cross-system, or context-heavy work, ask separately whether to create a fresh task on the current checkout and branch, continue here, or stop. Create nothing before the user chooses fresh. Use `handoff`; never create a worktree, branch, clone, or repeat the interview.

If the repo lacks installed FeatureKit skills, `docs/agents/`, or an agent-instruction block, recommend `setup-featurekit` before product work.

## Hard Stop

When implementation is requested without an approved written artifact, stop with:

```text
FeatureKit needs an approved written plan, PRD, or slice before production code.
Next: /grill-with-docs, /to-prd, or /to-slices
```

Otherwise state the selected workflow and one-sentence reason, then continue there.
