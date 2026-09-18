# Capability-based orchestration and runtime validation

Status: approved by the user on 2026-09-18; all four slices implemented as 0.6.0. See the [validation record](2026-09-18-orchestration-validation.md) for evidence and environment limits.

Baseline: FeatureKit 0.5.4, commit `4b3f8b0`, clean `main` at inspection.

## Goal

Maximise correct completed engineering work while minimising unnecessary premium-model usage. Keep FeatureKit a portable Markdown skill harness, with the primary agent accountable for requirements, decisions, integration, evidence, and completion.

This document contains the approved implementation scope, decisions, acceptance criteria, and ordered slices.

## What already exists

FeatureKit has 28 skills and no custom orchestration runtime. Its flow is setup → bootstrap/interview → approved plan/PRD/slices → implementation → verification/review → handoff. The target repo owns stack, tracker, security, deployment, and verification choices through `docs/agents/`.

| Existing capability | Reuse and necessary change |
| --- | --- |
| `using-featurekit`, `ask-featurekit` | Keep workflow selection and approval gates. Add lightweight routing to shared disciplines without turning the bootstrap into an executor. |
| `grilling`, `grill-with-docs` | Already allow independent fact discovery and coverage audits. Apply capability routing only after the question-tool gate; factual workers never decide user requirements. |
| `to-prd`, `to-slices` | Already carry scope, acceptance criteria, security, dependencies, and verification. Add target runtime/evidence requirements and optional ownership boundaries, rather than a second planning format. |
| `implement`, `execute-slices` | Already maintain compact ledgers, use progressive discovery and narrow checks, and gate expensive reviews. Replace the blanket discouragement of routine workers with an evidence-based delegation decision. Keep ordered slices sequential. |
| `tdd`, `verify-tests` | Keep behavioral tests and targeted falsification. `verify-tests` evaluates test strength; it does not currently establish feature completion across runtimes. |
| `diagnosing-bugs`, `review-change`, security skills | Reuse reproduction, risk-based review, and security gates. Delegate bounded tasks through these disciplines instead of creating scout/debug/review agent families. |
| `handoff` | Reuse compact context and repository state. Preserve explicit user selection for a new user-facing task; ordinary workers are not task handoffs. |
| `setup-featurekit`, guide, local-model prompt | Extend the existing configuration and installation path; preserve no-worker and manual operation. |

Evidence: [bootstrap](../../skills/productivity/using-featurekit/SKILL.md), [implementation](../../skills/engineering/implement/SKILL.md), [slice execution](../../skills/engineering/execute-slices/SKILL.md), [test verification](../../skills/engineering/verify-tests/SKILL.md), [setup](../../skills/engineering/setup-featurekit/SKILL.md), [handoff](../../skills/productivity/handoff/SKILL.md), and [agent guide](../ai-workflow/04-working-with-agents.md).

The principal conflicts are `execute-slices` and the guide's advice to avoid routine delegation, and an end-to-end example that already overstates per-slice worker/review behavior. There is no shared model mapping, work/result contract, escalation policy, or runtime evidence contract. No automated behavioral harness currently exists; verification is CLI discovery/install checks plus documented manual scenarios.

Repowise's overview index is behind HEAD and covers only four generated pages. Source Markdown was therefore inspected directly after the overview search. Serena is activated, but this repository has no application symbols to analyze.

## Design decisions

### 1. One shared orchestration discipline

Add model-invoked `skills/productivity/orchestrate-work/SKILL.md`. It owns routing, bounded delegation, escalation, integration, and the small work ledger. Existing workflow skills call it when choosing who should perform substantive work. It does not replace them or require another user command.

Use three capability levels: **routine**, **standard**, and **deep**. These describe judgment required, not a model family, provider, price, or job title. Specialists are workers given relevant existing skills and tools, not a permanent agent hierarchy.

| Level | Starting candidates, subject to risk and available proof |
| --- | --- |
| Routine | File/symbol discovery, factual summaries, mechanical edits, constrained tests/docs, established deterministic checks. Run a simple tool directly when that is sufficient. |
| Standard | Normal bounded implementation, debugging, integration, or review with clear requirements and useful validation. |
| Deep | Ambiguity, architecture, difficult decomposition/debugging/integration, high-risk judgment, conflicting evidence, or failed lower-level attempts. |

