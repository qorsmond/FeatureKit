# Changelog

## 0.10.3 - 2026-09-25

- Added a dedicated [JEV Routing](./docs/ai-workflow/10-jev-routing.md) guide. It explains what JEV does and what leaves the machine, then walks through setup step by step: adding the `TYPESAFE_API_KEY`, choosing a mode, connecting Claude Code or Codex, a copy-paste check with expected results, rollout, how enforced routing decides, where state is stored, how to turn it off, and troubleshooting.
- Restored the API-key setup instructions. They were accidentally removed from the orchestration guide in 0.8.0.
- The orchestration guide now keeps a short JEV summary that links to the new guide, and the README, guide index, overview, install, setup, working-with-agents, security, and troubleshooting pages link to it.

## 0.10.2 - 2026-09-25

- Release documentation for 0.8.0 through 0.10.1 (Slice 10):
  - Install, setup, working-with-agents, security, troubleshooting, and orchestration guides now describe all three routing modes, harness-chosen models, verified route facts, the attempt ledger and escalation packets, simple receipt keys, measured review selection, and local-only pruning.
  - The orchestration guide adds a staged rollout (`off`, then `shadow`, then `enforce`, with per-family back-off) and a table of switches and privacy scopes for each capability.
  - Install and troubleshooting add the upgrade step for a Codex `route-hook.mjs` entry from before 0.8.0, plus a symptom entry for a host setting overridden by shell startup.
  - Skills and references are corrected: caution-flagged routes move up only, rather than always keeping the baseline; pruning needs no sharing permission; enforced routes drive delegation and the ledger; handoffs carry ledger state and escalation packets; the Claude CLI example passes `--effort`.
  - Behavioral scenarios and the benchmark matrix cover `enforce`.

## 0.10.1 - 2026-09-25

- Documented an optional lean launch for Codex CLI workers: `--ignore-user-config` with explicit model, effort, sandbox, and approval policy, never `--ignore-rules`. In paired trials it cut median worker input by 57% with equal results, and it stopped user MCP servers from writing files into the repo. Extra Claude isolation flags were measured cost-neutral and are documented for isolation only. The Claude compaction pilot remains off and untouched.

## 0.10.0 - 2026-09-25

- Failed attempts now record a bounded failure packet: a one-line summary and the changed paths, never source or diffs. The attempt ledger requires `failure` on failed attempts and `null` on passed ones. An escalation returns this packet with the evidence reference and appends the failure to the task capsule, so the stronger worker continues from the failed attempt's tree instead of restarting discovery. The prompt hook's ledger template includes the new field.
- Deterministic pruning accepts optional local `chars` counts and returns `use_pruned`. A pruned packet is used only when it saves at least 20% and at least 200 characters, or 20% of entries when sizes are absent; otherwise the unpruned packet is sent.
- JEV-assisted pruning is not built. The measured trial cost more than the packet it pruned, and pruning stays local and metadata-only.

## 0.9.0 - 2026-09-25

- Review selection (Slice 6) measures the diff locally. A small verified docs-only diff (at most 20 lines, at most 2 existing files, no new or deleted files, no risk) gets checks only. A small code diff always gets one review on the cheapest level at low effort; a seeded-defect benchmark showed a 7-line code change with passing checks hiding a bug. A hard risk keeps the mandatory deep/security review. Everything else gets one general review at the JEV-routed level, or the baseline level when JEV is weak. Metadata-only JEV can no longer clear a nontrivial diff, and the selector no longer trusts a caller's `trivial` label or accepts `source_sharing`; source-aware `jev-review` stays an opt-in pilot. Receipts and the review selector now exclude the scratch area even when its path is a symlink.
- Validated on a seeded-defect benchmark: the tiered path caught 3 of 3 seeded defects (equal to the Opus-only baseline), with no false alarms, 41% lower review cost, and 56% fewer Opus input tokens.

## 0.8.0 - 2026-09-25

