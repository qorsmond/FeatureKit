# JEV shadow validation — FeatureKit 0.7.0

Date: 2026-09-24

Scope: implementation slices 0–3, Slice 4 shadow calibration, the Slice 5 receipt kernel, Slice 6 review-tier selector, Slice 7 deterministic pruning, and the local Slice 8 host adapters from [`2026-09-24-jev-orchestration.md`](./2026-09-24-jev-orchestration.md). Routing enforcement, review replacement, JEV pruning, Claude transcript compaction, and semantic reuse remain disabled.

## Observed live result

The versioned `tests/fixtures/jev/route-request.json` normal-implementation fixture was sent once to the TypeSafe System One endpoint with metadata-only shadow routing.

| Field | Observed value |
| --- | --- |
| Provider/model | TypeSafe `jev-1.13.0` |
| Result | `hold`; baseline preserved |
| Reported usage | 1,283 input / 480 output tokens |
| Strong signals | scoped implementation; routine capability; targeted context |
| Weak/ambiguous signals | effort, execution shape, brief completeness, review tier |
| Execution effect | none; shadow mode |

The immediate repeat returned the exact cached decision with `cache: hit` and did not require another provider call. No source, diff, transcript, raw tool output, or secret was supplied or recorded.

Three additional route-only safety fixtures were observed separately from complete-task outcomes:

| Fixture | Result | Material signal | Reported usage |
| --- | --- | --- | --- |
| Mechanical edit | `hold` | Routine/minimal/direct were strong; brief completeness missed the reduction gate | 1,290 / 480 |
| Unknown-root debugging after failure | `hold` | Deep/high/broad were favored; consequence, execution and review remained ambiguous | 1,317 / 473 |
| Architecture/migration | `hold` | Deep/high/broad/deep-security reinforced the policy floor; brief was incomplete | 1,309 / 471 |

This initial corpus showed that asking JEV whether a brief was self-contained conflated missing user decisions with repository details that an agent can retrieve. The question was removed: `user-decision-pending` is now a deterministic risk flag that skips JEV. Optional execution/context advice is also masked whenever any risk flag is present, while capability and effort remain protected by their configured floors.

## Slice 4 calibration corpus

`tests/run_jev_shadow.mjs` evaluates fourteen task families against explicit capability, effort, execution, context, and review safety constraints. The final live run used TypeSafe `jev-1.13.0` and produced:

| Outcome | Observed value |
| --- | --- |
| Cases | 14 |
| Deterministic skips | 3: exact lookup, pending user decision, security/destructive floor |
| JEV calls | 11 |
| Safe shadow advisories | 10 |
| Holds | 1: known-root debugging effort signal below threshold |
| Unsafe advisories | 0 |
| Reported provider usage | 14,605 input / 5,021 output tokens |

The calibration runner exposed one unsafe optional context suggestion during an intermediate run for a missing-evidence review. The final policy masks execution/context optimization for every risk-flagged request; the rerun had zero unsafe suggestions. Weak execution, context, or review answers now become `null` independently instead of blocking strong capability/effort advice or influencing execution.

An immediate repeat produced 11 exact cache hits and three deterministic skips, with zero provider calls and zero additional reported provider usage.

This is route-only evidence. The ten safe advisories are candidates for paired complete-task Codex and Claude Code trials, not permission to enforce them.

## Codex complete-task pair

One disposable Python service task was run from identical committed snapshots with Codex CLI 0.150.1, the authenticated default model, and requested medium reasoning. The CLI did not report the effective model identity. Both final trees changed only `server.py`; both passed `python3 check_health.py` when rerun outside the CLI's loopback-restricted workspace sandbox.

| Metric | Baseline | JEV shadow |
| --- | ---: | ---: |
| Input tokens | 134,035 | 308,155 |
| Cached input tokens | 117,504 | 286,592 |
| Uncached input tokens | 16,531 | 21,563 |
| Output tokens | 3,405 | 4,957 |
| Reasoning output tokens | 1,418 | 1,943 |
| Final live acceptance | pass | pass |

The shadow arm attempted one metadata-only optimizer call, which failed open with `ENOTFOUND` because the Codex workspace sandbox blocked TypeSafe DNS. Before calling it, the agent read the optimizer reference and then the full optimizer source to infer the request schema. Total input was 2.30× baseline and uncached input was 30% higher, so this arm fails the Slice 4 economics gate despite equivalent verified quality.

The optimizer reference now carries the exact compact request shape and explicitly forbids source/test discovery or retry after an unavailable result.

## Host-side MCP transport

A dependency-free stdio MCP server now exposes one read-only `route` tool with the complete bounded metadata schema. It imports the existing optimizer instead of duplicating routing policy, reads the key and `off`/`shadow` setting from its process environment, and returns structured results. Source, diffs, transcripts, logs, raw output, and secrets are excluded from the schema.

Observed checks:

