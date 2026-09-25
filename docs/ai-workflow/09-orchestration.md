# Orchestration

FeatureKit can route bounded work to the simplest capable mechanism while keeping the primary agent responsible for scope, integration, and completion. Use `orchestrate-work` for the routing decision and `validate-feature` when acceptance criteria need evidence from the real application runtime.

## Start an orchestrated session

1. [Install or update the skills](./01-install.md#update-later), including `orchestrate-work` and `validate-feature`.
2. Run `/setup-featurekit` once in the product repo. It writes the bootstrap, automatic orchestration and live-feedback instructions into the existing `AGENTS.md` or equivalent. For an older installation, ask setup to refresh its FeatureKit instruction block; it preserves established repo choices and shows the focused patch.
3. Start a fresh session and give the agent your normal feature request or approved `/implement` scope. The repo instructions load the workflow. You do not need a repeated orchestration prompt or a model list.

The orchestrator discovers the currently available models/backends and selects a suitable model and effort for each delegated job. It balances capability, risk, known cost and verification overhead, respects repo restrictions, and escalates from evidence. Direct tools and work retained in the primary are valid routing decisions. Actual choices appear in the live feedback.

Choose the primary model in your host as usual. A strong primary can help with difficult architecture or integration; maximum reasoning is not a FeatureKit prerequisite. Worker routing does not automatically switch the main conversation's model. In Codex, unconfigured workers can inherit the parent's settings, so the orchestrator explicitly selects supported worker settings. See [Codex subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).

This uses persistent repo instructions and installed skills, not a background scheduler. The host must load those instructions and expose permitted worker controls; otherwise FeatureKit reports the limitation and continues directly when capable.

## Optional JEV shadow routing

FeatureKit can ask TypeSafe JEV one batched metadata-only question about capability, effort, execution shape, context breadth, optional references, and provisional review. It is disabled by default. In **shadow** the normal FeatureKit route still executes, so weak or incorrect advice cannot downgrade work. In **enforce**, JEV's confident capability and effort choice decides which model level runs the task.

| Setting | Effect |
| --- | --- |
| unset or `FEATUREKIT_JEV_ROUTING=off` | No TypeSafe call. FeatureKit uses its normal route. |
| `FEATUREKIT_JEV_ROUTING=shadow` | One bounded JEV advisory may run and cache. The normal route still wins. |
| `FEATUREKIT_JEV_ROUTING=enforce` | Same call. When JEV is confident, the task runs at JEV's level (routine, standard or deep) and effort on a model the harness picks. Otherwise, and for gated work, the normal route runs. |

Switching back to `off` is always safe and does not require removing the key or deleting the cache.

### Enforced routing

JEV decides the level: `routine`, `standard` or `deep`, plus an effort. The harness decides the model. Claude Code or Codex picks from the models it offers right now: the cheapest tier for routine work, a middle tier for standard, and the strongest for deep. FeatureKit and product repos name no models. `docs/agents/orchestration.md` can hold an optional override if you want to force one.

Some things never change:

- Unapproved work, pending user decisions, security, authorization, privacy, destructive and irreversible work never go to JEV. They run on the normal route.
- A `hold`, provider failure or weak answer runs the normal route.
- A route never goes below the task's own minimum capability and effort.
- Tasks flagged as a migration, ambiguous, previously failed or missing evidence can only move up. The harness uses JEV's route only if it is at least as strong as the normal model.
- A `minimal` effort floor is raised to `low`, the lowest effort both hosts run.
- Richer, verified task details make JEV more decisive. Describe the approved spec concretely. When the plan or repo confirms them, add the optional facts: an existing automated check, an exact spec, following an existing pattern, new dependencies, and a size estimate. Leave out anything unconfirmed.

A launched task (headless or batch worker) starts on the routed model. In a live session, the primary hands the work to one worker on that model, or works directly if it already runs on it. If a routed attempt fails verification, FeatureKit reruns it once on the normal route and counts that against the route. The local `attempts.json` ledger records requested and runtime-reported model/effort; unknown values stay `null`.

Only routine, low-effort implementation has paired cost evidence so far. Other levels are enforced by choice and should be watched in the ledger and traces. In the 0.8.0 trials, launched tasks saved frontier tokens. A live primary handing a small task to a worker saved little, because the primary's own turns dominate. Claude Code's in-session worker tool accepts a model but not an effort.

Both harnesses use the same dependency-free optimizer and optional local MCP server. The server exposes one read-only `route` tool whose schema prevents the model from reading implementation source just to construct the request. It receives only bounded metadata and reads the key from its process environment.

Claude plugin installations load [`hooks/hooks.json`](../../hooks/hooks.json). Its `UserPromptSubmit` command runs before the model, ignores the submitted prompt, and routes only when exactly one valid task capsule is both approved and `ready` and contains `route.request`. The compact result is injected as advisory developer context, so the model must not call JEV again. Missing, corrupt, stale, unapproved, or multiple matching capsules produce no hook output; the connected `route` tool remains the fallback. Skills-only installations do not install this hook.

From a FeatureKit checkout, connect it once with the absolute checkout path:

```sh
FEATUREKIT_ROOT=/absolute/path/to/FeatureKit
codex mcp add featurekit-jev -- /bin/zsh -ic "exec node '$FEATUREKIT_ROOT/skills/productivity/orchestrate-work/scripts/mcp-server.mjs'"
claude mcp add --transport stdio --scope user featurekit-jev -- node "$FEATUREKIT_ROOT/skills/productivity/orchestrate-work/scripts/mcp-server.mjs"
```

Use the first command for Codex Desktop on macOS when the variables are in `.zshrc`, and the second for Claude Code launched from that shell. Shell startup must not print to standard output because MCP and hooks use it for JSON. A Claude Code plugin installation loads the bundled `.mcp.json` and hook automatically, so do not add duplicate user entries.

For a Codex skills-only installation, merge this group into the `hooks.UserPromptSubmit` array in `~/.codex/hooks.json`, replacing `/absolute/path/to/FeatureKit` with the checkout path. Preserve other hook events and existing `UserPromptSubmit` groups:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "[ \"$FEATUREKIT_JEV_ROUTING\" = off ] || FEATUREKIT_JEV_HOST_ROUTING=\"$FEATUREKIT_JEV_ROUTING\" exec /bin/zsh -ic 'exec node \"/absolute/path/to/FeatureKit/skills/productivity/orchestrate-work/scripts/route-hook.mjs\"'",
            "timeout": 6,
            "statusMessage": "Checking FeatureKit route"
          }
        ]
      }
    ]
  }
}
```

The prefix keeps an explicit host `off` or `enforce` from being replaced by a value your shell startup file exports; an unset value still comes from shell startup. In Codex, open `/hooks`, choose **Review hooks**, open **UserPromptSubmit**, select the FeatureKit command ending in `route-hook.mjs`, and press `t` until it shows **Trusted** and enabled. Trust this entry rather than all pending hooks. Repeat after its definition changes, then start a new task. Claude Code applies its normal plugin trust flow; restart it or run `/reload-plugins` after plugin changes. Check the MCP connection with `codex mcp get featurekit-jev` or `/mcp` respectively.

The MCP process and hook make the TypeSafe call outside the coding workspace sandbox. If either is absent or fails, the normal route continues. Do not loosen the sandbox, retry, or read optimizer source/tests to work around it; the exact compact request and capsule shapes are in the installed optimizer reference.

Add `.scratch/featurekit/` to the product repo's ignore file. Capsules, exact route-cache entries, projections, and content-free traces live there by default; set `FEATUREKIT_SCRATCH_ROOT` only when the repo has a different approved scratch location.

The same local scratch area can hold exact fact receipts. Before repeating repository discovery, reuse a receipt only when its repo snapshot, dirty digest, artifact hashes, query hash, tool contract, index head, and relevant file hashes all match. Any change is a cache miss; a Repowise index behind the current head is stale rather than current proof. Receipts are local and store a concise fact plus a path/symbol reference, not copied source or tool output.

Before a large handoff or escalation, the local deterministic pruner can select packet entries from metadata without receiving their text. Pin authority, scope, acceptance, governing constraints, unresolved failures, current evidence, and ownership. Exact duplicates, superseded entries, resolved progress, referenced old diagnostics, and copied source/docs with stable references can be omitted. Tool commands and results remain paired. Failure falls back to the unpruned packet; JEV pruning is not enabled in this release.

### Host-native compaction

Codex keeps native compaction. An optional `SessionStart` hook can restore the path and revision of exactly one active FeatureKit capsule after compaction; it neither reads nor rewrites the transcript. Claude Code also keeps native compaction by default. Its optional pinned `fast-jev-compaction` pilot shares transcript text and tool-call metadata with TypeSafe, keeps retained text verbatim, and delegates to native compaction on failure or insufficient reduction. It is on only for sessions launched with the pinned plugin and off when that plugin is omitted.

Use the installed [`compaction.md`](../../skills/productivity/orchestrate-work/references/compaction.md) reference for the exact Codex hook and session-scoped Claude pilot. Keep the capsule current, revalidate its snapshot after compaction, and treat `transcript_compaction` as a separate permission from metadata routing and source review. Claude Code was unavailable for the v0.7.0 implementation checks, so its function-hook behavior remains an external live trial rather than a claimed pass.

The route contract accepts bounded objective, scope, acceptance IDs/summaries, deterministic facts, floors, risk flags, and available semantic capability levels. It rejects unknown fields, oversized input, source, diffs, transcripts, and raw output. A pending user decision, hard risk floor, missing key, network/provider error, malformed answer, unavailable choice, low confidence, or small probability margin preserves the affected baseline dimensions. Risk-flagged requests never optimize execution or context. Local traces contain only identifiers, decisions, usage counts, latency, cache status, and reason codes.

`source_review`, context pruning, and `transcript_compaction` are separate privacy scopes and are not enabled by metadata routing. Only routine, low-effort implementation has passed paired cost trials; track the other enforced levels against [`tests/scenarios.md`](../../tests/scenarios.md) and switch back to `shadow` if a family shows unsafe downgrades.

### Optional JEV source-review pilot

Source review is off unless the user or repo explicitly permits focused code/diff sharing and the upstream [`jev-review`](https://github.com/NiazMorshed2007/jev-review) tool is separately connected. It works with Codex and Claude Code. Pin the reviewed upstream revision rather than following `main`; the v0.7.0 pilot used `57690af54ef7d862c2483342c1e61c14dffcf727` (`jev-review` 0.1.1).

Use it only for a stable ordinary diff after required checks pass, no risk flag applies, and the review selector returns a strong `jev-review` candidate. Send the task, focused current diff, and only necessary surrounding files/context. Never send secrets, environment files, unrelated proprietary content, repository-wide source, logs, or transcripts. A weak/error result preserves general review; hard risk preserves deep/security review. During paired replacement trials, run one selected tier rather than stacking JEV and ordinary model review. Allow at most one rescore after a specific evidence-based correction; do not chase scores.

Do not install this MCP server by default yet. Its current tool schema is large, so first confirm that the target host defers it when unused and that complete-task savings exceed its schema and call cost. Follow the upstream Codex or Claude Code setup for an explicitly authorized shadow pilot; removing or disconnecting that separate MCP server returns source review to off without affecting metadata routing.

The v0.7.0 experimental screen did not promote JEV packet pruning, semantic caching, lossy compression, verification caching, or a focused review fork. Deterministic pruning, exact receipts, stable prefixes, and native compaction remain the production choices; see the [experiment record](../plans/2026-09-24-jev-experiments.md).

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