- Added a reversible `FEATUREKIT_JEV_ROUTING=enforce` mode. JEV's confident capability (`routine`, `standard` or `deep`) and effort choice decides the level that runs every approved task; the harness picks the actual model from those it offers at runtime. FeatureKit and product repos name no models; `docs/agents/orchestration.md` holds only optional user overrides.
- Enforcement keeps FeatureKit's gates. Unapproved work, pending decisions, hard risks, and exact lookups skip JEV. A `hold`, provider failure, or weak answer keeps the baseline, and routes never go below request floors. Caution-flagged work (`migration`, `ambiguous`, `prior-failure`, `missing-evidence`) is routed up-only. A `minimal` effort floor becomes `low`. `off` or an unset value still makes no provider call.
- Added a local attempt ledger that records requested and runtime-reported model/effort (unknown stays `null`), allows a routed attempt only first, and escalates one failed routed attempt to the baseline, counted against that route. The prompt hook now injects the enforced route with the exact ledger command.
- The Claude plugin hook and the documented Codex hook keep an explicit host `FEATUREKIT_JEV_ROUTING` value instead of one re-exported by interactive shell startup; the 0.7.1 `off` early exit is unchanged.
- Route requests accept five optional verified facts (`existing_check`, `spec_exact`, `follows_existing_pattern`, `new_dependencies`, `lines_estimate`). The guidance now asks for a concrete objective and acceptance. On a medium task this lifted JEV capability confidence from about 0.37 to 0.85, so fewer tasks stall on `hold`. The policy version is now 7; thresholds, floors, and gates are unchanged.
- Fact receipts accept a simple `key` (repo, query, tool, contract version, index head, paths); the script derives the exact identity locally from git state and file hashes, so reuse costs one call. Added diff-bound `review` receipts, a one-day host model catalogue cache keyed by exact host version, and content-free cache stats showing hits, misses, stale results, and eliminated calls.
- `execute-slices` routes each slice under `enforce` and runs an enforced slice as one fresh worker session on the routed level and effort, preferring a CLI worker that accepts both.
- Only routine, low-effort implementation has paired complete-task cost evidence. The other levels are enforced by user decision without paired economics, which departs from the plan's promotion gate; see the validation record.

## 0.7.1 - 2026-09-25

- Made an explicit `FEATUREKIT_JEV_ROUTING=off` in the Claude Code host environment stop the plugin `UserPromptSubmit` hook before its interactive-shell fallback can re-enable routing from shell startup files; an unset value keeps the existing fallback.
- Recorded live Claude Code plugin, MCP, context-deferral, and pre-model hook validation; three paired Claude manual-routing runs with equivalent verified output and a median 86,272-token frontier reduction after JEV approved routine capability at low effort; and a one-session `fast-jev-compaction` pilot. Routing enforcement and transcript compaction remain off by default.

## 0.7.0 - 2026-09-24

- Reduced recurring FeatureKit context by moving orchestration invariants, worker lifecycle, recovery, and optimizer mechanics into on-demand references; added deterministic context-budget regression checks.
- Added a versioned local task capsule with atomic writes, snapshot freshness checks, and focused primary, worker, reviewer, and handoff projections.
- Added a dependency-free TypeSafe JEV routing kernel with strict metadata-only input, one batched request, confidence and margin gates, exact local caching, content-free traces, and fail-open behavior.
- Shipped JEV routing in disabled-by-default shadow mode for Codex and Claude Code; model, effort, worker, context, and review enforcement remain off until paired safety trials justify individual route classes.
- Added task-trace schema, optimizer tests, JEV fixtures, benchmark families, and setup/documentation for local environment keys without storing secrets in repository files.
- Added a repeatable fourteen-family shadow calibration runner, deterministic pending-decision gating, independent per-dimension advice, and risk masking for optional execution/context suggestions.
- Made weak task-family labeling non-blocking when capability and effort independently clear their safety gates; weak routing dimensions still preserve the baseline.
- Documented the exact compact optimizer request so harnesses do not spend frontier tokens reading implementation source to construct it.
- Added one dependency-free, read-only JEV MCP route tool for Codex and Claude Code so provider calls can run outside workspace sandboxes; documented the exact `off` and `shadow` controls.
- Added an optional shared `UserPromptSubmit` hook that routes one approved ready task capsule before the model, injects only compact advisory context, ignores the submitted prompt, and skips missing or ambiguous capsule state.
- Added private exact fact receipts keyed by repository state, tool contract, query, and relevant file hashes; stale Repowise indexes and changed state force a miss.
- Added shadow-only deterministic review tier selection that reuses the existing JEV route signal, preserves evidence and hard-risk floors, and requires separate source-sharing permission for JEV source review.
- Documented an opt-in pinned upstream `jev-review` pilot for Codex and Claude Code with focused disclosure, one-review replacement, bounded rescore, and fail-open fallback; it is not installed by default.
- Added local metadata-only deterministic context pruning and a compact escalation projection; pinned state and tool pairs are preserved, while duplicates and recoverable stale context can be omitted without a JEV call.
- Added host-specific optimization guidance and a content-free Codex post-compaction capsule restore hook; documented a pinned, session-scoped Claude `fast-jev-compaction` pilot with explicit transcript permission, a clear off switch, and native fallback.
- Screened aggressive JEV pruning and semantic equivalence on synthetic source-free inputs; neither passed the promotion economics/safety gate, so deterministic pruning and exact receipts remain production behavior with no new compressor or semantic cache.
- Completed the v0.7.0 rollout documentation across setup, context, local models, troubleshooting, security, orchestration, and handoff; verified cross-harness packaging, installed optimizer flow, context budgets, and the live HTTP acceptance fixture.

