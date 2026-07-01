# Quick Start

Use this path when you want to start building a product with FeatureKit quickly.

FeatureKit does not replace your product stack. It gives your coding agent a repeatable workflow: set up repo context, clarify the product goal, write the plan, split the work, implement approved slices, verify, review, and hand off.

## 1. Install FeatureKit In The Product Repo

From the repo where you want to build the product:

```bash
cd /path/to/product-repo
npx skills@latest add qorsmond/FeatureKit -a codex -a claude-code -a opencode
```

Use only the agent flags you need. Because FeatureKit v1 is private, run this from an environment that can read the GitHub repo.

If you are testing from a local FeatureKit checkout, install from that path instead:

```bash
npx skills@latest add /absolute/path/to/FeatureKit -a codex
```

## 2. Add The Session Bootstrap

Add this startup instruction to your agent's saved instructions, session-start prompt, or first message:

```text
At the start of FeatureKit sessions and after context compaction, use `using-featurekit` before acting.
```

This tells the agent to route the work through FeatureKit before it starts changing files.

## 3. Set Up The Repo Once

In a coding-agent session inside the product repo, run:

```text
/setup-featurekit
```

The agent should inspect the repo, ask for missing workflow decisions, and write `docs/agents/` files for stack, verification, security, deployment, work tracking, domain context, and workflow locations.

Do not skip this for a real product repo. Setup is how later FeatureKit skills know how the repo works.

## 4. Start A Product Session

For each new product feature or meaningful change, start with:

```text
using-featurekit
```

If you are unsure which skill to use, ask:

```text
/ask-featurekit
```

The agent should tell you the next workflow step instead of guessing.

## 5. Clarify The Product Idea

Give the agent a short product goal and run:

```text
/grill-with-docs
```

Example prompt:

```text
Use /grill-with-docs for this idea: add team invitations so workspace admins can invite coworkers by email.
```

The agent should read existing project context, ask one question at a time, recommend answers when useful, and stop with a reviewable clarified plan.

## 6. Turn The Idea Into A Plan

For small work, the clarified written plan may be enough.

For product work that needs a durable spec, run:

```text
/to-prd
```

For multi-step work, split the approved PRD into implementation slices:

```text
/to-slices
```

Review the PRD or slice list before coding. FeatureKit's core rule is that production code waits for an approved written plan.

## 7. Approve One Slice Explicitly

When you are ready for implementation, approve a specific plan or slice in plain language:

```text
I approve Slice 1. Use /implement to implement only Slice 1.
```

For larger work, prefer one fresh implementation session per slice. This keeps context small and makes the diff easier to review.

## 8. Implement, Verify, And Review

The implementation agent should read the approved plan, follow repo instructions, keep the change scoped, and run the verification commands from `docs/agents/verification.md`.

Before accepting the work, ask for a review:

```text
Use review-change on this diff.
```

For security-sensitive work, also ask:

```text
Use security-review on this change.
```

For weak or generated tests, ask the agent to use `verify-tests`.

## 9. Hand Off Or Continue

When a session is long, context is crowded, or another agent will continue the work, run:

```text
/handoff
```

Then start the next slice from the handoff and the approved plan.

## Fast Path Summary

```text
/setup-featurekit
using-featurekit
/ask-featurekit
/grill-with-docs
/to-prd
/to-slices
I approve Slice 1. Use /implement to implement only Slice 1.
Use review-change on this diff.
/handoff
```

Use `/execute-slices` only when the PRD and ordered slices are already approved and you explicitly want the agent to run the queue sequentially.

## Series Navigation

- Index: [FeatureKit Guide](./README.md)
- Next: [Overview](./00-overview.md)
