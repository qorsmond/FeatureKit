# Frontend AI Workflow

How our frontend team uses AI coding agents in a disciplined way — taking a story from planning to a merged PR without losing control of quality.

This is **our process**, maintained in this repo and improved through our retros. It works the same whether you use Claude Code, Codex, OpenCode, or just a chat window.

## The core principle

**No code starts until there is a written, reviewed plan.**

The agent is fast and tireless, but it will confidently build the wrong thing if the goal is fuzzy. So we always plan first, in writing, and a human signs off before implementation begins. Everything else in this workflow exists to support that one rule.

## Why we work this way

- **Better planning.** Ambiguity gets resolved before code exists, when it's cheap to fix.
- **Smaller PRs.** Work is sliced into independently reviewable pieces, so reviews are fast and focused.
- **Fewer wrong turns.** A reviewed plan catches a bad approach in minutes instead of after a day of generated code.
- **Better review quality.** Reviewers check the diff against an agreed spec, not against a guess at intent.
- **Safer AI use.** Guardrails (lint, typecheck, tests, build, pre-commit hooks, branch protection) and human review mean nothing lands unchecked. You own every line in your PR.

## The flow at a glance

1. Understand the story.
2. Have the agent **interrogate** the plan with you.
3. Write the plan.
4. Get more eyes on the plan where the work type requires it.
5. Slice the work into vertical slices.
6. Implement one slice at a time.
7. Test and verify (lint, typecheck, tests, build).
8. Review against the spec and our frontend standards.

## Where to start

- **Just want the steps?** → [`01-quick-start.md`](./01-quick-start.md) (pin this in Teams)
- **How much process does this change need?** → [`02-work-types.md`](./02-work-types.md)
- **Planning a story** → [`03-planning-a-story.md`](./03-planning-a-story.md)
- **Splitting a big story** → [`04-splitting-work.md`](./04-splitting-work.md)
- **Implementing** → [`05-implementation.md`](./05-implementation.md)
- **Review & verification** → [`06-review-and-verification.md`](./06-review-and-verification.md)
- **Tool setup** → [`07-tool-setup.md`](./07-tool-setup.md)
- **A worked example** → [`08-examples.md`](./08-examples.md)
- **Rollout plan** → [`09-rollout-plan.md`](./09-rollout-plan.md)

## About the skills

Throughout these docs you'll see names like `plan-story`, `split-story`, and `implement-slice`. These are our own **skills**: intentionally small saved sets of instructions the agent can easily follow, so we all work the same way instead of everyone prompting from scratch. They ship in **BridgeKit**, a dedicated Angular library we set up for this (CUI stays our component library). Every project gets them on install under [`.agents/skills/`](../../.agents/skills/), so there's nothing to clone or install by hand.

How to actually run one in Claude Code, Codex, OpenCode, or a plain chat is covered in [`07-tool-setup.md`](./07-tool-setup.md). The short version: once BridgeKit is installed the agent finds the skills by name, and you can nudge it (for example, "plan this story with plan-story"). In a plain chat with no skill support, you open the skill file and paste it in.
