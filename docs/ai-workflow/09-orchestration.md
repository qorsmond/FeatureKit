# Orchestration

FeatureKit routes bounded work to the simplest capable mechanism while keeping the primary agent responsible for scope, integration, and completion. Use `orchestrate-work` for the routing decision and `validate-feature` when acceptance criteria need evidence from the real application runtime.

## Start an orchestrated session

1. [Install or update the skills](./01-install.md#update-later), including `orchestrate-work` and `validate-feature`.
2. Run `/setup-featurekit` once in the product repo. It writes the bootstrap and orchestration instructions into the existing `AGENTS.md` or equivalent. For an older installation, ask setup to refresh its FeatureKit instruction block; it preserves established repo choices and shows the focused patch.
3. Start a fresh session and give the agent your normal feature request or approved `/implement` scope. You do not need a repeated orchestration prompt or a model list.

Choose the primary model in your host as usual. Worker routing does not switch the main conversation's model. If the host cannot expose permitted worker controls, FeatureKit reports the limitation and continues directly.

## Choose a capability level

Capability levels describe the judgment required, not a provider or price. The agent picks the lowest level that fits; the host picks its cheapest, middle, or strongest model for it.

| Level | Typical work |
| --- | --- |
| Routine | Lookups, mechanical edits, constrained docs/tests, and bounded changes with an exact spec, an existing check, and an existing pattern to follow. |
| Standard | Normal implementation, debugging a known failure, integration, or review. |
| Deep | Architecture, ambiguity, unknown root cause, high consequence, conflicting evidence, or a failed lower-level attempt. |

Security, authorization, privacy, destructive, irreversible, and migration work always gets Deep with the security floor. Missing facts never justify a lower level, and explicit user or repo pins win.

## Work directly by default

Measured trials showed that a frontier session delegating a small or medium task to a cheaper in-session worker did not lower total cost and took longer. Savings came only when the whole task ran on the cheaper model. So:

- When the current session is at or above the needed level, the agent does the work itself.
- For an approved batch, `execute-slices` can run each Routine or Standard slice as one fresh session on the matching model, keeping verification in the primary.
- In-session workers are for isolation (an independent review) or genuinely parallel, independent work: at most two at once, with separate files and runtime resources.

An optional `docs/agents/orchestration.md` in the product repo records constraints such as allowed providers, subscription-only use, concurrency limits, or a deliberate model pin. It needs no model roster.

## See where work is running

Before dispatch, each job shows its objective, backend, capability, requested model and effort, and the reason. After dispatch it shows the run ID and the model and effort the host reported, or says they are not exposed; requesting a model is not proof that it ran.

```text
[W1 · planned] Review the delete change → native worker · standard · requested <model>, <effort>. Reason: independent review.
[W1 · dispatched] Run <host ID> · reported model/effort: not exposed.
[W1 · checking] Worker finished; checking its findings against the diff.
[W1 · accepted] Two findings confirmed; one rejected with evidence.
```

A finished worker stays pending until the primary checks the result. Unknown model, token, and cost values stay unknown.

## Send a small work packet

Give a worker the approved artifact, relevant paths, ownership, constraints, acceptance criteria, verification commands, stop conditions, and return format. Do not pass the transcript. Workers do not change scope, make user decisions, approve plans, or claim the whole task complete.

```text
Objective: implement only Slice 1, "Enforce project limit in the domain/API path."
Approval/scope: approved docs/prd/workspace-project-usage-limits.md Slice 1; no billing changes, UI, or later slices.
Context: the PRD, docs/agents/security.md, docs/agents/verification.md, and the slice's Notes.
Ownership: only the domain/API limit and its focused tests; no commit, push, or PR.
Acceptance and proof: reject creation at the limit, allow it below, preserve tenant isolation; report command results.
Stop when: scope is unclear, an ADR conflicts, access is missing, or one focused retry fails.
Return: status, changed paths, checks and results, runtime evidence, limitations, next decision.
```

## Retry from evidence

Identify the cause first: a concrete mistake gets one corrected retry; insufficient reasoning gets one escalation to a stronger level; missing access, permission, runtime, or device needs another authorized route or the user. A check blocked by the environment is a gap, not a failed attempt.

Escalate with a failure packet instead of a cold restart: the route tried, a one-line failure summary, the changed paths, the evidence location, and an instruction to continue from the failed tree. In paired trials this cut the stronger attempt to one file read instead of five and its cost by 29%.

## Record progress and evidence

Progress lives in the plan file. At each slice boundary the agent updates the slice's `Status`, `Evidence` (the commands and results on the final tree), and `Notes` (paths, symbols, gotchas, and decisions a later session would otherwise rediscover). A new session resumes from the first slice that is not done instead of repeating the investigation. For each acceptance criterion, `validate-feature` records the revision, command or procedure, runtime or device, result (`passed`, `failed`, `blocked`, or `not run`), and limitations.

## Series navigation

- Previous: [End-to-End Example](./06-end-to-end-example.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Security Workflow](./08-security.md)
