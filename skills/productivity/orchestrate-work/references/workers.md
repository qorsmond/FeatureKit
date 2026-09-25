# Worker packets and lifecycle

Load this only when work may be delegated.

## Packet

Give one worker one outcome:

```text
Objective and active skill
Approval artifact, owned scope, exclusions
Repository snapshot and relevant paths/symbols
Governing ADR/security/interface constraints
Acceptance and expected proof
Attempt/time bound and stop conditions
Return status, changed paths/findings, checks, gaps
```

Reference shared artifacts once. When a task capsule exists, generate a worker projection and pass its path instead of copying state. Workers retrieve source locally and receive no parent transcript, whole-repo dump, duplicated source/logs, or unrelated phase procedure. A worker returns `complete`, `blocked`, `uncertain`, or `needs-stronger-reasoning` plus verification status; `complete` covers only its assignment.

## Visible lifecycle

Use one stable label across attempts:

```text
[W1 planned] objective -> backend, capability, requested model/effort; reason
[W1 dispatched] run ID; reported model/effort or not exposed
[W1 checking] worker finished; primary validating
[W1 accepted|rejected|blocked] evidence and remaining gap
```

Surface mismatches, retries, reroutes, cancellation, and validation. A failed dispatch without a run ID may have unknown execution state; resolve possible writers before reassignment.

## Concurrency

Default to one worker. At most two may run when dependencies, file ownership, input snapshots, ports, databases, simulators, and devices do not conflict and the primary has useful parallel work. Serialize overlapping edits and mutable runtime resources. Review only a stable diff.
