---
name: orchestrate-work
description: Route substantive work to direct tools, the current agent, or one bounded worker using capability, effort, risk, and evidence. Use inside an active FeatureKit workflow.
metadata:
  featurekit-version: "0.10.2"
---

# Orchestrate Work

Apply the [workflow invariants](references/invariants.md). The primary owns requirements, user decisions, architecture, integration, evidence, escalation, and completion. An assigned worker executes its packet without routing again.

## Route

1. Obey the active workflow and approval boundary.
2. Use a deterministic tool when it can complete the step. Do not spawn a worker for one command.
3. Read repo constraints from `docs/agents/orchestration.md` when present. Discover current host models, efforts, tools, and authenticated backends once per session; refresh after a route/configuration failure. Never inspect secrets.
4. Choose capability and effort independently, using the least expensive available route that is adequate:

| Capability | Suitable work |
| --- | --- |
| Routine | Exact lookup, mechanical edit, narrow tests/docs |
| Standard | Normal implementation, debugging, integration, review |
| Deep | Architecture, ambiguity, high consequence, conflicting evidence, failed lower attempt |

Pass an actual supported model/alias and effort when the backend allows it. Explicit user/repo pins, provider restrictions, approval, security floors, and required proof win. Missing or uncertain metadata never justifies a downgrade. If no worker is suitable, continue here when capable or report the judgment/proof gap.

Reuse exact fact receipts before discovery. Use hook advice; never call JEV twice. Otherwise use connected `route` or [optimizer.md](references/optimizer.md) once. Only an `enforced` result changes execution; failure keeps the baseline.

Load only the routed reference in `references/`; API-funded fallback requires explicit authorization.

## Worker Boundary

Delegate for an `enforced` route, or when briefing, checking, and recovery cost less than direct work, or isolation materially helps. Use [workers.md](references/workers.md) for packets, visible status, concurrency, and return contracts. Default to one worker; use at most two only for independent ownership and resources.

Before dispatch, show job label, bounded objective, backend, capability, requested model/effort, and reason. After dispatch, show the actual run ID and runtime-reported settings, or say they are not exposed. Keep `worker finished; validation pending` distinct from primary acceptance. Do not invent usage, cost, progress, execution state, or model identity.

## Accept Or Recover

Inspect the scoped result against the packet and current tree. Reuse evidence only while its code, configuration, environment, and dependencies remain valid. Apply `validate-feature`; use test/security/review skills when their gates apply.

For failure, follow [recovery.md](references/recovery.md): one corrected retry for a concrete mistake, stronger reasoning for unresolved uncertainty, another authorized route for environment/auth failure, or the user for a material decision. Never repeat an unchanged failure or let an old writer continue during reassignment.

Keep a compact ledger (`attempt` records under `enforce`): job, route requested/reported, attempt status, evidence, gaps, disposition. Unknown values stay unknown.
