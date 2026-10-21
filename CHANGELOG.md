# Changelog

## 0.14.1 - 2026-10-21

- `kx.py` links a decision to a Python script it names by command in backticks, such as `import-orders --dry-run`. The first word must contain a hyphen or underscore and be the file name, without `.py`, of exactly one indexed module. Plain words such as `process`, and names two scripts share, link nothing. Deterministic evidence on a copy of the product repo from 0.14.0, with its current docs:
  - Governs links rose from 10 to 15, and mentions stayed at 592.
  - All five new links were checked by hand and are correct: three ADRs cite the pipeline command and two cite the bench command.
  - Of 53 candidate words in its ADRs, only those two commands matched a script; the rest were environment variables and image names.
  - Reading the pipeline script now reports its three decisions.
  - Output on the `impact-callers` Click fixture is identical. `tests/check_kx.py` adds a command-name match, a plain-word non-match and an ambiguous non-match.
- Docs describe 0.13.0 and 0.14.0, with no skill changes.
  - The README covers recorded repo conventions, the optional knowledge index, the small-fix exemption and what a setup refresh adds when upgrading.
  - The overview, install, main-flow, working-with-agents and local-LLM pages, the quick start and the local-LLM prompt name the recorded locations and the glossary instead of fixed paths and `CONTEXT.md`.
  - Troubleshooting adds entries for skills ignoring the repo's layout, a file with no governing decisions in the index, and the agent stopping for a one-line fix.
  - The 0.14.0 entry and the troubleshooting example no longer use a product repo's file names.

## 0.14.0 - 2026-10-21

Fixes the remaining friction from running `/setup-featurekit` on a real product repo.

- `kx.py` links a decision to the Python files it names in backticks. The file is found by its repo path or, failing that, by the one indexed path that ends in the name; an ambiguous name links nothing. Backticked mentions now accept hyphens, so a path such as `scripts/import-orders.py` counts. The Read hook's "decisions governing <file>" pointer now fires for such files. Before, it could fire only through `sources` frontmatter, which those ADRs do not have. Deterministic evidence: on a copy of that repo, 7 ADRs now govern 10 Python files, and reading one adds its decisions with their statuses. Before, nothing was linked.
- `kx.py` indexes untracked files that git does not ignore, so setup docs written but not yet committed count. It also hashes only the files it indexes (`.py`, `.md`, `.rst`), so edits to other files no longer trigger rebuilds. On a full copy of that repo (1,596 tracked files), a warm build took 0.6–0.8 s instead of 1.0 s, hashing 235 files with the same 2,641 nodes. Output on the `impact-callers` Click fixture is identical. `tests/check_kx.py` covers both.
- A repo can opt in to a small-fix exemption from the plan gate. Setup asks (default no) and records an `Exemption:` line with its limits under the plan rule in the `Agent skills` block. `using-featurekit` routes a covered fix directly and keeps the hard stop for anything else. It looks only for that line in the instructions it already has and never searches the repo for one. The line is not part of the block that evals inject, so the gate eval runs without an exemption.
  - Eval-backed on cost (`gate-no-plan`, FeatureKit arm, Sonnet, 3 runs each; about $0.93 in total). The first wording ("unless the repo's small-fix exemption covers the request") passed 3/3 but cost $0.18–0.20 per run against $0.09 before (`after-0.11.0`). In every run the agent searched `docs/agents/` and the code for an exemption before stopping. Pointing the rule at the `Exemption:` line in the loaded instructions brought two runs back to $0.093 and $0.096 (1–2 tool calls). The third cost $0.158, from reading code to propose a plan, within 0.12.0's spread ($0.10–0.39). Correctness held at 3/3 throughout.
  - Hypothesis that the exemption works when present: a repo needed its own override line for this. `tests/scenarios.md` adds a "Small-fix exemption" trial, not yet run.