## 0.6.2 - 2026-09-18

- Made setup persist explicit orchestration and live-feedback instructions in the product repo's agent file; existing installs receive a focused refresh without repeating settled setup decisions.
- Made the orchestrator own runtime model/backend/effort selection without a required model roster or per-session prompt; repo mappings remain optional constraints or deliberate overrides.
- Replaced manual session-start instructions with initialize-once guidance and added setup-refresh and changing-host behavioral trials.
- Made the main README cover full installation and repeatable upgrades, including new skills, fresh-session loading, persistent setup refresh and version checks.

## 0.6.1 - 2026-09-18

- Made human-visible routing feedback mandatory during work: planned destination, requested model/effort, acknowledged run ID, source-labeled runtime metadata, progress, reroutes and primary validation outcomes.
- Distinguished dispatched/running/worker-finished/accepted states and unknown model identity so the conversation can be used to debug actual routing without a separate dashboard.
- Added visible-feedback behavioral trials, including mismatched model settings, failed dispatch and direct/current-session execution.
- Documented upgrades that include newly added skills, primary-versus-worker model selection, and a read-only first-session orchestration smoke test.

## 0.6.0 - 2026-09-18

- Added `orchestrate-work` for capability-based routing, bounded native or authenticated CLI workers, focused context, evidence-driven escalation, safe parallelism, and a compact work ledger.
- Added `validate-feature` for acceptance evidence in web, service, mobile, native, desktop and hardware runtimes, with explicit unverified gaps and primary-agent ownership of completion.
- Integrated both disciplines into existing planning, implementation, diagnosis, review and handoff flows; preserved approval gates, sequential slices and single-model operation.
- Extended setup with optional product-specific model/backend mappings and runtime verification guidance, and updated install, workflow and local-model documentation.
- Added packaging checks and repeatable behavioral trials with a live HTTP scratch fixture; external providers and physical-device checks remain conditional on available environments.

## 0.5.4 - 2026-09-01

- Continued focused implementation in the current task without an unnecessary post-approval destination question.
- Limited the fresh-task choice to substantial implementation work and required fresh tasks to reuse the current project checkout and active branch without creating a worktree.
- Updated handoff guidance, behavioral smoke tests, local-LLM guidance, and workflow documentation for the new routing behavior.

## 0.5.3 - 2026-08-29

- Added progressive context budgets to slicing and implementation, preferring Serena-style symbol discovery and RTK-style command compression when available with portable bounded fallbacks.
- Reduced repeated reads, verbose verification, routine subagent dispatch, and duplicated handoff context while preserving targeted diagnostic escalation and high-risk review gates.
- Documented token-efficient implementation and troubleshooting guidance.

## 0.5.2 - 2026-08-29

