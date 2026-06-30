# End-to-End Example

This example shows the full FeatureKit flow for a real product-style feature.

## Raw Idea

You are building FramerHub, a SaaS product for managing client website projects. You want to add project usage limits so each plan can control how many active client projects a workspace can have.

Raw prompt:

```text
I want to add usage limits to FramerHub so workspaces on different plans can only have a certain number of active client projects.
```

## Step 1: Setup

In the FramerHub repo, run:

```text
/setup-featurekit
```

Expected output shape:

```markdown
Setup complete.

Configured:
- Work tracker: GitHub Issues
- Domain docs: single-context `CONTEXT.md` plus `docs/adr/`
- Verification: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- PRDs: `docs/prd/`
- ADRs: `docs/adr/`
- Handoffs: `docs/handoff/`
```

The setup skill writes `docs/agents/*.md` so later skills know how this repo works.

## Step 2: Bootstrap The Session

At the start of the next FeatureKit session, use the bootstrap:

```text
using-featurekit

I want to add usage limits to FramerHub so workspaces on different plans can only have a certain number of active client projects.
```

Expected output shape:

```markdown
FeatureKit route:
`/grill-with-docs`

Why:
This is a product feature with plan, billing, data model, and UX implications.
```

## Step 3: Ask For The Right Flow

```text
/ask-featurekit

I want to add usage limits to FramerHub so workspaces on different plans can only have a certain number of active client projects.
```

Expected output shape:

```markdown
Use `/grill-with-docs` first.

Reason: this is a product feature with plan, billing, data model, and UX implications.

Stay in this session for grilling, then use `/to-prd`. Split with `/to-slices` if the PRD touches multiple areas.
```

## Step 4: Grill The Idea

```text
/grill-with-docs

Feature idea: workspaces on different plans should have project usage limits.
```

Expected interview style:

```markdown
Question: Which project states should count toward the limit?

Recommendation: Count only active projects, not archived or deleted projects.

Reason: This preserves historical project data while making the limit match what customers are actively using.
```

You answer:

```text
Yes, active only. Archived projects should not count.
```

The agent continues one question at a time until the feature is clear:

- which plans have which limits,
- what happens when a workspace reaches the limit,
- whether admins can override limits,
- whether the limit is enforced in UI, API, or both,
- what copy users see,
- whether billing changes are in scope.

Expected final output shape:

```markdown
Clarified goal:
Add active-project limits per workspace plan.

Key decisions:
- Active projects count.
- Archived and deleted projects do not count.
- Enforcement happens in the API and the create-project UI.
- Billing changes are out of scope.
- Admin override is out of scope for v1.

Domain terms to add:
- active project
- project limit
- limit reached state

ADR follow-up:
- none, unless the team decides a new durable data ownership or enforcement boundary.
```

If the interview settles a durable architectural decision, record it before the PRD:

```text
/record-adr

Record the decision that project-limit enforcement belongs in the domain/API path, not only in UI checks.
```

## Step 5: Create A PRD

```text
/to-prd

Turn the clarified usage-limits feature into a PRD.
```

Expected PRD shape:

```markdown
# PRD: Workspace Project Usage Limits

## Goal
Prevent workspaces from creating more active client projects than their plan allows.

## Scope
- Store or resolve a project limit per plan.
- Count active projects per workspace.
- Block create-project when the limit is reached.
- Show a clear limit-reached state in the UI.

## Out Of Scope
- Billing checkout changes.
- Admin override.
- Automated upgrade flow.

## ADR Context
Follow existing ADRs for plan configuration and domain/API boundaries. Record a new ADR if no accepted decision covers the enforcement boundary.

## Acceptance Criteria
- A workspace under the limit can create a project.
- A workspace at the limit cannot create another active project.
- Archived projects do not count.
- The UI explains why project creation is unavailable.
```

The PRD is saved in the configured PRD location, for example:

```text
docs/prd/workspace-project-usage-limits.md
```

## Step 6: Split Into Slices

```text
/to-slices

Use docs/prd/workspace-project-usage-limits.md and split it into small vertical slices.
```

Expected slice shape:

```markdown
### Slice 1: Enforce project limit in the domain/API path

Acceptance criteria:
- The create-project path checks the workspace plan limit.
- Active projects count toward the limit.
- Archived/deleted projects do not count.
- A regression test covers under-limit and at-limit behavior.

Depends on: none
```

```markdown
### Slice 2: Show limit-reached state in the create-project UI

Acceptance criteria:
- The create-project action is unavailable when the workspace is at the limit.
- The user sees plan-aware copy explaining the limit.
- The UI degrades cleanly if limit data is unavailable.

Depends on: Slice 1
```

## Step 7: Implement One Slice

Start a fresh session. Give the agent one slice only.

```text
/implement

Use docs/prd/workspace-project-usage-limits.md.
Implement Slice 1 only: Enforce project limit in the domain/API path.
Do not implement UI changes or billing changes.
Run the verification commands from docs/agents/verification.md.
```

Expected implementation behavior:

- reads the PRD and slice,
- reads relevant accepted ADRs,
- reads relevant code,
- writes a failing test first for the limit rule,
- implements the smallest change,
- runs the verification commands,
- reports files changed and any divergence from the PRD.

If both slices are approved and you want one autonomous session to run them sequentially instead:

```text
/execute-slices

Use docs/prd/workspace-project-usage-limits.md and the approved usage-limit slices.
Do not implement billing changes.
Run the verification commands from docs/agents/verification.md.
```

Expected execution behavior:

- executes slices in dependency order,
- uses subagents when available,
- reviews after each slice,
- stops for blockers, ADR conflicts, failing verification, or unclear scope,
- does not commit, push, merge, or open a PR.

## Step 8: Review

After implementation:

```text
Use review-change to review the diff against docs/prd/workspace-project-usage-limits.md and Slice 1.
```

Expected review shape:

```markdown
Findings:
- P1: The API check counts archived projects, which contradicts the PRD.
- P2: Missing regression test for the under-limit case.

Questions:
- Should deleted projects be hard-deleted or status-filtered in this code path?

Verification:
- `pnpm test` was run.
- `pnpm build` was not run.

ADR gaps:
- none
```

Fix findings before opening a PR.

## Step 9: Handoff

If the session needs to stop:

```text
/handoff

Write a handoff for the project usage limits work.
```

Expected handoff shape:

```markdown
# Handoff: Workspace Project Usage Limits

Objective:
Add active-project limits by workspace plan.

Plan:
docs/prd/workspace-project-usage-limits.md

Done:
- Slice 1 implemented and tested.

Next:
- Start fresh session for Slice 2 UI state.

ADRs:
- No ADR update pending.

Watch out for:
- Archived projects must not count.
- Billing changes are out of scope.
```

This is the pattern to reuse for Blitza, FramerHub, or any other real product.

## Series Navigation

- Previous: [Local LLMs](./05-local-llms.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Troubleshooting](./07-troubleshooting.md)