- initialization and tool discovery succeeded over real newline-delimited JSON-RPC stdio;
- `FEATUREKIT_JEV_ROUTING=off` returned `status: off` without a provider call;
- a fresh `shadow` MCP call reached TypeSafe and returned `status: hold`, `cache: miss`, and `baseline_preserved: true`;
- a restarted Codex task discovered and called the native `featurekit-jev.route` tool;
- that first native call returned `status: off`, proving that Codex Desktop on macOS had not inherited the variables stored in `.zshrc`;
- the registration was changed to launch through `/bin/zsh -ic`; that exact launch path reached TypeSafe and returned `status: shadow`, `cache: miss`, model `jev-1.13.0`, 1,368 input / 457 output tokens, and `baseline_preserved: true`;
- `codex mcp get featurekit-jev` reports the shell-backed stdio registration as enabled without storing the API key in Codex configuration;
- the MCP wrapper and optimizer suite passed eleven deterministic tests.

This proves the transport, native Codex discovery, and out-of-workspace provider path, not complete-task token savings. A restarted Codex task loaded the corrected MCP launch settings; Claude Code remains unavailable on this machine, so paired host trials still gate enforcement.

Claude Code is not installed on this machine, so no Claude complete-task trial was run or claimed.

## Native MCP complete-task repeat

After restarting Codex with the corrected MCP environment, the same disposable HTTP-service task was run JEV-first and baseline-second from identical committed snapshots with the authenticated default model and requested medium reasoning. The JEV arm called the native route tool once before reading source; TypeSafe returned a full `routine` / `minimal` / `direct-deterministic` / `targeted` advisory with 1,353 input and 463 output tokens. Shadow mode preserved the baseline execution.

| Metric | Baseline | JEV MCP shadow |
| --- | ---: | ---: |
| Input tokens | 137,961 | 585,133 |
| Cached input tokens | 122,496 | 542,848 |
| Uncached input tokens | 15,465 | 42,285 |
| Output tokens | 1,544 | 2,541 |
| Reasoning output tokens | 842 | 1,138 |
| Final live acceptance | pass | pass |

The unchanged fixture failed the live HTTP check. Both final trees were byte-identical, changed only `server.py`, and passed the same live check outside the workspace sandbox. This pair is not a clean attribution: Serena was available to the JEV arm but unavailable to the baseline arm, adding extra discovery and cleanup turns. It is therefore recorded as inconclusive, not as a measured JEV penalty. It still fails the economics gate and confirms that a model-called route tool cannot be the token-saving path when every extra tool round repeats a large frontier context.

Codex and Claude Code both document `UserPromptSubmit` hooks that run before the model. A dependency-free shared hook now reads exactly one approved `ready` capsule containing `route.request`, ignores the submitted prompt, calls the existing optimizer, and injects only compact advisory context. Missing, corrupt, unapproved, or ambiguous capsule state is silent. A direct live invocation returned a shadow advisory, and a fresh trusted Codex CLI task then returned `JEV_CONTEXT_PRESENT` without the trust-bypass flag or a model-called JEV tool turn. The same task returned `JEV_CONTEXT_ABSENT` before the exact hook entry was trusted, confirming fail-open behavior. This removes the model turn used only to call JEV; its own complete-task economics remain unproven, so enforcement stays disabled.

## Source-aware review pilot

With explicit user approval for focused source/diff sharing, upstream `jev-review` 0.1.1 was cloned into disposable scratch space and pinned to commit `57690af54ef7d862c2483342c1e61c14dffcf727`. Its standalone MCP server initialized successfully and exposed the single `jev_review` tool. No global plugin, project dependency, or persistent MCP registration was added.

One live call sent 6,676 JSON characters: the new shadow review-tier selector, its input-validation helpers, its focused test, the requirements, and concise passing-check context. It sent no key, unrelated source, repository-wide context, logs, transcript, or raw tool output. The server exposed a 26,800-character tool schema and did not return provider token usage.

Thirteen dimensions were applicable. The lowest score was test quality at 6.6 with 0.67 confidence; correctness was 7.7 with only 0.43 confidence, security was 8.0 with 0.55 confidence, and every returned priority was low severity. This is a weak baseline signal, not clearance: general review remains required, no score-driven code change was justified, and no rescore was spent. The observed schema size also argues against installing the source-review MCP by default until host deferral and complete-task economics are measured.

## Host-native compaction adapter

The pinned `fast-jev-compaction` revision `e3f262a7f4d42bd8dd32ced30d26176f7cb545b0` was inspected in disposable scratch space. It preserves recent messages, pairs calls/results, keeps retained text verbatim, requires a minimum reduction, and calls Claude's native compaction path on missing key, provider/malformed response, state-fit failure, or insufficient reduction. It sends conversation text and tool-call metadata to TypeSafe, so FeatureKit exposes it only as a separately authorized, session-scoped external pilot. No project dependency, permanent plugin, or live Claude claim was added.

