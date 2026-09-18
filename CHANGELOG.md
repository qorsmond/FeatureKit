# Changelog

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
