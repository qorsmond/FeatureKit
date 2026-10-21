# Main Flow

This is the default route from raw idea to shipped change.

## 1. Bootstrap The Session

At the start of FeatureKit sessions, put this in saved instructions, pinned instructions, or a session-start hook when your harness supports it:

```text
Use `using-featurekit` before acting.
```

`using-featurekit` is a lightweight model-invoked router. It checks whether the repo is configured, points the agent at the right workflow, and hard-stops when production code is requested without an approved written plan, unless the repo's small-fix exemption covers the request. You should not need to manually run it and then repeat the same idea into a workflow skill.

For raw features, the interview checks its question UI before inspecting the repository. If the native question tool exists but the current mode or permissions disable it, the agent should show a provisional ledger, explain the exact setting to change, and pause before spending context on repo discovery. After the tool is enabled—or after you explicitly accept numbered plain text—the agent discovers facts and refines the ledger.

## 2. Ask For The Right Flow

When unsure, start here:

```text
/ask-featurekit
```

For a raw feature, `ask-featurekit` begins the interview immediately. For other work it routes you to the right skill and tells you whether to stay in the same session or start fresh.

## 3. Clarify The Idea

For a product idea or feature:

```text
/grill-with-docs
```

The agent should:

- read project context first,
- choose and state the planning depth from the next artifact and the feature's risk,
- map decisions as a dependency tree and discover repo facts instead of asking for them,
- use direct tools or bounded workers for independent facts or coverage checks when useful, without delaying unrelated questions,
- ask ready decisions in short rounds through the harness's question UI,
- put one or two short context sentences inside every question so it is understandable without earlier commentary,
- use the user's words and concrete outcomes, ask one decision, and recommend an answer with a short reason,
- explain what each option causes and call out material scope, security, migration, cost, reversibility, or rollout consequences,
- keep a short ledger of settled, removed, blocked, and ready decisions,
- update domain terms or ADRs only after confirming,
- stop only after a final coverage check, show the complete plan, and ask the clear final approval question.

Answering an interview question or accepting the agent's recommended answer is not approval. Only the final approval question approves the clarified plan. Generated PRDs and slices are richer staged artifacts and need their own final approval.

If an answer says the user is unsure, does not understand, or asks a question instead of choosing, the decision stays open. The agent explains it with a concrete example and re-asks only that decision without discarding other answers from the round.

Use the harness's structured question tool when it is available. If it is disabled, the agent should explain how to enable it and pause before repo inspection or secondary task skills. Plain text is used only when no native tool exists or you explicitly accept the fallback, and it contains at most three questions per round.

## 4. Prototype Only If Needed

If a question cannot be answered through discussion, use:

```text
/prototype
```

Prototype when you need a runnable answer about UX, state, architecture, performance, integration behavior, or feasibility.

Prototype code is disposable. It goes in the prototype location setup recorded (`.scratch/prototypes/<slug>/` by default) and is not committed. Use `/handoff` to carry the learning back to the main thread.

## 5. Record Architectural Decisions

When grilling, design work, or a prototype settles a durable technical choice, use:

```text
/record-adr
```

Record decisions that future work must obey: boundaries, data ownership, integration contracts, public APIs, auth/security posture, deployment/runtime constraints, or cross-cutting architecture patterns.

The ADR follows the repo's recorded directory, filename pattern, template and statuses, defaulting to dated files in `docs/adr/`. It is added to the directory's index if there is one.

Do not use ADRs as a scratchpad. Product decisions belong in the PRD; unresolved technical uncertainty belongs in grilling or a prototype.

Security is part of the default workflow. For work touching auth, authorization, sensitive data, APIs, deployment, integrations, generated code, or untrusted input, the agent should use `secure-design` to capture threats, abuse cases, security requirements, verification, and ADR follow-ups before implementation.

For the full security flow, see [Security Workflow](./08-security.md).

## 6. Write The PRD

For work that needs a durable spec:

```text
/to-prd
```

The PRD captures:

- goal,
- users,
- scope,
- out of scope,
- requirements,
- product decisions,
- technical approach,
- security and abuse cases,
- risks,
- acceptance criteria,
- test and verification plan.

