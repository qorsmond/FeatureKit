---
name: orchestrate-work
description: Choose direct tools, the current agent, or bounded workers by capability, cost preference, risk, and verifiable outcomes. Use within FeatureKit planning, implementation, diagnosis, and review when distributing substantive work; does not replace their approval gates or create user-facing tasks.
metadata:
  featurekit-version: "0.6.1"
---

# Orchestrate Work

Maximise correct completed engineering work while minimising unnecessary premium-model usage. The primary owns requirements, architecture, user questions, decomposition, integration, escalation, evaluation of evidence, and the overall completion decision.

If you are already an assigned worker, execute your packet directly and return its result; do not route or delegate it again.

## Gates And Routing

1. Follow the active workflow first. For interviews, clear the `grilling` question-tool gate before discovery or delegation. Read-only fact workers may then help before approval; production-edit workers require the approved written scope and implementation intent. A worker receiving approved scope does not restart the interview.
2. Use a deterministic tool directly when it can answer the question or perform the check. Otherwise consider a bounded cheaper worker before doing substantive routine work on a premium model. Delegate only when briefing, checking, and likely recovery cost less than doing the work here, or independent context materially improves confidence. Do not spawn a worker just to run one command.
3. Read the relevant part of `docs/agents/orchestration.md` when present. Resolve explicit user choices, repo mappings, available native tools and installed CLI capabilities. Discover once; recheck after a route fails or relevant configuration changes. Do not inspect secrets to discover authentication.
4. Choose the least expensive **available and adequate** capability, including required tools, context, permissions, runtime access and validation strength. A job title alone does not establish the needed judgment:

   | Capability | Starting candidates |
   | --- | --- |
   | Routine | Factual repo discovery, summaries, mechanical edits, constrained implementation/tests/docs, established checks with clear proof. |
   | Standard | Normal implementation, debugging, integration, and review with bounded uncertainty. |
   | Deep | Ambiguous requirements, architecture, difficult decomposition/debugging/integration, high-risk judgment, conflicting evidence, or failed lower-level attempts. |

5. Map capability to an actual model/alias and backend through repo/native configuration or the current tool's advertised choices. Verify supported reasoning settings. Never hardcode model names in workflow rules, silently substitute a model, or equate a low reasoning setting with a cheaper model. If relative cost is unknown, record that and use configured preference or known suitability without claiming savings.
6. If no suitable worker, model override, or external backend is available, continue in the current session when capable. Record the limitation. If the task needs unavailable judgment or proof, return the unresolved decision/gap instead of lowering the requirement. One model/provider and manual local-model use are valid modes.

For native or external execution, read [backends.md](references/backends.md) only for the selected backend. Prefer an existing authenticated subscription route; API-funded fallback needs explicit authorization. A separate process does not imply a separate usage pool.

## Live Feedback To The Human

Routing must be visible in the conversation while work happens, not only in an internal ledger or final report. The primary relays worker status; workers need not speak directly to the user. Use the host's progress/commentary surface, or short text updates when it has none. Native activity cards can supplement these updates but do not replace missing route/model information.

- Before substantive work, show the chosen workflow, whether it stays in the current session, uses direct tools, or goes to a worker, and a short reason. Identify the current session's model/effort only when authoritative host metadata exposes them; otherwise say `not exposed`. For direct tool execution, the worker model is `n/a`; do not attribute a shell command to a separate model.
- Before each dispatch, give the job a short stable label such as `W1` and show its bounded objective, backend/provider, capability level, exact requested model/alias and effort, and why this route fits. This is a **planned** route, not a running worker. Replace placeholders with observed/configured values; `routine` alone is not a model identity.
- After acknowledgment, report **dispatched** and the actual worker/run ID or native link when available. Say **running** only when the host reports it. Show runtime-reported model/effort and their source (for example CLI startup metadata), or `not exposed; requested settings only`. A configured/default model, alias, requested spawn argument, or worker self-description is not confirmation of actual execution.
- Surface any model/effort mismatch immediately. Stop/reconcile the route under the existing permissions and routing policy instead of silently calling the requested model confirmed. If no exact identity is exposed, do not fabricate it or block otherwise valid work just to discover it.
- Report meaningful transitions: useful progress, blocker/failure, retry, escalation/reroute, cancellation, worker finished, validation, and primary acceptance/rejection. An escalation names the old and new route/model/effort, the evidence that triggered it, and whether the original worker has stopped. Keep the same job label across reroutes, such as `W1 attempt 2`; distinguish attempts/run IDs rather than renaming the job.
- A failed/ambiguous dispatch without a run ID does not prove that no work ran. Say `execution state unknown` unless the host confirms no execution, and resolve possible active writers before reassigning ownership. Explain the actual routing reason: missing model metadata alone neither requires stronger reasoning nor proves that no suitable worker exists.
- Separate `worker finished; validation pending` from `accepted by primary`. Close each job with its checks/results and remaining gaps. For long-running work, keep the human informed at the host's normal progress cadence; label an unchanged wait honestly without inventing progress or polling aggressively.

Use one or two compact lines per transition and group simultaneous updates. Do not narrate every file read/command or repeat the whole ledger on every update. Include the final job outcomes and observed routes in the user-facing completion summary; link the existing work ledger when useful. Never dump secrets, raw prompts, transcripts or logs to provide visibility.

Example shape (values come from configuration and runtime evidence):