Codex keeps native compaction. A dependency-free `SessionStart` hook now restores only the exact active capsule path, task ID, and revision after `source: compact`; it ignores the transcript, is silent for zero/multiple active capsules, and tells the resumed agent to revalidate the repository snapshot. Official Codex hook behavior confirms `PreCompact`/`PostCompact` cannot replace the message list.

## Slice 9 experimental screen

One synthetic, source-free TypeSafe call batched fourteen questions for aggressive packet pruning and strict semantic-query equivalence. It used 2,185 input and 288 output tokens. A 0.50 pruning threshold dropped 361 of 743 candidate characters without a false drop, but deterministic metadata already removed three of the four optional items; a 0.70 threshold incorrectly dropped a required environment gap. Strict equivalence at 0.80 produced no false hits but missed one of two equivalent pairs.

The call cost exceeded the entire tiny packet and did not replace a complete frontier call. No experiment was promoted, no repeated call was spent, and the temporary runner was removed. The full disposition is recorded in [`2026-09-24-jev-experiments.md`](./2026-09-24-jev-experiments.md).

## Deterministic evidence

- `node --test tests/optimizer.test.mjs`: eighteen tests covering route validation, MCP discovery/off mode, deterministic/approval/risk skips, pending-decision gating, independent optional dimensions including weak task-family and effort boundaries, risk masking, missing-key fallback, one-call batching/cache, malformed-response fallback, atomic capsule writes, stale worker/escalation projections, prompt-hook injection/ambiguity, content-free post-compaction capsule restoration, exact fact receipts, shadow review tiering, deterministic context pruning and tool-pair integrity, path traversal rejection, and secret-field rejection passed.
- A disposable real Git snapshot produced an exact receipt hit while unchanged; after the referenced file changed, its dirty-state and relevant-file hashes changed and the same query produced `RECEIPT_MISSING` instead of reusing the stale fact.
- `python3 tests/check_context_budget.py`: setup block, bootstrap, orchestrator, representative route request, worker projection, and reviewer projection stayed within their budgets.
- `python3 tests/check_packaging.py`: all 30 skills, version metadata, manifest inventory, and local links passed.
- `node --check skills/productivity/orchestrate-work/scripts/optimizer.mjs`, `node --check skills/productivity/orchestrate-work/scripts/route-hook.mjs`, and `git diff --check`: passed.

## Slice 10 release rollout

- A disposable product repo installed the 22 selected core skills for Codex, Claude Code, and OpenCode. The installed `orchestrate-work` copy contained the optimizer, route hook, compaction hook, and lazy references.
- The packaged copy completed one local flow covering route-off fallback, atomic capsule write, worker and handoff projections, deterministic pruning, deterministic review selection, and post-compaction capsule restoration.
- Every required `skills use` smoke passed for `using-featurekit`, interview/planning, implementation, review/security, orchestration, and validation entry points.
- The live HTTP fixture failed on its baseline plain-text `/health` response, then passed JSON body/content-type and unknown-route acceptance after the scoped scratch-only change. This validates the runtime fixture, not an agent behavioral trial.
- Eighteen optimizer tests, all script syntax checks, the 30-skill packaging/version/link check, JSON manifests, context budgets, release metadata count, and `git diff --check` passed.
- Claude Code CLI, native question/destination UI trials, external devices, and a live Claude compaction session remain unavailable and are not claimed. After trust/restart, a live Codex native compaction restored the exact active capsule task ID through the configured `SessionStart` hook without transcript content or a JEV call.

## Host status

The live provider calls, stdio MCP exchange, native Codex tool use, trusted pre-model routing and post-compaction hook consumption, local Node execution, packaged release flow, and HTTP fixture are observed. Claude installation and behavioral trials remain unavailable, and no simulated host condition is recorded as a live pass. Slice 4 enforcement remains blocked until paired complete-task trials establish equivalent verified outcomes and positive retry-adjusted token economics in both harnesses.

## Codex economics pilot stop — 2026-09-25

Verdict: **failed** at the routing preflight. This candidate cannot demonstrate savings, so no Codex task arm was run.

The authenticated host reported Codex CLI `0.150.1`, ChatGPT authentication, configured model `gpt-5.6-sol`, and configured reasoning effort `xhigh`. A live `codex debug models` refresh exposed these user-selectable model/effort combinations:

| Model | Default effort | Supported efforts |
| --- | --- | --- |
| `gpt-5.6-sol` | `low` | `low`, `medium`, `high`, `xhigh`, `max`, `ultra` |
| `gpt-5.6-terra` | `medium` | `low`, `medium`, `high`, `xhigh`, `max`, `ultra` |
| `gpt-5.6-luna` | `medium` | `low`, `medium`, `high`, `xhigh`, `max` |
| `gpt-5.5` | `medium` | `low`, `medium`, `high`, `xhigh` |

The refreshed catalogue also contained hidden `gpt-reserve` and `codex-auto-review` entries; neither was treated as an eligible user-selectable experiment route.

