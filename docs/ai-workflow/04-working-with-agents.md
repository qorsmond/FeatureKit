# Working With Agents

FeatureKit works best when you treat the agent like a fast engineer that needs clear context, small tasks, and hard feedback loops.

## Session Bootstrap

At the start of FeatureKit sessions, give the agent this bootstrap instruction:

```text
Use `using-featurekit` before acting.
```

If your harness supports session-start hooks, pinned instructions, or saved custom instructions, put that sentence there. FeatureKit does not ship hook scripts in v1; the bootstrap is the portable skill and instruction. A raw feature request begins interviewing automatically. Invoke `/grill-with-docs` when you want the same interview explicitly, or use `/ask-featurekit` when you are unsure which workflow fits.

## Good Prompts

Give the agent:

- the goal,
- the selected skill,
- the approved PRD or slice for implementation work,
- relevant accepted ADRs,
- relevant `docs/agents/security.md` context for security-sensitive work,
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

Also avoid treating one interview answer as approval. The agent must finish the design tree, show the complete plan, and ask the final approval question. A later PRD or slice has its own final approval.

Do not accept questions that make you translate internal code language. Each question should carry its own short context, ask one concrete decision in your words, and explain what the choices change. If you answer that you are unsure or ask for clarification, FeatureKit should explain and re-ask instead of treating that response as a choice.

## Context Hygiene

Use one planning thread for:

- grilling,
- domain terms,
- PRD,
- slices.

Consider fresh implementation tasks when the work is substantial or the current task is context-constrained, for example:

- an approved multi-slice batch,
- a broad cross-system change,
- a large refactor with several verification phases,
- implementation after a long planning task has consumed most of the useful context.

Use `/execute-slices` only when the PRD and ordered slices are approved and you want the agent to run the slice queue autonomously with verification and review checkpoints.

Use `/handoff` when moving between tasks. Keep a fresh task on the same saved project checkout and active branch; do not create a worktree just to reset conversation context.

After an implementation-ready artifact is approved, focused work should continue in the current task without another question. For substantial work, FeatureKit should offer a fresh implementation task separately from plan approval. The fresh task receives the approved artifact and compact implementation context, not the planning transcript, and runs from the existing checkout and branch.

## Token-Efficient Execution

Implementation should discover context progressively instead of loading the repository up front:

- start from the approved artifact and stable repo instructions,
- locate relevant files and symbols before reading bodies,
- prefer Serena or an equivalent semantic code tool for symbol overviews, definitions, and references when available,
- prefer RTK or equivalent compact wrappers for noisy shell, diff, build, lint, and test output when available,
- use scoped searches, targeted reads, quiet flags, and failure-only output as portable fallbacks,
- expand only the failing target when compact output omits a needed diagnostic,
- run narrow verification per slice and broader repo verification once after the queue is stable,
- avoid subagents for routine slices; use them only when isolation or independent high-risk review justifies their additional context.

[Serena](https://github.com/oraios/serena) and [RTK](https://github.com/rtk-ai/rtk) are optional. FeatureKit uses them when the harness exposes them and continues with portable fallbacks when it does not. Their absence should not block a slice or trigger an installation without user approval.

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
- confirm security-sensitive behavior follows `docs/agents/security.md`,
- confirm new or changed tests would fail if the intended behavior were wrong,
- remove out-of-scope edits,
- run the verification commands,
- ask `review-change` to review the diff.

Use `verify-tests` when test quality is uncertain, behavior is high-risk, or you explicitly want mutation testing such as Stryker. Do not make mutation testing part of every normal review.

Use `security-review` for focused review of auth, authorization, tenant isolation, sensitive data, API, deployment, secrets, generated-code, or other exploitable risk.

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
- implementation without an approved plan,
- adding dependencies without confirmation.

## Stack Rules Belong In The Product Repo

FeatureKit should not assume React, Angular, Rails, Laravel, Postgres, Prisma, Supabase, Vercel, AWS, or any other stack.

Put those rules in the target repo:

- `AGENTS.md` for stable conventions,
- `CONTEXT.md` for domain language,
- ADRs for durable technical decisions,
- `docs/agents/security.md` for security posture, auth, sensitive data, secrets, CI/CD, and incident-response context,
- other `docs/agents/*.md` files for FeatureKit setup.

## Series Navigation

- Previous: [Main Flow](./03-main-flow.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Local LLMs](./05-local-llms.md)
