# Main Flow

This is the default route from raw idea to shipped change.

## 1. Bootstrap The Session

At the start of a FeatureKit session, use:

```text
using-featurekit
```

This is a lightweight router. It checks whether the repo is configured, points the agent at the right workflow, and hard-stops only when production code is requested without a written plan.

## 2. Ask For The Right Flow

When unsure, start here:

```text
/ask-featurekit
```

`ask-featurekit` routes you to the right skill and tells you whether to stay in the same session or start fresh.

## 3. Clarify The Idea

For a product idea or feature:

```text
/grill-with-docs
```

The agent should:

- read project context first,
- ask one question at a time,
- recommend an answer with a short reason,
- update domain terms or ADRs only after confirming,
- stop when the goal, scope, constraints, and success criteria are clear.

## 4. Prototype Only If Needed

If a question cannot be answered through discussion, use:

```text
/prototype
```

Prototype when you need a runnable answer about UX, state, architecture, performance, integration behavior, or feasibility.

Prototype code is disposable. Use `/handoff` to carry the learning back to the main thread.

## 5. Record Architectural Decisions

When grilling, design work, or a prototype settles a durable technical choice, use:

```text
/record-adr
```

Record decisions that future work must obey: boundaries, data ownership, integration contracts, public APIs, auth/security posture, deployment/runtime constraints, or cross-cutting architecture patterns.

Do not use ADRs as a scratchpad. Product decisions belong in the PRD; unresolved technical uncertainty belongs in grilling or a prototype.

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
- risks,
- acceptance criteria,
- test and verification plan.

The PRD should reference accepted ADRs that constrain the feature and call out any missing ADRs.

Small work can skip a full PRD if the written plan is enough.

## 7. Split Into Slices

For multi-step work:

```text
/to-slices
```

Slices should be vertical. Each one should produce independently reviewable value and fit in a small PR.

Avoid horizontal slices like "add all types" or "build all UI". They hide integration risk until too late.

## 8. Implement One Slice

Start a fresh session per implementation slice when possible:

```text
/implement
```

Give the agent:

- the PRD,
- the single slice,
- relevant project context,
- the verification commands.

The agent should implement only that slice, use TDD for logic and bug fixes, run the repo's checks, and report any divergence from the plan.

The agent should also read relevant accepted ADRs. If the slice conflicts with an accepted ADR, stop and resolve the PRD, slice, or ADR before changing production code.

Before coding, refactoring, or verification, the agent should apply the repo's Agent Operating Principles: state assumptions, name confusion, keep the change minimal, and avoid unrelated edits.

`tdd` is model-invoked, so the implementation skill can use it automatically when the slice contains testable behavior.

`verify-tests` is model-invoked for deeper test checks. Use it when a generated or changed test might not protect the intended behavior, or when you explicitly want mutation testing such as Stryker. Mutation testing is gated because it can be slow.

## 9. Execute Approved Slices

When a PRD and ordered slices are approved and you want autonomous batch execution:

```text
/execute-slices
```

The agent should execute slices sequentially, use subagents when available, review after each slice, run verification, and stop for blockers, ADR conflicts, failing checks, or unclear scope. It should not create branches, commit, push, or open PRs.

Use `/implement` instead when you want one focused slice in a fresh session.

## 10. Review

Before human review, ask the agent to use `review-change`.

The review checks:

- spec match,
- scope drift,
- missing tests,
- weak tests that may pass for the wrong reason,
- risky architecture,
- poor typing,
- weak error handling,
- unsafe migrations,
- unclear product behavior,
- conflicts with accepted ADRs,
- verification gaps.

For high-risk behavior or suspicious generated tests, ask for `verify-tests` before accepting the test coverage.

## 11. Handoff

Use this when a session is long, context is crowded, or work needs to move:

```text
/handoff
```

The handoff is a compact state file, not a transcript.

## Session Rules

Keep grilling, PRD, and slice planning in one continuous planning thread when possible. Start fresh for each implementation slice when using `/implement`, or use `/execute-slices` when the approved slice queue should run sequentially in one autonomous session.

Each fresh implementation, bug, refactor, review, or verification session should begin from the Agent Operating Principles in the repo instructions.

## Series Navigation

- Previous: [Setup](./02-setup.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Working With Agents](./04-working-with-agents.md)