- Made every interview question self-contained with short plain-language context, concrete outcomes, and explicit material consequences.
- Kept uncertain or confused answers unresolved so FeatureKit explains and re-asks only that decision without discarding other settled answers.
- Added a separate post-approval destination choice for implementation-ready artifacts, with fresh-task creation when supported and a self-contained handoff fallback when it is not.

## 0.5.1 - 2026-08-29

- Added an interview question-tool gate that runs before repo inspection, fact discovery, subagents, or task-specific secondary skills.
- Required a provisional depth and decision ledger before pausing for a mode, configuration, or permission change that enables the native question UI.
- Added a behavioral smoke test that prevents unavailable question tooling from causing unnecessary discovery work before the user can enable it or accept plain text.

## 0.5.0 - 2026-08-28

- Replaced one-question-at-a-time feature grilling with dependency-aware design trees, short question rounds, concise decision ledgers, and final plan approval.
- Added portable structured-question guidance for Codex, Claude Code, and OpenCode, with simple-language rules and an explicit plain-text fallback.
- Made raw feature requests begin interviewing automatically through `using-featurekit` and `ask-featurekit`, while preserving staged approval for PRDs, slices, and implementation.
- Added demand-driven fact discovery, optional subagent fact and coverage audits, context-aware continuation, updated setup/docs/examples, and cross-harness verification guidance.

## 0.4.1 - 2026-07-01

- Tightened the planning gate so implementation requires an approved written plan, PRD, or slice.
- Updated `using-featurekit`, `grill-with-docs`, `grilling`, `to-prd`, `to-slices`, `implement`, `execute-slices`, and `setup-featurekit` so accepting an interview recommendation cannot trigger coding.
- Updated docs, local-LLM guidance, setup output, and install examples to show the expected flow: clarify, write the plan, review and approve it, then implement or hand off.

## 0.4.0 - 2026-07-01

- Added the default security suite: `secure-design`, `secure-code`, `secure-api`, `secure-deploy`, and `security-review`.
- Added `docs/agents/security.md` to setup so product repos can record auth, authorization, sensitive data, API, secrets, dependency, deployment, logging, and incident-response context.
- Integrated security guidance into planning, PRDs, slices, implementation, execution, bug diagnosis, reviews, handoffs, docs, local-LLM guidance, and a dedicated security workflow guide.
- Kept the suite stack-neutral and scanner-neutral; product repos choose their own tools and durable security decisions through setup docs and ADRs.

## 0.3.0 - 2026-06-30

- Added `using-featurekit` as a lightweight session bootstrap and router.
- Added `/execute-slices` for autonomous sequential execution of approved implementation slices.
- Updated setup, routing, docs, local-LLM guidance, and install verification for the new workflows.

## 0.2.0 - 2026-06-30

- Renamed the workflow work item from issues to slices.
- Renamed the PRD splitting skill to `/to-slices`.
- Renamed setup guidance to work tracker and switched new setup docs to `docs/agents/work-tracker.md`.

## 0.1.2 - 2026-06-30

- Added the `verify-tests` skill for checking whether generated or changed tests protect the intended behavior.
- Integrated `verify-tests` with TDD, implementation, bug diagnosis, review, router, docs, and local-LLM guidance.
- Kept mutation testing gated so Stryker or equivalent tools run only when requested or justified by concrete risk.

## 0.1.1 - 2026-06-30

- Added canonical Agent Operating Principles for thinking before coding, simplicity first, and surgical changes.
- Updated setup to copy those principles into target repo agent instructions.
- Updated implementation, diagnosis, TDD, review, design, prototype, pre-commit, docs, and local-LLM guidance to apply the principles before coding, refactoring, or verification work.

## 0.1.0 - 2026-06-30

Initial tracked FeatureKit release.

- Added `VERSION` and `CHANGELOG.md` so FeatureKit has a human-readable release marker.
- Added `featurekit-version` metadata to every skill so installed skill copies expose the release.
- Added the `record-adr` user-invoked skill for per-decision ADRs.
- Added the `adr-guidance` model-invoked skill for following accepted ADRs.
- Updated planning, implementation, review, handoff, docs, and local-LLM guidance to treat accepted ADRs as governing context.