The PRD should reference accepted ADRs that constrain the feature and call out any missing ADRs.

Small work can skip a full PRD if the written plan is enough, but the agent still needs to show that plan and wait for approval before coding. Only a repo that opted in at setup lets a small fix you ask for directly skip the plan, and only within the limits its `Exemption:` line records; the fix's checks still run.

## 7. Split Into Slices

For multi-step work:

```text
/to-slices
```

Slices should be vertical. Each one should produce independently reviewable value and fit in a small PR.

Avoid horizontal slices like "add all types" or "build all UI". They hide integration risk until too late.

Review and approve the PRD or slice list before using `/implement` or `/execute-slices`.

After an implementation-ready artifact is approved, focused implementation that was already requested continues in the current task without a destination question. Only substantial work asks whether to create a fresh implementation task on the current checkout and branch, continue in the current task, or stop after planning. Product-depth work that still needs a PRD or slices does not offer implementation yet.

## 8. Implement One Slice

After the written plan or slice is approved, continue a focused implementation in the current task:

```text
/implement
```

Give the agent:

- the approved PRD or plan,
- the approved single slice,
- relevant project context,
- the verification commands.

The agent should implement only that slice, use TDD for logic and bug fixes, run the repo's checks, and report any divergence from the plan.

The agent should also read relevant accepted ADRs. If the slice conflicts with an accepted ADR, stop and resolve the PRD, slice, or ADR before changing production code.

When a slice touches security-sensitive areas, the agent should use `secure-code`, `secure-api`, or `secure-deploy` before coding and preserve the PRD or slice security requirements.

Before coding, refactoring, or verification, the agent should apply the repo's Agent Operating Principles: state assumptions, name confusion, keep the change minimal, and avoid unrelated edits.

`tdd` is model-invoked, so the implementation skill can use it automatically when the slice contains testable behavior.

`verify-tests` is model-invoked for deeper test checks. Use it when a generated or changed test might not protect the intended behavior, or when you explicitly want mutation testing such as Stryker. Mutation testing is gated because it can be slow.

## 9. Execute Approved Slices

When a PRD and ordered slices are approved and you explicitly want autonomous batch execution:

```text
/execute-slices
```

The agent should execute slices sequentially, route bounded work when useful, validate each slice against its acceptance criteria, and stop for blockers, ADR conflicts, unresolved P0/P1 security findings, failing checks, or unclear scope. Review remains risk-based rather than mandatory after every slice. It should not create branches, commit, push, or open PRs.

Use `/implement` instead when you want one focused slice.

## 10. Review

Before human review, ask the agent to use `review-change`.

The review checks:

- spec match,
- scope drift,
- missing tests,
- weak tests that may pass for the wrong reason,
- risky architecture,
- exploitable security risk,
- poor typing,
- weak error handling,
- unsafe migrations,
- unclear product behavior,
- conflicts with accepted ADRs,
- verification gaps.

For high-risk behavior or suspicious generated tests, ask for `verify-tests` before accepting the test coverage.

For focused OWASP, API, deployment, generated-code, or hardening review, ask for `security-review`.

## 11. Handoff

Use this when a session is long, context is crowded, or work needs to move:

```text
/handoff
```

The handoff is compact, self-contained implementation context, not a transcript. For substantial work, when the user selects a fresh implementation task and the harness supports task creation on the existing checkout, FeatureKit creates it in the same saved project and active branch without a worktree. It receives the approved artifact, scope, decisions, constraints, repository state, verification commands, and exact implementation skill. If suitable creation is unavailable, FeatureKit provides one exact prompt and a handoff note when useful. The note goes in the handoff location setup recorded, such as a per-feature file updated in place (`docs/handoff/<slug>.md` by default).

## Session Rules

Keep grilling, PRD, slice planning, and focused implementation in one continuous task when practical. Consider a fresh task only for substantial implementation or when the current task no longer has enough usable context. Use `/execute-slices` when the approved slice queue should run sequentially in one autonomous task.

Each fresh implementation, bug, refactor, review, or verification session should begin from the Agent Operating Principles in the repo instructions.

## Series Navigation

- Previous: [Setup](./02-setup.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Working With Agents](./04-working-with-agents.md)
