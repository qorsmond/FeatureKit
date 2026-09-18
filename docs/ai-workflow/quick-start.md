# Quick Start

Use this path when FeatureKit is already installed and the product repo has already been set up. The goal is to take one real feature idea from raw intent to an approved, implemented, reviewed slice.

FeatureKit does not replace your product stack. It gives your coding agent a repeatable workflow: read the repo context, clarify the feature, write a plan, get approval, implement the approved slice, verify it, review it, and hand off cleanly.

For bounded worker routing and runtime-aware acceptance evidence, see the [Orchestration guide](./09-orchestration.md).

Need install? See [Install](./01-install.md).

Need repo setup? See [Setup](./02-setup.md). A prepared repo should have FeatureKit skills available, `/setup-featurekit` already run, and repo guidance under `docs/agents/`.

## 1. Start The Feature Session

In the product repo, start a known raw feature idea directly with `/grill-with-docs`:

```text
/grill-with-docs

Feature idea: add team invitations so workspace admins can invite coworkers by email.
```

The agent should read repo context first, build a dependency-aware design tree, and ask ready decisions in short rounds through the harness question UI. Every question should contain its own short context, use the user's words, describe what each option causes, include a recommended answer, and never ask for facts the agent can discover. If the user is unsure or does not understand, the agent explains and re-asks that decision instead of inferring an answer. The interview ends with the complete written plan and a clear final approval question. It should not write production code inside this skill.

Use `using-featurekit` as the model-invoked or session-start bootstrap. Put `Use using-featurekit before acting.` in saved instructions, pinned instructions, or a session-start hook when your harness supports that. A raw feature request should enter the interview immediately, without running another skill or repeating the idea.

If you do not know which skill fits, ask directly:

```text
/ask-featurekit

I want to add team invitations so workspace admins can invite coworkers by email.
```

Expected behavior:

```markdown
The agent begins the same design-tree interview immediately because this feature needs scope, permissions, email behavior, and user-facing states clarified before planning or implementation.
```

## 2. Clarify The Real Feature

Use the `/grill-with-docs` conversation to turn the raw idea into a reviewable feature plan.

The clarified plan should make these things explicit:

- goal and users,
- scope and out of scope,
- important product decisions,
- data, state, UX, API, and error behavior,
- security or abuse cases,
- risks and unknowns,
- acceptance criteria,
- recommended next step.

Answering an interview question is not approval. Accepting a recommended answer is not approval. The agent must show the complete plan and ask the final approval question.

## 3. Choose The Planning Depth

For very small work, the clarified written plan may be enough. Review it, then explicitly approve it before implementation.

For product work that needs a durable spec, use `/to-prd`:

```text
/to-prd

Turn the clarified team-invitations feature into a PRD.
```

For multi-step work, split the approved PRD into implementation slices:

```text
/to-slices

Use docs/prd/team-invitations.md and split it into small vertical implementation slices.
```

The agent should write or update the configured PRD or slice location from `docs/agents/workflow-locations.md`. Review the PRD or slice list before coding.

## 4. Approve Exactly What Should Be Built

Production code waits for an approved written plan, PRD, or slice.

Approve one implementation scope in plain language:

```text
I approve Slice 1 from docs/prd/team-invitations.md: create and persist pending invitations.
Use /implement to implement only Slice 1.
Do not implement invite acceptance, email delivery, or admin UI yet.
```

For a focused slice, continue in the current task without another destination question. When implementation is substantial or the planning history leaves too little usable context, a fresh task can keep context small and make the diff easier to review.

Only for substantial work, FeatureKit asks where implementation should continue:

- create a fresh implementation task on the current checkout and branch (recommended),
- continue in the current task,
- stop after planning.

This choice is separate from approval. Focused implementation that was already requested continues in the current task. When a fresh task is selected, it uses the same saved project checkout and active branch instead of creating a worktree. If the harness cannot do that, FeatureKit provides one exact self-contained implementation prompt.

## 5. Implement One Slice

In the implementation session, give the agent the approved scope and verification expectations:

```text
/implement

Use docs/prd/team-invitations.md.
Implement approved Slice 1 only: create and persist pending invitations.
Do not implement invite acceptance, email delivery, or admin UI yet.
Run the verification commands from docs/agents/verification.md.
Use docs/agents/security.md for authorization and abuse-case checks.
```

The implementation agent should:

- read the approved plan or slice,
- read `AGENTS.md`, `docs/agents/`, relevant ADRs, and relevant code,
- restate the slice before changing files,
- use TDD for testable behavior,
- use security skills when the slice touches auth, authorization, APIs, sensitive data, deployment, integrations, generated code, or untrusted input,
- make the smallest scoped change,
- run the configured verification commands,
- report any divergence from the approved plan.

Use `/execute-slices` only when the PRD and ordered slices are already approved and you explicitly want the agent to run the queue sequentially.

## 6. Review Before Accepting

Ask for a review against the approved plan or slice:

```text
Use review-change to review this diff against docs/prd/team-invitations.md and approved Slice 1.
```

For security-sensitive work, also ask:

```text
Use security-review to review the invitation authorization, token, and abuse-case behavior.
```

For generated, risky, or assertion-light tests, ask:

```text
Use verify-tests to check whether the new tests prove the approved invitation behavior.
```

Fix blocking findings before continuing to the next slice or opening a PR.

## 7. Hand Off Or Continue

When a session is long, context is crowded, or another agent will continue the feature, run:

```text
/handoff

Write a handoff for the team-invitations work.
```

If substantial work needs a fresh task, start it from the same saved project checkout and active branch with the handoff, approved PRD or slice list, and repo guidance under `docs/agents/`. When suitable task creation is available, selecting the fresh-task option performs this handoff for you without creating a worktree.

## Fast Path

```text
/grill-with-docs
/to-prd
/to-slices
I approve Slice 1. Use /implement to implement only Slice 1.
Use review-change on this diff.
/handoff
```

Start with `/ask-featurekit` instead of `/grill-with-docs` only when you are unsure which skill fits. Keep `using-featurekit` in session-start instructions or let the agent invoke it automatically. Skip `/to-prd` or `/to-slices` only when the written plan is small, clear, and explicitly approved for `/implement`.

## Series Navigation

- Index: [FeatureKit Guide](./README.md)
- Next: [Overview](./00-overview.md)