```text
[W1 · planned] Locate the expiry check → <backend/provider> · routine · requested <model>, effort <setting>. Reason: bounded factual search.
[W1 · dispatched] Run <ID/link> · reported model/effort: not exposed; requested settings only.
[W1 · checking] Worker finished; verifying its file references.
[W1 · accepted] References checked against the current tree; no remaining gaps.
```

This feedback does not bypass interview/approval gates or trigger extra discovery before they clear. If a gate pauses work, show the pause using already available context, not a fictitious worker route.

## Bounded Work

Reuse the approved slice and `handoff` context; do not create a second spec. Give one worker one outcome and relevant existing skills, including security disciplines when applicable. Specialist work means appropriate skills/tools, not a new agent hierarchy.

```text
Objective / existing skill:
Approval / scope: artifact and slice, or read-only investigation
Repository state: checkout, revision, relevant uncommitted changes
Context: relevant paths/symbols, established findings, governing instructions
Ownership: allowed files/actions; exclusions and dependencies
Constraints: ADRs, security, interfaces, available tools/runtime
Acceptance / proof: behavior, commands or procedures, expected evidence
Limits: bounded attempt/time; stop on uncertainty, scope conflict or missing proof
Return: status, findings/changes, checks/results, gaps and next decision
```

Reference shared artifacts once when accessible; include necessary excerpts when not. Supply the selected skills when the destination cannot discover them. Avoid history forks, whole-repo dumps, duplicated source/logs, and repeated investigation. Reuse findings with paths/symbols and their revision; refresh only evidence invalidated by changes.

Worker rules:

- Follow governing repo instructions and the packet's boundaries. Do not recursively spawn, create user tasks, change scope, make user decisions, approve plans, or claim overall completion.
- Implement only approved assigned work through `implement`. Read-only workers do not edit. Keep pre-existing changes intact. Report an ownership conflict instead of reverting someone else's work.
- Return `complete`, `blocked`, `uncertain`, or `needs-stronger-reasoning`, plus separate verification status (`passed`, `failed`, `blocked`, `not run`). Include changed paths or factual references, commands with results, runtime evidence, gaps and the exact help needed. `complete` describes the assignment only.
- Stop when the brief cannot be satisfied safely, a material assumption needs a decision, proof is unavailable, or the attempt limit is reached. Do not guess to produce a success report.

## Parallelism And Integration

Start with one useful worker. Default to at most two concurrent workers, within host limits; repo policy may change that ceiling. Parallel work must have independent dependencies, file ownership, stable input snapshots and nonconflicting runtime resources. The primary should have useful work alongside it. Serialize overlapping edits, shared test databases, simulators, device sessions or ports. Read-only review needs a stable diff; do not review files while another worker changes them.

Keep approved slices in dependency order under `execute-slices`; independent jobs within the active slice may run concurrently. Preserve that workflow's branch, worktree, commit and publishing boundaries. Delegation does not authorize any additional action or provider disclosure beyond the task's permissions and data constraints.

Before accepting work, inspect the scoped diff/findings against the packet and check evidence against the actual resulting tree. Run applicable integration checks once changes settle, using `validate-feature`. Do not blindly apply a patch, rerun an already valid full suite, or let worker-written tests be the only evidence for a critical requirement. Use `verify-tests` and existing security/review gates where needed.

## Recovery And Independent Review

On a failed or uncertain result, inspect the evidence and classify the cause:

- A concrete mistake or missing fact: provide the correction and allow one focused retry when likely to succeed.
- Insufficient reasoning or conflicting evidence: escalate capability or let the primary take over, carrying the failed attempt and diagnostics rather than restarting discovery.
- Missing environment, permissions, auth, quota, or runtime: mark the route unavailable; use another authorized suitable route or report the prerequisite. Stronger reasoning cannot supply a missing device.
- Ambiguous scope or ADR conflict: primary resolves it through the governing workflow; no worker guesses.

Never repeat an unchanged failing attempt or cycle indefinitely between backends. After a focused retry fails, escalate or return the unresolved decision to the primary. Bound the next attempt explicitly. If none can proceed, preserve the partial result and report the blocker. Cancel/stop the old run and confirm it cannot still write before retrying or reassigning ownership.

Use fresh-context `review-change` or `security-review` selectively for high-risk, surprising, hard-to-reverse work or conflicting evidence. Give requirements, constraints, a stable diff and test evidence without the implementer's rationale. The reviewer returns findings, not approval authority. Routine edits do not require multiple reviewers.

## Work Ledger

Use the same job labels and observed facts as the live updates. Extend the current slice/queue ledger, persisting with the work artifact or `handoff` only when useful; a private ledger never substitutes for human-visible progress:

| Job / work / reason | Capability / backend | Requested → reported model / effort (source) | Run ID / result / attempts / escalation | Evidence / primary disposition |
| --- | --- | --- | --- | --- |
| Stable label, assignment or retained deep decision | Configured route or current session | Observed values and source; otherwise unknown | Host ID if exposed; status and why it changed | Checks, gaps, accepted/rejected/pending |

Record substantive retained premium reasoning as well as delegations. Report requested model/effort selections separately from actual execution metadata. Record usage only when exposed reliably, with source and scope; account usage is not worker usage. Unknown tokens, costs and savings stay unknown. Refine routing manually from observed outcomes; no automatic learning or quota manager.