- `setup-featurekit` is model-invocable, so a model routing through `using-featurekit`, or a session started by another session, can load it. Its approval-before-write gate is unchanged, and `tests/check_packaging.py` now requires it to stay model-invocable.
- Setup and its guide:
  - The labelled lines are shown as a list; plain lines still parse.
  - Knowledge-index hooks for skills installs go in the repo: `.claude/settings.json` with `$CLAUDE_PROJECT_DIR` paths, or `.codex/hooks.json`.
  - A topic the repo already documents is summarised and linked, never restated.
  - A section with the same purpose under another heading counts as the setup block; it is merged and renamed in place.
  - `docs/agents/` frontmatter uses `type: agent-guide` and the git user name in `verified.by`.
  - The work-tracker question is asked only when the repo does not show the answer.
- Context budgets are raised to the measured sizes: bootstrap +279 characters (the exemption), model-invocable descriptions +329 (setup joins them), all skills +1,248, `AGENTS.md` +109.

## 0.13.0 - 2026-10-21

- Skills now follow the conventions `setup-featurekit` records in a product repo instead of their hard-coded defaults. This came from running setup on a real product repo: numbered ADRs from a template in `docs/decisions/`, Proposed ADRs that govern work built on them, handoffs kept per feature, and no `CONTEXT.md`. Setup recorded all of it, but `record-adr`, `handoff`, `prototype`, `domain-modeling`, `grill-with-docs` and the knowledge index still used their own paths and formats.
  - The contract: labelled lines in `docs/agents/workflow-locations.md` (`ADR directory`, `ADR filename`, `ADR template`, `ADR statuses`, `Handoffs`, `Prototypes`) and a `Glossary:` line in `docs/agents/domain.md`. A missing line keeps the old default, so existing setups keep working. Rerun `/setup-featurekit` to add the lines.
  - `record-adr` takes the directory, filename pattern and numbering, template, and statuses with their meanings from those lines, and adds the new ADR to the directory's index. `adr-guidance` applies the recorded status meanings. `handoff` writes to the recorded location (default `docs/handoff/<slug>.md`). `prototype` now has a location (default `.scratch/prototypes/<slug>/`, not committed). `domain-modeling`, `grill-with-docs` and `record-adr` use the named glossary and never create `CONTEXT.md` beside it.
  - Trial-backed, one run, not an eval: a fresh Sonnet agent ran the new "Recorded locations" trial in `tests/scenarios.md` in a scratch repo that records these lines. It numbered ADR 0003 after 0002, copied every template section, listed the ADR in the index, updated the feature's handoff in place, put the prototype under `.scratch/prototypes/` and added the term to the named glossary. It created no `CONTEXT.md`, `docs/adr/` or `docs/handoff/`. The no-lines half of the trial and the `evals/` cases were not run, and no eval case exercises these skills.
- `kx.py` treats the files in the recorded `ADR directory` as ADRs. An `adr/` folder and `type: adr` frontmatter still count, and an ADR folder's README/index and template are documents, not decisions. Proposed ADRs are shown with a PROPOSED flag instead of being hidden. An ADR whose `Superseded by:` line is filled while its status stays Accepted is shown as superseded in part and stays visible. `find` hides only deprecated, superseded and stale knowledge. Deterministic evidence: on a copy of the real repo, its 42 ADRs index with their statuses (18 accepted, 23 proposed, one accepted and superseded in part), where 0.12.0 indexed all of them as plain documents. Output on the `impact-callers` Click fixture is byte-identical. New `tests/check_kx.py`, also listed in `AGENTS.md`.
- Setup guide: documents the labelled lines and fixes a broken code fence after the Codex hooks JSON.
- Context budgets are raised to the measured sizes for these rules: all skills +1,965 characters (1.9%), interview bundle +57, handoff bundle +83, `AGENTS.md` +26 for the new check.

## 0.12.0 - 2026-10-21

- Added an optional knowledge index, `using-featurekit/scripts/kx.py`: one standard-library script that indexes Python symbols and Markdown/RST docs, ADRs, and lessons into a derived SQLite index in `.kx/`.
  - Calls resolve through the enclosing class, imports, and package re-exports, and skip builtins and external modules. On four held-out targets in SQLAlchemy (780K lines), the callers it reports match hand-checked ground truth exactly, including two same-named functions that name-only matching had merged.
  - ADR `sources` link decisions to the code they govern.
  - Results flag changed files as STALE and hide superseded knowledge.
