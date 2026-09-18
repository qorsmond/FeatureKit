# Orchestration

FeatureKit can route bounded work to the simplest capable mechanism while keeping the primary agent responsible for scope, integration, and completion. Use `orchestrate-work` for the routing decision and `validate-feature` when acceptance criteria need evidence from the real application runtime.

## Start an orchestrated session

1. [Install or update the skills](./01-install.md#update-later), including `orchestrate-work` and `validate-feature`.
2. Run `/setup-featurekit` once in the product repo. It writes the bootstrap, automatic orchestration and live-feedback instructions into the existing `AGENTS.md` or equivalent. For an older installation, ask setup to refresh its FeatureKit instruction block; it preserves established repo choices and shows the focused patch.
3. Start a fresh session and give the agent your normal feature request or approved `/implement` scope. The repo instructions load the workflow. You do not need a repeated orchestration prompt or a model list.

The orchestrator discovers the currently available models/backends and selects a suitable model and effort for each delegated job. It balances capability, risk, known cost and verification overhead, respects repo restrictions, and escalates from evidence. Direct tools and work retained in the primary are valid routing decisions. Actual choices appear in the live feedback.

Choose the primary model in your host as usual. A strong primary can help with difficult architecture or integration; maximum reasoning is not a FeatureKit prerequisite. Worker routing does not automatically switch the main conversation's model. In Codex, unconfigured workers can inherit the parent's settings, so the orchestrator explicitly selects supported worker settings. See [Codex subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).

This uses persistent repo instructions and installed skills, not a background scheduler. The host must load those instructions and expose permitted worker controls; otherwise FeatureKit reports the limitation and continues directly when capable.

### Read-only smoke test

Optionally run this once after setup to see routing in action; it is not a session-start requirement:

```text
Run a read-only orchestration smoke test on one existing feature. Choose an available model and effort yourself and delegate a bounded trace of its implementation and relevant tests to one suitable worker, using the repo's configured navigation tools. Require file references and explicit evidence gaps. While it works, inspect the documented acceptance constraints in the primary. Check the returned references yourself, then explain the behavior and what remains unverified. Do not edit product code, commit, publish or launch a device/build workflow.
```

Confirm that the conversation shows a planned route with an exact requested model/effort, an acknowledged worker ID, host-supported lifecycle states, worker completion followed by primary checking, and acceptance or rejection. Open the host's worker activity to compare IDs and available model metadata. An unavailable route must be reported as unavailable; direct fallback does not prove worker orchestration. Unexposed effective model identity remains unknown. This trial checks delegation and evidence handling, not that the feature passes its runtime acceptance criteria.

For normal work, give your feature request or approved `/implement` or `/execute-slices` scope. The usual planning and approval gates still apply.

## Choose a capability level

Capability levels describe the judgment required, not a provider, price, or job title.

| Level | Typical work |
| --- | --- |
| Routine | File or symbol discovery, factual summaries, mechanical edits, constrained docs/tests, deterministic checks. |
| Standard | A bounded implementation, debugging session, integration, or review with clear requirements and useful checks. |
| Deep | Ambiguous architecture, difficult debugging or integration, high-risk judgment, conflicting evidence, or a failed lower-level attempt. |

Try a direct tool first when it is sufficient. Otherwise start with one useful worker and use at most two independent workers by default when ownership, dependencies, and shared resources are clear. Keep ordered slices sequential. Do not create recursive workers or turn a worker into a new user-facing task.

Runtime selection is the default. An optional `docs/agents/orchestration.md` can record constraints such as allowed providers, subscription-only use, concurrency limits or a deliberate model override. It need not contain a model roster. Shared FeatureKit instructions do not pin models. For provider command mechanics, read [the orchestration backend reference](../../skills/productivity/orchestrate-work/references/backends.md) when that skill is installed.

Use this table only if you intentionally want fixed route preferences; the orchestrator otherwise chooses from current host capabilities. Replace every placeholder with a verified value. Placeholder rows are not usable routes; an absent or incomplete mapping does not disable discovery of permitted native workers. Native harness settings remain authoritative. If no suitable worker is available, continue directly when feasible and record the limitation.

```markdown
# Orchestration Mapping (Optional)

| Capability | Backend/mechanism | Actual model ID or supported alias | Reasoning | Preference | Verified auth/pool | Restrictions |
| --- | --- | --- | --- | --- | --- | --- |
| Routine | `<native worker or authenticated CLI>` | `<verified model ID or alias>` | `<setting or n/a>` | `<first/backup order>` | `<subscription/login and shared pool, verified date>` | `<paths, tools, runtime limits>` |
| Standard | `<native worker or authenticated CLI>` | `<verified model ID or alias>` | `<setting or n/a>` | `<first/backup order>` | `<subscription/login and shared pool, verified date>` | `<paths, tools, runtime limits>` |
| Deep | `<native worker or authenticated CLI>` | `<verified model ID or alias>` | `<setting or n/a>` | `<first/backup order>` | `<subscription/login and shared pool, verified date>` | `<paths, tools, runtime limits>` |
```

## See Where Work Is Running

The primary shows routing updates in the conversation by default. You should not have to inspect tool calls or wait for the final report to find out which workflow, backend and model were selected.

Before dispatch, each job shows its objective, backend/provider, capability, exact requested model/alias and effort, and the reason for that choice. After dispatch it shows the real run ID/link when available and separately identifies runtime-reported model/effort with the source. If the host does not expose those settings, it says so; requesting a model is not proof that it ran. Work retained in the primary session and direct tool execution are identified too.

For example, with values filled from the orchestrator's runtime selection:

```text
[W1 · planned] Inspect the expiry path → Codex native worker · routine · requested <selected available model>, <supported effort>. Reason: bounded factual search.
[W1 · dispatched] Run <host-provided ID> · reported model/effort: not exposed; requested settings only.
[W1 · checking] Worker finished; checking its references against the current code.
[W1 · accepted] References match. Implementation remains with the primary.
```

If work fails or needs escalation, the same job label shows the cause, old and new route/model/effort, and whether the previous worker has stopped. A failed dispatch stays failed; it is not displayed as running. A finished worker stays pending until the primary checks the result. Model mismatches and runtime validation gaps are surfaced immediately.

Updates stay short and cover meaningful progress, waits and transitions rather than every command. The final summary closes the jobs and points to the existing ledger when useful. This is a portable conversation contract; it does not require a dashboard or separate logging service. See the [behavioral trials](../../tests/scenarios.md) for the visible-feedback checks.

## Send a small work packet

Give a worker the approved artifact or read-only purpose, relevant paths, ownership boundaries, constraints, acceptance criteria, verification commands, stop conditions, and return format. Pass only the context it needs; do not pass the transcript. A useful packet ends like this:

```text
Return: complete, blocked, uncertain, or needs-stronger-reasoning; changed paths or findings; commands and results; runtime evidence; limitations; next decision.
```

Workers do not change scope, make user decisions, approve plans, bypass permissions, or claim the whole task complete. The primary inspects the result and diff, integrates it, and decides whether the acceptance criteria are met.

Example packet for the usage-limits slice from the [end-to-end example](./06-end-to-end-example.md):

```text
Objective: implement only Slice 1, “Enforce project limit in the domain/API path.”
Selected skill: implement
Approval/scope: approved docs/prd/workspace-project-usage-limits.md Slice 1; no billing changes, UI, or later slices.
Repository state: current checkout and revision; preserve relevant uncommitted changes.
Context: read the PRD, docs/agents/security.md, docs/agents/verification.md, and the existing project-creation path.
Ownership: edit only files needed for the domain/API limit and its focused tests; do not commit, push, or open a PR.
Constraints: preserve tenant authorization and accepted ADRs; use the repository's existing test and verification commands.
Acceptance and proof: reject creation at the configured project limit, allow creation below it, preserve tenant isolation, and report command results plus runtime evidence.
Stop when: scope is unclear, an ADR conflicts, required access is missing, or one focused retry cannot resolve a failure.
Return: status, changed paths, checks and results, runtime evidence, limitations, and the next decision.
```

## Retry from evidence

On failure, identify whether the cause was ambiguity, missing access, infrastructure, or insufficient reasoning. Correct one concrete briefing or implementation issue for one focused retry. Escalate reasoning only when the evidence supports it; do not repeat an unchanged attempt or invent an API-funded fallback. A stronger model cannot supply a missing device, permission, or runtime.

## Record runtime evidence

For each relevant acceptance criterion, record the code or revision, command or procedure, runtime/platform and device or simulator where relevant, result (`passed`, `failed`, `blocked`, or `not run`), evidence location, and limitations. A build proves that the build succeeded; it does not prove browser, backend protocol, native mobile, hardware, or permission behavior unless that behavior was exercised.

Example:

```text
Criterion: camera capture returns a saved image
Revision: abc123
Runtime: iOS device; simulator camera unavailable
Result: blocked
Evidence: npm test passed; device capture not run
Limitation: physical camera permission and capture path remain unverified
```

## Keep a compact ledger

Record one row for each substantive routing decision or retained deep decision. Reuse the active slice or handoff ledger; no new log file is needed for a trivial direct edit.

```text
Task: inspect invitation expiry path
Capability: routine
Route: direct search (worker skipped)
Requested/effective model: n/a
Status: complete; attempts: 1
Evidence: rg result and targeted test
Primary disposition: accepted
```

Keep unknown model, token, cost, and runtime values unknown. Account-level usage is not per-worker usage. The ledger should make gaps and the next decision visible without becoming a quota system or dashboard.

Use the same job label, run IDs and model-metadata sources in the ledger and the visible updates so a human can trace a reroute or compare it with the host's activity view.

Failure and escalation example:

```text
Task: usage-limits Slice 1 implementation
Capability: standard
Route: authenticated CLI worker; native worker unavailable in this environment
Requested model: <verified alias>; effective model: unknown; cost: unknown
Status: needs-stronger-reasoning; attempts: 1 focused retry after correcting the tenant-boundary context
Evidence: worker test failed on cross-tenant creation; retry output still lacks the required runtime proof
Primary disposition: stop worker, retain changes for inspection, run the relevant security review in the primary session, and report validation as blocked
```

Native workers and ordinary authenticated CLI workers are ways to perform bounded work. Fresh task creation is a user-facing handoff: preserve the existing approval and explicit destination choice, use the same checkout and branch, and send the compact packet without the transcript.

## Series navigation

- Previous: [End-to-End Example](./06-end-to-end-example.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Security Workflow](./08-security.md)
