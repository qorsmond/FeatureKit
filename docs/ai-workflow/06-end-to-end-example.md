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
- Security: workspace tenant isolation, API authorization, and app security checks in `docs/agents/security.md`
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

Expected behavior:

```markdown
Interview depth:
Product depth, because the next artifact should be a PRD and the feature has billing, data, and security decisions.

Round 1:
The agent begins the design-tree interview now. It does not return only a route or ask you to repeat the idea.
```

## Step 3: Ask For The Right Flow

```text
/ask-featurekit

I want to add usage limits to FramerHub so workspaces on different plans can only have a certain number of active client projects.
```

Expected behavior:

```markdown
The agent begins the same design-tree interview immediately. It uses the repo context already available in the session.
```

## Step 4: Grill The Idea

```text
/grill-with-docs

Feature idea: workspaces on different plans should have project usage limits.
```

The agent reads plan, project-state, authorization, and billing context before asking you for facts. It maps decisions and asks only ready choices. A native question UI may show a round like this:

```markdown
1. Archived projects are kept as history. Counting them would reduce the current allowance even when nobody is working in them. Which projects should use the limit?

- Active projects only (Recommended): This keeps old project history without using the current allowance.
- All saved projects: Archived projects also use the allowance.
- Custom answer

2. The limit can either stop new work or act only as guidance. Stopping creation enforces the plan, while a warning lets the workspace exceed it. What should happen when the workspace reaches its limit?

- Block new projects (Recommended): Existing work stays available, but the workspace cannot add another active project.
- Warn but allow: The limit is guidance and does not stop creation.
- Custom answer

3. Adding an upgrade path would expand this work into checkout and billing behavior. Keeping billing separate makes this feature smaller and avoids changing payments. Should this feature include billing changes?

- No billing changes (Recommended): Enforce existing plan limits without changing checkout or upgrades.
- Add upgrade flow: Include billing and plan changes in this feature.
- Custom answer
```

You answer:

```text
Active projects only. Block new projects at the limit. Billing changes are out of scope.
```

The answers reshape the tree. The next round asks decisions that are now ready, such as:

- which plans have which limits,
- whether admins can override limits,
- whether the limit is enforced in UI, API, or both,
- which authorization and tenant-boundary checks protect the create-project path,
- what copy users see,
- how rollout and verification should work.

After every round, the agent shows a short ledger of settled, ready, blocked, and removed decisions, including the reason for each block. If a repo fact needs more research, that search blocks only the questions that need it. The agent asks unrelated ready decisions now.

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

Security:
- Enforce the limit server-side in the workspace tenant boundary.
- Add regression coverage for cross-workspace access if the create-project path accepts workspace IDs.

ADR follow-up:
- none, unless the team decides a new durable data ownership or enforcement boundary.

Next options:
- Create a staged PRD because this feature spans policy, API, UI, and security behavior.
```

The agent then asks one final approval question through the native question UI:

```markdown
Does this plan match what you want?

- Yes, approve it (Recommended): Approve the clarified plan and create the staged PRD.
- Ask more questions: Reopen the design tree because an important choice is missing.
- Change the plan: Keep the main plan but correct something.
```

Only the first choice approves the clarified plan. Earlier answers do not. After approval, FeatureKit creates the PRD automatically when the harness can chain the next skill. Otherwise it gives one exact `/to-prd` invocation without asking you to repeat the context.

Because this result is product-depth and still needs a PRD, FeatureKit does not offer implementation yet. After a later focused implementation-ready slice is approved, FeatureKit continues in the current task when the original request included implementation. If the approved work is substantial, it asks a separate question:

```markdown
The approved work is substantial. A fresh task gives implementation a full context window, while continuing here keeps the planning history in the same task. Where should implementation continue?

- Fresh implementation task on this checkout and branch (Recommended): Create a new task with the approved artifact, constraints, repository state, and verification commands, without creating a worktree.
- Continue in this task: Keep working here after the current mode permits implementation.
- Stop after planning: Keep the approved artifact without starting implementation.
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

## Security And Abuse Cases
Project-limit enforcement must happen server-side and respect workspace tenant boundaries. A user must not be able to create a project for another workspace by changing a workspace ID.

## ADR Context
Follow existing ADRs for plan configuration and domain/API boundaries. Record a new ADR if no accepted decision covers the enforcement boundary.

## Acceptance Criteria
- A workspace under the limit can create a project.
- A workspace at the limit cannot create another active project.
- Archived projects do not count.
- Cross-workspace project creation is rejected if the API receives a workspace ID.
- The UI explains why project creation is unavailable.
```

The PRD is saved in the configured PRD location, for example:

```text
docs/prd/workspace-project-usage-limits.md
```

The PRD is a richer staged artifact. Review it and use its own final approval question before continuing. Writing it is not approval to implement.

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
- Cross-workspace project creation is rejected if the API receives a workspace ID.
- A regression test covers under-limit and at-limit behavior.

Security:
- Use `secure-api` for object-level authorization and tenant-boundary checks.
- Include negative authorization tests if the route accepts user-controlled workspace identifiers.

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

Review the slice list and use its final approval question before implementation. Continue a focused slice in the current task. If substantial work needs clean context, use `/handoff` and start the fresh task from the same checkout and branch.

## Step 7: Implement One Slice

After approving the PRD and Slice 1, continue in the current task because this is one focused slice. Give the agent one approved slice only.

```text
/implement

Use docs/prd/workspace-project-usage-limits.md.
Implement approved Slice 1 only: Enforce project limit in the domain/API path.
Do not implement UI changes or billing changes.
Run the verification commands from docs/agents/verification.md.
Use docs/agents/security.md for workspace tenant-boundary rules.
```

Expected implementation behavior:

- reads the PRD and slice,
- reads relevant accepted ADRs,
- reads `docs/agents/security.md`,
- reads relevant code,
- uses `secure-api` because this slice changes API/domain authorization behavior,
- writes a failing test first for the limit rule,
- implements the smallest change,
- runs the verification commands,
- reports files changed and any divergence from the PRD.

If both slices are approved and you explicitly want one autonomous session to run them sequentially instead:

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
- stops for blockers, ADR conflicts, unresolved P0/P1 security findings, failing verification, or unclear scope,
- does not commit, push, merge, or open a PR.

## Step 8: Review

After implementation:

```text
Use review-change to review the diff against docs/prd/workspace-project-usage-limits.md and Slice 1.
```

For a focused security pass:

```text
Use security-review to review the create-project API changes against docs/agents/security.md.
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

Security gaps:
- `security-review` still needed for tenant-boundary coverage.

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

Approval:
- The PRD and Slices 1-2 are approved.

Done:
- Slice 1 implemented and tested.

Next:
- If the current task is context-constrained, start a fresh task for Slice 2 UI state on this same checkout and branch.

Repository state:
- Current project and checkout recorded; unrelated working changes preserved.

ADRs:
- No ADR update pending.

Security:
- Tenant-boundary review remains open for Slice 1.

Watch out for:
- Archived projects must not count.
- Billing changes are out of scope.

Suggested next skill:
/implement

Verification:
- Run the repository checks from docs/agents/verification.md.
```

This is the pattern to reuse for Blitza, FramerHub, or any other real product.

## Series Navigation

- Previous: [Local LLMs](./05-local-llms.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Security Workflow](./08-security.md)