Prefer the least expensive available route likely to succeed **including** briefing, checking, and escalation costs. Do not invent prices or claim a route is cheaper when relative cost is unknown. The primary role need not always require the most expensive model; this task's primary remains responsible for decisions, whichever model hosts it. A short direct operation can cost less than spawning a worker.

### 2. Configuration stays in the product repo

Extend setup with an optional `docs/agents/orchestration.md`, referenced from the generated agent instructions. Keep it a short Markdown table and policy, not executable configuration or a registry service.

Each configured route records capability level, backend/native worker mechanism, actual model or supported alias, reasoning setting when supported, preference order, known subscription/authentication mode, and important tool/context restrictions. Actual model IDs belong here or in existing native harness configuration, never in shared routing logic. Record only verified availability; examples use placeholders.

Resolve routes from the user's explicit choices, repo policy, and the current tool/CLI capabilities. Native harness settings remain authoritative for effective execution. Do not edit global configuration or silently substitute a model. If the effective model cannot be observed, record the requested selection and `effective model: unknown`.

Missing configuration is not a setup blocker: use clearly advertised suitable native capabilities when their use is authorized; otherwise work in the current session and record the limitation. One provider, one tier, unavailable external workers, and no delegation all remain valid modes. API-funded fallback is not automatic.

### 3. Reuse slices and handoffs as bounded work packets

One compact packet references the approved artifact once, with only the additional execution information the worker needs:

```text
Objective and selected existing FeatureKit skill:
Approval/scope: artifact and approved slice; or read-only investigation
Repository state: checkout, revision and relevant uncommitted changes
Context: relevant paths/symbols, established findings and governing rules
Ownership: permitted files/actions; explicit exclusions
Constraints: ADRs, security, interfaces, dependencies and available tools
Acceptance and proof: behavior, commands, runtime/platform, evidence needed
Stop when: blocked, uncertain, scope conflict, missing proof, attempt limit
Return: status, changes/findings, checks and results, gaps, next decision
```

Workers receive necessary context rather than the conversation history. They do not recursively delegate, change scope, make user decisions, approve plans, bypass permissions, or claim the whole task complete. Only the primary asks user questions, updates the interview decision tree, and presents final approval. Existing project instructions and relevant security disciplines still apply. Implementation workers use `implement` against an approved bounded portion; they do not restart the interview.

Results use `complete`, `blocked`, `uncertain`, or `needs-stronger-reasoning`, with separate verification status so missing runtime proof cannot be hidden inside success. Include reproducible findings, changed paths, actual command results, runtime evidence and limitations. The primary inspects the result and diff and accepts or rejects it against the contract.

### 4. Small, evidence-driven execution

Start with one useful worker. Run independent work in parallel only when dependency, file ownership, snapshot, and shared resource boundaries are clear, and the parent can make useful progress. Use a conservative default ceiling of two workers, configurable within host limits. Avoid duplicate searches, overlapping edits, and concurrent tests that mutate the same database, simulator, port, or device. When independence cannot be established, serialize.

Keep `execute-slices` in dependency order; independent work within the current slice can run concurrently. Preserve existing no-branch/no-worktree/no-publishing boundaries. The orchestrator integrates and validates shared changes after workers finish; evidence becomes stale when relevant code changes.

On failure, inspect the evidence first. Distinguish task ambiguity, missing tools/permissions, infrastructure failure, and insufficient reasoning. Correct one concrete briefing/implementation mistake when a focused retry is justified; do not repeatedly retry unchanged work. Escalate capability or return the decision to the primary when necessary. A stronger model does not fix an absent device or permission. Stop unavailable workers, preserve partial work safely, and report unresolved gaps if no capable route remains.

Use fresh-context independent review when risk or conflicting evidence warrants it. Supply requirements, constraints, diff and relevant evidence, without the implementer's persuasive reasoning. Trivial changes do not receive mandatory agent reviews.

### 5. Native workers first, optional authenticated CLI workers

Put provider-specific details in an on-demand reference under `orchestrate-work`, not in the core policy. Use the native worker tool schema actually exposed, including explicit model selection and minimal/no history inheritance where supported. Do not use Codex user-task creation as a worker scheduler.

For external workers, prefer an installed authenticated CLI running a bounded noninteractive request in the intended checkout, with explicit supported model selection, narrowly appropriate permissions, captured result/exit status, and a bounded execution lifetime. Feed packets through stdin/files rather than shell interpolation. Never weaken sandbox/approval controls to get a run to succeed, scrape credentials, or silently switch to paid API access. Audit resulting changes and reported validation before accepting them.

