---
name: orchestrate-work
description: Choose direct work, the current agent, or one bounded worker by capability, risk, and evidence. Use inside an active FeatureKit workflow when substantive work could be routed or has failed.
metadata:
  featurekit-version: "0.12.0"
---

# Orchestrate Work

Apply the workflow invariants in `using-featurekit`. The primary owns requirements, user decisions, architecture, integration, evidence, escalation, and completion. An assigned worker executes its packet without routing again.

## Route

1. Obey the active workflow and approval boundary.
2. Use a deterministic tool when it can complete the step. Do not spawn a worker for one command.
3. Read repo constraints from `docs/agents/orchestration.md` when present. Never inspect secrets.
4. Pick the lowest capability that fits, then the lowest adequate effort:

| Capability | Suitable work |
| --- | --- |
| Routine | Exact lookup, mechanical edit, narrow tests/docs, or a bounded change with an exact spec, an existing check, and an existing pattern to follow |
| Standard | Normal implementation, debugging a known failure, integration, review |
| Deep | Architecture, ambiguity, unknown root cause, high consequence, conflicting evidence, a failed lower attempt |

Security, authorization, privacy, destructive, irreversible, or migration risk means Deep with the security floor. Explicit user/repo pins, provider restrictions, approval, and required proof win. Missing or uncertain facts never justify a lower level. The host supplies the model: its cheapest tier for Routine, middle for Standard, strongest for Deep.

## Execution Shape

Work directly by default. Measured delegation of small and medium tasks from a frontier session to a cheaper in-session worker did not lower total cost and was slower; savings came only when the whole task ran on the routed model.

- If this session already runs at or above the routed level, do the work here.
- For an approved batch, run each Routine or Standard slice as one fresh session on the routed model ([workers.md](references/workers.md)); keep verification here.
- Use an in-session worker only for isolation, such as an independent review, or for genuinely parallel independent work: at most two, with separate files and runtime resources.

Before dispatch, show the job, objective, backend, capability, requested model/effort, and reason. Afterwards show the host-reported settings or say they are not exposed. Keep `worker finished; validation pending` distinct from acceptance. Do not invent usage, cost, progress, or model identity.

## Accept Or Recover

Inspect the scoped result against the packet and current tree, then apply `validate-feature`. Reuse evidence only while its code, configuration, environment, and dependencies are unchanged.

On failure, follow [workers.md](references/workers.md#recover): one corrected retry for a concrete mistake, one escalation with a failure packet for insufficient reasoning, another authorized route for environment or access failure, the user for a material decision. A check blocked by the environment is a gap, not a failed attempt. Never repeat an unchanged failure.

Record each attempt's route, outcome, and evidence in the slice's `Evidence` line or the report. Unknown values stay unknown.