The approved `CODEX-ECON-PILOT` metadata request was sent once through the connected optimizer with `FEATUREKIT_JEV_ROUTING=shadow`. TypeSafe `jev-1.13.0` returned `hold`, `cache: miss`, `baseline_preserved: true`, and no advisory. Its routine-capability signal was strong (`0.91` confidence, `0.86` margin), and its minimal-effort signal cleared the configured thresholds (`0.57` confidence, `0.30` margin). The aggregate gate failed only because the descriptive task-family signal was weak (`0.36` confidence, `0.04` margin). Reported JEV usage was **1,335 input / 461 output tokens**. No source, diff, transcript, raw output, credentials, or secrets were sent.

The experiment procedure requires a strong routine/minimal or otherwise clearly cheaper safe route before task execution. The `hold` result therefore stopped the experiment without forcing a downgrade, creating disposable task snapshots, or spending tokens on baseline or routed Codex arms.

| Metric | Baseline | JEV-routed |
| --- | ---: | ---: |
| Requested model | `null` | `null` |
| Runtime-reported model | `null` | `null` |
| Requested effort | `null` | `null` |
| Runtime-reported effort | `null` | `null` |
| Input tokens | `null` | `null` |
| Cached input tokens | `null` | `null` |
| Uncached input tokens | `null` | `null` |
| Output tokens | `null` | `null` |
| Reasoning tokens | `null` | `null` |
| Retries | `0` | `0` |
| Escalations | `0` | `0` |
| Files changed | `0` | `0` |
| Baseline fixture failure | not run | not run |
| Final acceptance | not run | not run |
| Environment limitation | mandatory JEV preflight stop | mandatory JEV preflight stop |

Exact frontier-token reduction is `null`: there are no paired Codex measurements. JEV usage remains separate and does not count as frontier usage. Quality equivalence, retry-adjusted savings, variance, and the three-pair promotion gate remain untested. Narrow Codex enforcement is not justified, and shadow mode itself is not credited with savings.

The stop exposed an all-or-nothing reconciliation bug rather than an unsafe JEV route. Policy version 6 now treats task-family labeling as optional: a weak label becomes `null`, while capability, effort, consequence, availability, and every deterministic/risk floor remain mandatory. A regression reproducing the observed confidence and margin values now returns partial shadow advice, and a separate boundary test confirms that weak effort advice still returns `hold`.

The exact original metadata request was then replayed once against TypeSafe under policy version 6. The stale policy-v5 cache entry was not reused. The live response returned partial `shadow` advice with task family `null`, capability `routine`, effort `minimal`, targeted context, deterministic review, and **1,335 input / 463 output JEV tokens**. This validates the reconciliation fix against the live provider; the economics pilot still requires fresh paired Codex task arms before any enforcement claim.

## Codex manual routed economics benchmark — 2026-09-25

Verdict: **validated** for the exact narrow manual-routing experiment. This is evidence that a policy-v6-approved JEV decision can replace the requested expensive Codex route for this routine fixture; it is not evidence that shadow mode itself saves tokens, and no automatic production enforcement was enabled.