Codex CLI is installed and `codex login status` reports ChatGPT authentication. Its local help supports `exec`, model selection, stdin prompts, read-only/workspace-write sandboxes, JSON events, and a last-message output file. Current Codex documentation describes per-worker models and inherited permission controls: [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [authentication](https://learn.chatgpt.com/docs/auth). Native workers and another Codex CLI session should not be represented as independent subscription capacity without evidence; both may consume the same account pool.

Claude Code is not on this shell's PATH. Document and inspect its adapter without pretending a live run passed. Its official documentation supports noninteractive CLI use and subscription login, but authentication precedence matters and `--bare` excludes subscription OAuth. Consult installed help before selecting flags; keep normal authenticated operation for subscription workers. Sources: [programmatic CLI use](https://code.claude.com/docs/en/headless), [authentication](https://code.claude.com/docs/en/authentication). External-backend unavailability must leave the core flow working.

### 6. One shared feature-evidence discipline

Add model-invoked `skills/engineering/validate-feature/SKILL.md`. This fills a missing responsibility rather than renaming `verify-tests`: it maps acceptance criteria to evidence for the actual application runtime. Test quality and security review stay in their existing skills.

Extend the existing `docs/agents/verification.md` setup contract to record applicable runtimes/platforms, commands, fixtures, test devices/simulators, environment prerequisites, hardware restrictions, and required manual evidence. Plan evidence during PRD/slicing; apply it during implementation, debugging, review, and handoff.

For each relevant acceptance criterion, record the code/revision tested, command or procedure, runtime/platform and device or simulator where relevant, result (`passed`, `failed`, `blocked`, `not run`), evidence location, and limitations. Reuse current valid evidence; rerun when integration invalidates it.

- Web: browser behavior where the changed requirement needs it, plus relevant service tests.
- Backend: real service/protocol/job/data behavior; no unnecessary browser requirement.
- React Native/Expo/native mobile: affected Android/iOS targets and the correct runtime. A browser preview or Expo environment lacking the required native module cannot prove native behavior.
- Desktop: target OS/application runtime and integration surfaces as applicable.
- Hardware/platform features: distinguish mocks/simulators from physical evidence for NFC, camera, Bluetooth, biometrics, permissions, notifications, keyboard, lifecycle, location, or native modules. Select checks based on the changed requirement rather than requiring every device for every edit.

A build is evidence for building only. Implementation may be finished while feature validation remains blocked. The primary makes the completion decision and names any missing evidence and exact remaining procedure; it never reports an unvalidated acceptance criterion as passed.

### 7. Observability extends the existing ledger

Record a compact row per substantive delegation/retained deep decision: task, routing reason, required capability, backend, requested/effective model when observable, status, attempts/escalation, evidence and primary disposition. Reuse the active slice/queue ledger; persist it with the work artifact or handoff when useful. Do not require a new log file for a trivial direct edit.

Capture usage only if the provider exposes reliable data, with its source and scope. Account-level usage is not per-worker usage. Unknown tokens/costs stay unknown. Use observed failures and successes to adjust the small routing table manually; no learning engine, quota manager, dashboard, or caching system.

## Ordered implementation slices

### Slice 1: Routing and bounded worker execution

Add `orchestrate-work` and its provider reference. Add short hooks to bootstrap/planning and implementation/diagnosis/review where routing occurs. Read-only fact workers may run after the question-tool gate clears, before plan approval; production-edit workers must wait for the approved written scope. Replace the conflicting `execute-slices` subagent policy. Extend `handoff` with route/evidence continuity while preserving its distinct fresh-task authorization.

Acceptance: a bounded routine job can select an available cheaper worker; direct tools/current-session work remain preferred when sufficient at lower total cost; delegation requires clear ownership, useful evidence and justified benefit; ambiguous/high-risk decisions stay with adequate reasoning; worker packets are sufficient without transcripts; no recursive fan-out, duplicate ownership, unapproved edits, or implicit new user tasks; failed attempts produce justified recovery/escalation rather than blind retries.

### Slice 2: Runtime-aware evidence and completion

Add `validate-feature`; integrate it into `implement`, `execute-slices`, `diagnosing-bugs`, `review-change`, and relevant prototype verification. Update PRD/slice verification fields and handoff gaps. Leave `tdd`, `verify-tests`, and security disciplines in charge of their existing responsibilities.

Acceptance: checks are selected from project context and change scope; service work need not open a browser; Android/iOS and hardware gaps remain visible; successful builds/tests do not erase missing runtime evidence; the primary owns completion.

### Slice 3: Setup, guide, compatibility, and release

Extend setup with optional orchestration mappings and richer existing verification guidance. Update affected install lists, bootstrap routes, main flow, agent guide, end-to-end example, troubleshooting, local-LLM prompt and guide index. Use one focused orchestration guide for worked routing/CLI/ledger examples. Add the two skills to plugin discovery. Release as `0.6.0` with `VERSION`, `CHANGELOG.md`, plugin version, and every skill's `metadata.featurekit-version` synchronized.

Acceptance: a scratch product repo can follow installation through setup and a complete delegated feature workflow; local/manual/single-provider use works without configuration; changing available model names changes mappings rather than workflow instructions; no duplicate scout/plan/debug/review workflow appears.

### Slice 4: Behavioral validation and correction

Add a small reusable set of scenario prompts, fixtures and outcome checks, plus a standard-library packaging check where it catches actual discovery/link/version errors. Avoid an evaluation framework and tests that merely match policy wording. Run independent skill forward-tests with bounded contexts against scratch copies; inspect actual tool choices, changes, evidence, and completion claims.

Required scenarios:

1. Native question tool disabled: bootstrap pauses before discovery/delegation, preserving existing behavior.
2. Unapproved implementation: no worker or parent starts production edits; read-only analysis remains distinguishable.
3. Approved mechanical change: suitable routine worker, small packet, passing behavioral check, primary acceptance.
4. Ambiguous/high-risk change: adequate reasoning and relevant existing security/review disciplines.
5. Independent work vs overlapping files/shared runtime resources: safe parallelism or serialization.
6. Wrong/uncertain worker output and failed test: inspect evidence, focused correction or escalation, no unchanged retry loop.
7. Missing provider, model, authentication or permission: no fabricated selection or API-spend fallback; single-session progress when feasible.
8. Backend feature: protocol/runtime proof without imposing a browser.
9. Mobile native/hardware feature: correct target selection and honest validation gap when hardware is absent.
10. Fresh-context review and observability: independent evidence, requested vs effective model distinction, unknown usage preserved.
11. Existing interview approval, unclear-answer handling, staged PRD/slice approval and same-checkout fresh-task handoff scenarios remain intact.

Run the repository's required `skills` discovery, installation for Codex/Claude Code/OpenCode, selected-skill loading and version checks. Add new skills to those checks. Run skill frontmatter validation. Execute the guide in a disposable scratch product repo, including a small real behavior with a failing-then-passing check and a deliberately unprovable runtime scenario. Installation artifacts stay in scratch storage rather than modifying this project's installed skills.

Report deterministic, simulated behavioral and live integration results separately. Actual Claude execution and physical/mobile runtime execution cannot be called verified when those environments are absent. Simulated outcomes test FeatureKit's handling of missing proof; they do not prove a real mobile feature or external CLI works.

## Boundaries and completion

No custom FeatureKit CLI, orchestrator service, agent tree, message bus, provider SDK, API-key requirement, automatic model-name catalogue, usage estimates, quota polling, automatic learning, cache, worktree management, global configuration changes, or publication. No unrelated skill cleanup beyond release metadata.

Complete when the four slices pass the applicable checks, the scratch workflow provides actual implementation and validation evidence, and unavailable integrations/runtime checks are explicitly documented. The user decides whether to enable missing external environments; their absence must not prevent FeatureKit's single-environment workflow.

## Inspection record

The primary traced implementation, execution, diagnosis, TDD/test proof, review/security, bootstrap/handoff, setup and guides, plus native tool schemas and local CLI help. One fresh-context Codex worker using an explicitly selected routine-capability model (`gpt-5.6-luna`, medium effort) audited assigned planning/setup/handoff docs read-only. It returned path-based findings; the primary checked the relevant source and retained ownership of these design decisions. No token/cost saving is claimed because no task-level billing evidence was exposed. No FeatureKit production behavior has changed at this stage.

Baseline checks: all 28 plugin skill paths exist and this plan's local links resolve. An offline `skills` CLI probe could not run because npm has no cached package; installation/discovery checks will require registry access during implementation. A worker consistency review prompted explicit wording for pre-approval read-only work and primary interview ownership above.
