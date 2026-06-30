# Working With Agents

FeatureKit works best when you treat the agent like a fast engineer that needs clear context, small tasks, and hard feedback loops.

## Session Bootstrap

At the start of a FeatureKit session, tell the agent:

```text
Use `using-featurekit` before acting.
```

If your harness supports session-start hooks, pinned instructions, or saved custom instructions, put that sentence there. FeatureKit does not ship hook scripts in v1; the bootstrap is the portable skill and instruction.

## Good Prompts

Give the agent:

- the goal,
- the selected skill,
- the relevant PRD or slice,
- relevant accepted ADRs,
- any constraints,
- what is out of scope,
- the verification command.

Example:

```text
/implement

Use docs/prd/usage-limits.md and slice 2 only.
Do not implement billing changes.
Run the repo's verification commands from docs/agents/verification.md.
```

## Bad Prompts

Avoid prompts like:

```text
Build the whole dashboard.
```

or:

```text
Make it better.
```

Those prompts force the agent to invent scope.

## Context Hygiene

Use one planning thread for:

- grilling,
- domain terms,
- PRD,
- slices.

Use fresh implementation sessions for:

- one slice,
- one bug,
- one refactor,
- one review.

Use `/execute-slices` only when the PRD and ordered slices are approved and you want the agent to run the slice queue autonomously with verification and review checkpoints.

Use `/handoff` when moving between sessions.

## Agent Operating Principles

For coding, refactoring, review, and verification sessions, require the agent to:

- think before coding by stating assumptions, naming confusion, presenting plausible interpretations, and surfacing tradeoffs,
- keep simplicity first by writing the minimum code that solves the request and avoiding unrequested flexibility or impossible-case handling,
- make surgical changes by touching only required files and lines, matching existing style, and leaving unrelated cleanup as a note.

## Review Every Diff

Never accept generated changes blindly.

Before opening a PR:

- read every changed file,
- understand why each change exists,
- confirm the diff matches the PRD or slice,
- confirm the diff follows accepted ADRs,
- confirm new or changed tests would fail if the intended behavior were wrong,
- remove out-of-scope edits,
- run the verification commands,
- ask `review-change` to review the diff.

Use `verify-tests` when test quality is uncertain, behavior is high-risk, or you explicitly want mutation testing such as Stryker. Do not make mutation testing part of every normal review.

## ADR Discipline

Use `/record-adr` when a durable technical decision is made or changed. Other skills should read ADRs, follow accepted ADRs, and flag conflicts, but ADR writes should go through `/record-adr`.

## Keep Work Small

The agent performs better when the task is narrow.

Prefer:

- one user-visible behavior,
- one data model change,
- one integration point,
- one regression fix.

Avoid:

- "while you are here" refactors,
- mixed product and cleanup PRs,
- implementation without a plan,
- adding dependencies without confirmation.

## Stack Rules Belong In The Product Repo

FeatureKit should not assume React, Angular, Rails, Laravel, Postgres, Prisma, Supabase, Vercel, AWS, or any other stack.

Put those rules in the target repo:

- `AGENTS.md` for stable conventions,
- `CONTEXT.md` for domain language,
- ADRs for durable technical decisions,
- `docs/agents/*.md` for FeatureKit setup.

## Series Navigation

- Previous: [Main Flow](./03-main-flow.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Local LLMs](./05-local-llms.md)