Host preparation used Codex CLI `0.150.1` with ChatGPT authentication. A refreshed catalogue exposed `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, and `gpt-5.5` as user-selectable; hidden `gpt-reserve` and `codex-auto-review` entries were excluded. The baseline requested `gpt-5.6-sol` at `xhigh`; the routed arm requested the clearly cheaper `gpt-5.6-luna` at `low`. Codex JSON events did not report effective model or effort, so every runtime-reported model/effort field is `null` rather than inferred.

Three unique metadata-only requests (`CODEX-ECON-R2-1` through `CODEX-ECON-R2-3`) returned `status: shadow`, approved capability and effort, and the same partial advisory: task family `null`, capability `routine`, effort `minimal`, targeted context, and deterministic review. Each call used 1,336 JEV input and 463 output tokens; aggregate JEV usage was **4,008 input / 1,389 output tokens**. No source, diff, prompt, transcript, raw tool output, credential, secret, or repository content was sent to JEV.

All arms started from committed fixture snapshot `cd4ccb0014ffc827453b102492644e6297e01874`. The baseline check failed independently in every fresh copy. Each non-interactive child used the same ephemeral workspace-write sandbox, ignored user configuration and rules, disabled subagents, had no MCP access, and had `FEATUREKIT_JEV_ROUTING=off`; only the requested model/effort and the routed arm's compact approved advisory differed. Pair order was baseline/routed, routed/baseline, baseline/routed.

### Pair 1

| Metric | Baseline | JEV-routed |
| --- | ---: | ---: |
| Requested model / effort | `gpt-5.6-sol` / `xhigh` | `gpt-5.6-luna` / `low` |
| Runtime-reported model / effort | `null` / `null` | `null` / `null` |
| Input tokens | 64,660 | 63,616 |
| Cached input tokens | 50,176 | 50,944 |
| Uncached input tokens | 14,484 | 12,672 |
| Output tokens | 1,044 | 617 |
| Reasoning tokens | 395 | 84 |
| Retries / escalations | 0 / 0 | 0 / 0 |
| Observed elapsed time | about 30.0 s | 25.7 s |
| Baseline fixture failure | observed | observed |
| Final acceptance | pass | pass |
| Files changed | `server.py` only | `server.py` only |

The final files were byte-identical. Under requested-route attribution, pair 1 removed **14,484 frontier-model uncached input tokens**; the routed arm's 12,672 uncached cheaper-model input tokens and its JEV usage remain separate.

### Pair 2

| Metric | Baseline | JEV-routed |
| --- | ---: | ---: |
| Requested model / effort | `gpt-5.6-sol` / `xhigh` | `gpt-5.6-luna` / `low` |
| Runtime-reported model / effort | `null` / `null` | `null` / `null` |
| Input tokens | 65,173 | 77,369 |
| Cached input tokens | 50,304 | 61,952 |
| Uncached input tokens | 14,869 | 15,417 |
| Output tokens | 1,255 | 816 |
| Reasoning tokens | 449 | 142 |
| Retries / escalations | 0 / 0 | 0 / 0 |
| Observed elapsed time | about 38.8 s | 29.5 s |
| Baseline fixture failure | observed | observed |
| Final acceptance | pass | pass |
| Files changed | `server.py` only | `server.py` only |

The final files were byte-identical. Under requested-route attribution, pair 2 removed **14,869 frontier-model uncached input tokens**; the routed arm used 548 more uncached input tokens overall, but all 15,417 were on the cheaper requested route and remain separate from frontier usage.

### Pair 3

| Metric | Baseline | JEV-routed |
| --- | ---: | ---: |
| Requested model / effort | `gpt-5.6-sol` / `xhigh` | `gpt-5.6-luna` / `low` |
| Runtime-reported model / effort | `null` / `null` | `null` / `null` |
| Input tokens | 73,313 | 63,775 |
| Cached input tokens | 56,960 | 52,992 |
| Uncached input tokens | 16,353 | 10,783 |
| Output tokens | 1,011 | 664 |
| Reasoning tokens | 458 | 97 |
| Retries / escalations | 0 / 0 | 0 / 0 |
| Observed elapsed time | about 30.7 s | about 30.0 s |
| Baseline fixture failure | observed | observed |
| Final acceptance | pass | pass |
| Files changed | `server.py` only | `server.py` only |

The final files were byte-identical. Under requested-route attribution, pair 3 removed **16,353 frontier-model uncached input tokens**; the routed arm's 10,783 uncached cheaper-model input tokens and its JEV usage remain separate.

### Aggregate disposition

The three baseline arms used 203,146 frontier-model input tokens: 157,440 cached and 45,706 uncached, plus 3,310 output and 1,302 reasoning tokens. The three routed arms used 204,760 cheaper-model input tokens: 165,888 cached and 38,872 uncached, plus 2,097 output and 323 reasoning tokens. The exact per-pair frontier uncached-input reductions were 14,484, 14,869, and 16,353 tokens; the median retry-adjusted reduction was **14,869 tokens**, positive in every pair.

Every arm passed the same external live HTTP acceptance check, changed only `server.py`, passed `git diff --check`, and matched its paired output byte-for-byte. Some runs emitted a generic Seatbelt filesystem-denial warning inside the child sandbox, so the external acceptance check is authoritative. The sandbox and tool surface were identical across arms, making this a run-level limitation rather than an asymmetric tool confound. Runtime model/effort non-reporting is an observability limitation and is kept explicit; no task usage was inferred from account-wide usage.

The three-pair result economically justifies a narrow Codex enforcement candidate for this calibrated routine/minimal class. The exact remaining production step is to implement the separately approved family-specific enforcement path behind a reversible setting and run an end-to-end enforced trial that records the effective runtime model/effort when exposed while rerunning the same approval, privacy, scope, acceptance, fallback, and zero-unsafe-downgrade gates. Broader FeatureKit promotion still requires the approved Claude Code evidence; this benchmark does not supply it.

## Claude Code validation — 2026-09-25

Verdict: **validation incomplete**. Claude plugin, MCP, context, and pre-model hook behavior are live-verified after one hook compatibility fix. Manual economics stopped at the mandatory routing gate, so no Claude task arm was run and no Claude savings are claimed. The Codex evidence above is unchanged and does not prove Claude behavior.

### Live observations

| Check | Observed result |
| --- | --- |
| Revision | `9b28cd5`, clean before this validation |
| Host | Claude Code `2.1.282`; `apiKeySource: none` (no API key; plan not exposed) |
| Environment | `FEATUREKIT_JEV_ROUTING=shadow`; `TYPESAFE_API_KEY` present, value not read |
| Plugin | `featurekit` `0.7.0` loaded inline from `/Users/iso/Dev/FeatureKit` via `--plugin-dir` |
| MCP | `plugin:featurekit:featurekit-jev` connected (source `plugin`) with one `route` tool |
| Skills | `using-featurekit`, `orchestrate-work`, and `validate-feature` available as plugin skills |
| Hook | `hooks/hooks.json` `UserPromptSubmit` ran through the plugin before session init and the first model turn |
| Context | Headless `/context all`: MCP tools 543 eager / 1.9k deferred; the 735-token `route` schema is deferred |

`ENABLE_TOOL_SEARCH` was not enabled: the only eagerly loaded MCP schemas were three claude.ai Docs tools (543 tokens), which is not a material catalogue. Interactive `/mcp` and `/context all` were not typed by the coordinating agent; the equivalent evidence comes from the headless `init` event and `/context all` in a disposable repo.

Inside the FeatureKit checkout, Claude also reads the plugin-root `.mcp.json` as project configuration. That duplicate `featurekit-jev` entry fails with `CONNECTION_CLOSED` because `CLAUDE_PLUGIN_ROOT` is undefined in project scope. The plugin-scoped server is unaffected, and product repositories do not load this file as project configuration. No user-scoped duplicate was added.

### UserPromptSubmit smoke

A disposable Git repository outside FeatureKit received approved `ready` capsules with a bounded route request. Each non-interactive Claude run used `claude-haiku-4-5-20251001`, the FeatureKit plugin directory, and one harmless read-only prompt containing a canary. A local `https.request` wrapper recorded only host, path, and request body for TypeSafe calls; headers and the key were never recorded.

| Case | Hook output | TypeSafe calls | Model result | Model JEV tool calls |
| --- | --- | ---: | --- | ---: |
| One eligible capsule, `shadow` | compact advisory, `status: shadow`, `baseline_preserved: true` | 1 | `JEV_CONTEXT_PRESENT` | 0 |
| Zero capsules, `shadow` | none | 0 | `JEV_CONTEXT_ABSENT` | 0 |
| Two eligible capsules, `shadow` | none | 0 | `JEV_CONTEXT_ABSENT` | 0 |
| One capsule, `off` (original hook) | advisory injected | 1 | `JEV_CONTEXT_PRESENT` | 0 |
| One capsule, `off` (fixed hook) | none | 0 | `JEV_CONTEXT_ABSENT` | 0 |
| One fresh capsule, `shadow` (fixed hook) | compact advisory, `status: shadow` | 1 | `JEV_CONTEXT_PRESENT` | 0 |

Every recorded request body contained only the capsule's schema-1 route metadata and the JEV question set. The prompt canary, source, diffs, transcripts, logs, raw output, secrets, and credentials were absent. The injected text states that the approved plan, policy floors, and baseline route remain authoritative. Each live hook call used 1,310 input / 461 output JEV tokens; three calls used 3,930 / 1,383. Disposable capsules and traces were deleted after the trial.

The original `off` failure was a real Claude compatibility bug. The plugin hook launched `/bin/zsh -ic`, and the user's `.zshrc` exported `FEATUREKIT_JEV_ROUTING=shadow`, overriding the explicit `off` supplied by the Claude process. The fix exits before shell startup when the host environment is explicitly `off`, while an unset value keeps the existing interactive-shell fallback. The regression test `Claude plugin prompt hook honors an explicit host off setting before shell startup` failed before the fix and passes after it. The Codex hook snippet in `09-orchestration.md` uses the same wrapper and was not changed or re-verified in this Claude-scoped run.

### Manual economics routing gate

The approved `CLAUDE-ECON-1` metadata request was sent once through `optimizer.mjs` with `FEATUREKIT_JEV_ROUTING=shadow`. TypeSafe `jev-1.13.0` returned `hold`, `cache: miss`, `baseline_preserved: true`, advisory `null`, approved dimensions `null`, and reason `WEAK_SIGNAL`. Reported JEV usage was **1,335 input / 463 output tokens**. The unchanged request was not retried.

Capability and effort were not approved, so the procedure stopped before creating fixture snapshots or launching either child. Model discovery had resolved `fable`, `opus`, `sonnet`, and `haiku` to `claude-fable-5-1`, `claude-opus-5-5`, `claude-sonnet-5`, and `claude-haiku-4-5-20251001`. The planned routes were `claude-opus-5-5` (the user's default) for baseline and `claude-haiku-4-5-20251001` at low effort for the routed arm. They were not exercised. Claude's `init` event does not report runtime effort.

| Metric | Baseline | JEV-routed |
| --- | ---: | ---: |
| Requested / runtime model | not run / `null` | not run / `null` |
| Requested / runtime effort | not run / `null` | not run / `null` |
| Input, cache-read, cache-write, output, reasoning tokens | `null` | `null` |
| Retries / escalations | 0 / 0 | 0 / 0 |
| Files changed | 0 | 0 |
| Baseline fixture failure / final acceptance | not run | not run |
| Limitation | mandatory JEV `hold` stop | mandatory JEV `hold` stop |

Exact Claude frontier-token reduction is `null`. The earlier Codex `CODEX-ECON-R2-*` requests received partial `shadow` advice for the same metadata shape, so this request is borderline under policy version 6 rather than stably approved. That variability is recorded, not overridden.

### Simulated and unavailable

- Simulated: none. The `https.request` wrapper observed real calls rather than replacing them.
- Unavailable: runtime effort, Claude paired task usage, quality equivalence, retry-adjusted frontier reduction, and three-pair variance.
- Not run: the `fast-jev-compaction` pilot, which requires separate `transcript_compaction` permission.

Narrow Claude enforcement is not justified. Promotion still requires a routing decision that approves capability and effort, three paired Claude complete-task runs with equivalent live acceptance and positive median retry-adjusted frontier reduction, and a decision about whether variable borderline `hold` results are acceptable in the target task family.

### Claude transcript-compaction pilot — 2026-09-25

With explicit one-session `transcript_compaction` permission, the pinned `fast-jev-compaction` revision `e3f262a7f4d42bd8dd32ced30d26176f7cb545b0` was cloned into disposable scratch space and loaded for one temporary session only with `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` and `--plugin-dir`. FeatureKit was not loaded, `FEATUREKIT_JEV_ROUTING` was `off`, and nothing was installed.

Code review confirmed that the Jev state carries message text and tool-call inputs capped at 1,000 characters, replaces every tool-result body with an `ok, N chars (omitted)` note, calls only `api.typesafe.ai`, and falls back to native compaction on a missing key, provider or malformed-response error, oversized state, or less than 25% reduction. Hook types regenerated by Claude Code `2.1.282` differ from the checked-in `2.1.274` reference only additively: `ToolUseSummary` gained optional `agentId` and `durationMs`, and `ui.log` gained an optional options argument. `claude plugin validate` passed with only a missing-author warning.

The session ran headlessly on `claude-haiku-4-5-20251001` in a synthetic Git repository of five generated text files (about 135 KB), with only the `Read` tool allowed. The procedure was two file-reading turns covering five `Read` calls, three short turns, `/context`, manual `/compact`, `/context`, and a tool-free recall question.

| Observation | Result |
| --- | --- |
| Pre-compaction context | 62.3k tokens; messages 43.7k |
| `compact_boundary` | manual; 62,411 → 4,606 tokens; 1,692 ms |
| Resulting history | all user/assistant text verbatim; no summary message; all five `Read` calls and results removed |
| Path taken | pilot replacement, inferred from the verbatim no-summary history; native summarization would add a compact summary |
| `/context` after resume | 62.8k tokens; messages 44.2k |
| Recall turn usage | 10 uncached + 17,695 cache-read + 46,485 cache-write input; 158 output |
| Recall quality | all five values correct (192, 781, 505, 988, 228) |
| Jev usage | `null`; the pilot does not report provider tokens, and `ui.log`/toast notices were not persisted in headless mode |
| Session model cost reported by Claude | $0.212 cumulative |

The pilot replaced the history as designed, but no context saving was demonstrated across the next turn. The persisted post-boundary history is only a few kilobytes and its parent chain stays after the boundary. The resumed session nevertheless reported about 44k message tokens and billed about 64k input tokens. The cause is unverified; one candidate is Claude's post-compaction restoration of recently read files, which would affect native compaction equally. Recall is weak quality evidence because the answers also remained in retained assistant text.

The first user message is pinned and sent in full. Claude stores account context such as the user email as a separate `session_context` attachment. Whether the function-hook `SessionMessage.text` includes attachments was not observed, so that exposure is unverified; the request body was not intercepted because the hook uses the engine's `$.http.fetch`.

Verdict: **validation incomplete**. The mechanism works on Claude Code `2.1.282` with an additive type drift. Complete-task savings, Jev usage, the exact payload, and interactive-session behavior remain unmeasured. Native compaction stays the default, and the pilot should not be installed or tuned. The scratch clone, synthetic repository, and session transcripts were deleted after recording these content-free measurements.

### Claude manual routed economics benchmark — 2026-09-25

Verdict: **validated** for the narrow manual-routing experiment. A policy-v6-approved JEV decision replaced the expensive Claude route for this routine fixture with equivalent verified output. Shadow mode itself saves nothing, and no automatic enforcement was enabled.

**Routing gate history.** Five metadata-only requests used the approved task metadata, each with a unique ID:

| Request | Effort floor | Result | Capability conf / margin | Effort conf / margin | JEV tokens |
| --- | --- | --- | --- | --- | --- |
| `CLAUDE-ECON-1` | `minimal` | `hold` | routine | not recorded | 1,335 / 463 |
| `CLAUDE-ECON-2` | `minimal` | `hold` | routine 0.88 / 0.82 | minimal 0.46 / 0.10 | 1,335 / 463 |
| `CLAUDE-ECON-3` | `low` | `shadow` | routine 0.87 / 0.82 | low 0.89 / 0.84 | 1,335 / 460 |
| `CLAUDE-ECON-4` | `low` | `shadow` | routine 0.88 / 0.82 | low 0.88 / 0.82 | 1,335 / 463 |
| `CLAUDE-ECON-5` | `low` | `shadow` | routine 0.87 / 0.80 | low 0.90 / 0.84 | 1,335 / 460 |

The holds came from a weak `minimal` effort signal. Policy v6 checks effort confidence before applying floors, so the gate was not bypassed. With explicit user approval, the effort floor was raised to `low`, the effort the routed arm would actually run. Thresholds and policy code were unchanged. Aggregate JEV usage was **6,675 input / 2,309 output tokens**; only the three approved requests (4,005 / 1,383) fed task arms. No source, diff, prompt, transcript, raw output, credential, secret, or repository content was sent.

**Setup.** Claude Code `2.1.282`, `apiKeySource: none`. Every arm started from the committed fixture tree `a1c703c19d838e4f21e492407dfd5829998a348d` in a fresh disposable Git repository, and `python3 check_health.py` failed in every fresh copy. Each non-interactive child received the same task prompt with `--strict-mcp-config` (no MCP), no FeatureKit plugin, no session persistence, `FEATUREKIT_JEV_ROUTING=off`, 20 maximum turns, and the same tools (`Read`, `Edit`, `Write`, `Glob`, `Grep`, `python3 check_health.py`, `git status`, `git diff`). Only the model/effort and the routed arm's one-line approved advisory differed.

- Baseline: `claude-opus-5-5` at the host default effort, since the user has no effort override and Claude does not report the effective default.
- Routed: `claude-haiku-4-5-20251001` with `--effort low`.

Runtime model identity comes from Claude's per-run `modelUsage`; runtime effort is not reported and remains `null`. Pair order was baseline/routed, routed/baseline, baseline/routed. The final check was rerun by the coordinator outside each child.

| Pair | Arm | Runtime model | Input (uncached + cache-read + cache-write) | Output (thinking) | Turns | Elapsed | Reported cost | Acceptance | Files |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | baseline | `claude-opus-5-5` | 87,068 (8 + 76,306 + 10,754) | 1,003 (0) | 6 | 13.9 s | $0.1214 | pass | `server.py` |
| 1 | routed | `claude-haiku-4-5-20251001` | 143,037 (50 + 132,812 + 10,175) | 1,568 (508) | 7 | 20.4 s | $0.0415 | pass | `server.py` |
| 2 | routed | `claude-haiku-4-5-20251001` | 120,446 (42 + 110,352 + 10,052) | 1,547 (568) | 6 | 20.9 s | $0.0389 | pass | `server.py` |
| 2 | baseline | `claude-opus-5-5` | 86,266 (8 + 75,783 + 10,475) | 941 (0) | 5 | 14.6 s | $0.1178 | pass | `server.py` |
| 3 | baseline | `claude-opus-5-5` | 86,272 (8 + 75,785 + 10,479) | 917 (0) | 5 | 15.1 s | $0.1174 | pass | `server.py` |
| 3 | routed | `claude-haiku-4-5-20251001` | 95,468 (34 + 85,751 + 9,683) | 1,205 (462) | 5 | 15.9 s | $0.0340 | pass | `server.py` |

Retries and escalations were zero in every arm, and every diff passed `git diff --check`.

- **Pair 1:** final files byte-identical.
- **Pair 2:** files differ only in import order.
- **Pair 3:** the baseline serializes with `json.dumps`, while the routed arm writes the literal compact body; both satisfy the parsed-JSON acceptance check.
- **Behavior probe:** the pair 2 routed server returned 404 for `/missing`, `/health/`, and `/health?x=1`, matching the baseline handler logic.

**Economics.**

- **Frontier usage:** the routed arms used zero Opus tokens. Retry-adjusted frontier-model input reduction per pair was 87,068, 86,266, and 86,272 tokens (median **86,272**), plus 1,003, 941, and 917 frontier output tokens.
- **Cheaper-model usage:** the routed arms used more total input tokens on the cheaper model (95k–143k versus about 86k), mostly cache reads.
- **Cost:** Claude-reported cost fell from $0.3566 to $0.1144 across the three pairs (−67.9%; median per-pair reduction $0.0799). This is an API-equivalent estimate; with subscription authentication it is not an invoice.
- **Time:** the routed arms were slower in two of three pairs.
- **JEV usage** is reported separately above and is not counted as frontier usage.

**Confounds and limits.**

- There was one task family and one fixture.
- Baseline effort was the unreported host default.
- The approved request was changed from a `minimal` to a `low` effort floor after two holds; the holds are part of the evidence.
- Runtime effort is `null`.
- No automatic routing path exists yet.

Promotion evidence for this manual class is met: three equivalent passing pairs, zero unsafe downgrades, no unresolved material tool confound, and positive median frontier reduction. Narrow enforcement for the routine implementation class is economically justified on both Codex and Claude. The remaining production step is a separately approved, reversible, family-specific enforcement path followed by an end-to-end enforced trial in each host.