- The plugin ships two opt-in, non-blocking hooks that do nothing unless the repository has `.kx/index.db`. When a prompt names code, they add a short pointer; when the agent searches for a symbol or reads a governed file, they add its callers, tests, and decisions. Each item appears once per session, and the index refreshes in the background. Codex users can add the documented hook entries.
- Evidence from an improvement episode ($5.91, Sonnet, Claude Code, 3 runs per task):
  - The index reached the agent in 13 of 13 hooked runs, against 2 of 15 when a skill instructed it and 3 of 8 with an always-on trigger line.
  - Hooks took 4–39 ms per event and added about 150–500 tokens per task.
  - On four impact-analysis tasks, cost per run fell 18% (lower in all four) and turns fell in three.
  - Checks passed rose from 18/33 to 21/33, which is within run-to-run variance.
  - The plan gate and implement cases showed no regression.
  - Verdicts: delivery helped; call resolution helped (deterministic, checked offline); cost helped (medium confidence); correctness showed no effect beyond noise.
- `setup-featurekit` offers the index as an opt-in and gives `docs/agents/` files OKF-style frontmatter. Verified project lessons are recorded as `cue`, `lesson`, `evidence`, and `confidence`.
- `AGENTS.md` now covers the cheapest-component ladder, capped improvement episodes with per-change verdicts, and treating fixtures, traces, and indexed text as data. `tests/check_packaging.py` checks that the hooks are gated on the index and that must-fire skills are named in the setup block. These practices are adapted from Google Research's Harness² and are process changes, not measured effects.
- Added the `impact-callers` eval case (Click at a pinned commit; run `evals/fetch.sh` first). `evals/run.py` adds `--suite`, per-arm instructions, a `*nohooks` baseline arm, and hook metrics.

## 0.11.0 - 2026-10-21

- Removed JEV routing completely: the TypeSafe optimizer, its MCP server, the prompt and compaction hooks, task capsules, the attempt ledger, fact receipts, the model catalogue cache, deterministic pruning, their tests and fixtures, the JEV guide, and the JEV plan and evidence documents. In the live calibration corpus every JEV route equalled the capability floor the caller already supplied (11 of 11), and in-session delegation it drove did not lower total cost. The plugin now ships no hooks or MCP servers.
- Kept what the trials proved, as plain rules: the capability table now routes a bounded change with an exact spec, an existing check and an existing pattern to Routine; `orchestrate-work` works directly by default and runs batch slices as one fresh session on the routed model; escalations carry a failure packet (29% cheaper in trials); `review-change` sizes one review from the diff; the Codex lean worker launch is in the single `orchestrate-work` worker reference.
- Plan files are now the durable task state. Each slice carries `Status`, `Evidence` and `Notes`; `implement`, `execute-slices` and `handoff` update them, and `using-featurekit` resumes from the first slice that is not done instead of repeating investigation.
- `using-featurekit` adds an evidence-gated learning rule: fix a proven cause in the cheapest durable place (a check, then the authoritative project source, then slice notes), correct verified project facts in place, and record FeatureKit workflow problems as project-neutral proposals in `docs/agents/featurekit-feedback.md` instead of editing installed skills. `validate-feature` applies it when documented guidance proves wrong.
- `implement` and `execute-slices` are now model-invoked (eval-backed). The baseline eval showed `using-featurekit` routing an explicit "implement the approved plan" request to the explicit-only `implement`, where the agent stopped and asked the user to type the command: 0 of 3 resume runs and 0 of 3 stale-knowledge runs completed, against 3 of 3 for a bare agent. Their own gates still require explicit implementation intent and an approved artifact.
- The manual interview and handoff smoke steps moved from `AGENTS.md` to `tests/scenarios.md`; `AGENTS.md` adds rules for evidence-based changes to FeatureKit.
- Added `evals/`: five cases built from real failures (approval gate, implementation, stale project knowledge, resuming a plan, review of an untested path), run through `claude plugin eval` against a bare agent by `python3 evals/run.py`, which re-runs the acceptance checks on each kept workspace and reports cost, turns, tokens and tool calls.
- The shared workflow invariants moved into `using-featurekit`, fixing a broken `implement` link in `skills` CLI installs. `tests/check_packaging.py` now installs every skill with the `skills` CLI and resolves the installed copies' links.

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
