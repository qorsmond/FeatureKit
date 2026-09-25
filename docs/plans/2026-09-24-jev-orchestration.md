# JEV max-savings architecture for FeatureKit

Status: approved. Slices 0–3, the Slice 5 exact-receipt kernel, the Slice 6 shadow review-tier selector, the Slice 7 deterministic pruner/escalation projection, the local Slice 8 host adapters, and the Slice 10 release/docs rollout are implemented and deterministically verified for v0.7.0. Slice 9's live synthetic screen found no promotable experiment, so it added no production cache or compressor. One explicitly authorized pinned upstream source-review call is recorded. Trusted Codex post-compaction capsule restoration is live-verified. Slice 4 enforcement shipped in 0.8.0 with amendments 1–2 (every level, harness-chosen models, richer metadata), Slice 5 exact reuse is complete, and Slice 6 tiered review shipped in 0.9.0 without source sharing (docs-only small diffs skip model review; small code gets the cheapest review; validated 3/3 on a seeded-defect benchmark). Slice 7 shipped in 0.10.0: failure packets for escalation (paired trial: −35% Opus input, 1 read against 5) and a measured reduction fallback for deterministic pruning; JEV pruning stays unbuilt. Slice 8 shipped in 0.10.1: a measured lean Codex worker profile (−57% input); Claude lean flags were cost-neutral; the Claude compaction pilot stays off and untouched. JEV pruning and Claude transcript compaction still require live trials. Metadata routing approval does not authorize source/transcript sharing or dependency installation.

Baseline inspected: FeatureKit `0.6.2` at commit `36d2cfe`. The only working-tree addition during this analysis is this plan.

## Executive decision

The earlier plan was directionally correct but too narrow. A single JEV routing helper would reduce some worker cost, yet it would leave the largest structural waste intact: a premium primary has already loaded substantial workflow instructions, natural-language state is copied between phases, repository facts are rediscovered, and review/context decisions are repeatedly made in prose.

The recommended end state has four cooperating layers:

1. **A thin phase-specific skill surface.** Keep only immutable gates and the current phase contract visible. Load backend, review, security, compaction, and handoff mechanics only when required.
2. **A local FeatureKit task capsule.** Store approved scope, compact state, evidence references, attempts, route decisions, and invalidation hashes outside the conversation. Give each agent a projection rather than replaying the transcript.
3. **A bounded optimization kernel.** One internal, host-neutral Node entry point performs deterministic policy, exact-cache lookup, batched JEV decisions, response validation, projections, and usage records. It is not a user-facing FeatureKit CLI, daemon, workflow engine, or model proxy.
4. **Host adapters.** Codex and Claude Code share policy and contracts but use their own subagent, tool-loading, prompt-cache, usage, and compaction capabilities. Claude may additionally use `fast-jev-compaction`; Codex keeps native compaction until its hooks can replace messages safely.

This retains the best decisions from the baseline: deterministic rules before JEV, confidence and probability-margin gates, risk floors, shadow rollout, scoped data permissions, primary ownership, fail-open behavior, and independent measurement. It changes the priority order: context surface, durable state, routing plus effort, and review replacement are first-class parts of the JEV project rather than later extras.

Do not add a general proxy around every model or tool step, vendor `jev-kit`, or make JEV an approval authority. Those approaches add another orchestrator and increase the blast radius without evidence of additional savings.

---

## A. Current token and workflow map

### Measured FeatureKit-controlled context

These are exact character/word counts from the repository, not provider token counts. `characters / 4` is shown only as a rough comparison proxy; CI should use characters as the stable cross-provider budget and collect real host tokens in live trials.

| Surface | Characters | Words | Approx. char/4 | Loading consequence |
| --- | ---: | ---: | ---: | --- |
| All 30 `SKILL.md` files | 128,856 | 18,353 | 32,214 | Not all load at once, but this is the duplication pool. |
| All skill descriptions | 8,011 | 1,124 | 2,003 | Claude loads discoverable descriptions on each request; exact Codex treatment must be measured. |
| Model-invocable descriptions only | 4,862 | — | 1,216 | The minimum metadata surface controlled by current invocation flags. |
| Setup-written target-repo instruction block | 2,920 | 395 | 730 | Loaded with target-repo agent instructions on every applicable request. |
| FeatureKit authoring repo `AGENTS.md` | 9,209 | 1,297 | 2,302 | Relevant while developing FeatureKit; it is not the target-repo installed block. |
| `using-featurekit` | 9,296 | 1,360 | 2,324 | Loaded at session start and again after compaction. |
| `orchestrate-work` | 13,936 | 1,961 | 3,484 | Loaded before or while routing; currently contains routing, dispatch, feedback, recovery, ledger, and review policy. |
| `orchestrate-work/references/backends.md` | 7,651 | — | 1,913 | Correctly lazy today, but large when loaded. |
| `grilling` + `grill-with-docs` | 16,169 | 2,441 | 4,042 | Duplicates question gate, tree, approval, and destination behavior. |
| `implement` + `validate-feature` | 10,955 | 1,576 | 2,739 | Repeats orchestration, evidence, context, and completion rules. |
| `review-change` + `handoff` | 7,569 | 1,079 | 1,892 | Repeats evidence, state, routing, and context-transfer rules. |

Representative accumulated FeatureKit skill bodies, excluding repo instructions, task history, source, tool schemas, and tool results:

| Path | Skill bodies potentially accumulated | Characters | Approx. char/4 |
| --- | --- | ---: | ---: |
| Bootstrap | `using-featurekit` | 9,296 | 2,324 |
| Interview | bootstrap, grilling, docs interview, orchestration, secure design, validation | 47,574 | 11,894 |
| Implementation | bootstrap, implement, orchestration, validation, secure code, TDD | 39,162 | 9,790 |
| Review | review, orchestration, validation, test verification, secure code, security review | 31,790 | 7,948 |
| Handoff | handoff and orchestration | 18,719 | 4,680 |

These bundle counts are upper-bound proxies, not proof that every host injects every body on every API call. They show how much FeatureKit-authored material can accumulate in a normal task before repository content and history are counted.

### Current workflow amplification

```text
repo instructions + skill descriptions
                  |
                  v
9.3 KB bootstrap -> interview/plan -> 13.9 KB orchestration decision
                  |                         |
                  |                         +--> repeated model/backend discovery
                  v
approved prose artifact -> copied worker packet -> worker rediscovers repo facts
                  |                                |
                  |                                v
                  +------------------------ worker prose report
                                                   |
                                                   v
                                      copied reviewer packet
                                                   |
                                                   v
                                   copied ledger / handoff / final summary
```

The major spend and amplification points are:

1. **Routing happens after a large primary prefix.** Choosing a cheaper worker does not recover the premium tokens already spent on bootstrap, orchestration policy, repo instructions, descriptions, and tool definitions.
2. **One invariant is stated in several places.** Approval, primary ownership, evidence, security, retry, destination, and completion rules recur across bootstrap, interview, implementation, orchestration, validation, review, handoff, and docs.
3. **Natural-language state is recopied.** Ledgers and packets are compact relative to a transcript, but each phase regenerates and reinterprets them. Evidence and source snippets can travel primary -> worker -> reviewer -> handoff -> primary.
4. **Discovery receipts are not durable.** The skills say to reuse facts, but there is no machine-readable identity, hash, or invalidation record. The current Repowise index being 22 days and several commits behind the live head is a concrete example of why cached repo knowledge needs a freshness gate.
5. **Model capability and reasoning are conflated in prose.** `orchestrate-work` asks the primary to discover routes and select a model/effort, but has only a three-level capability policy and no separately calibrated effort decision.
6. **Review selection is still a frontier judgment.** The current policy says review selectively, yet a general model still decides whether a general model is needed. Adding JEV before every review would make this worse unless it replaces the premium review.
7. **Output is larger than its consumers need.** Worker and implementation templates request several prose sections, routing emits many transitions, and reviewers can return essays where status, findings, evidence references, and gaps would suffice.
8. **Host-native savings are only partially exploited.** Claude can defer MCP schemas, isolate subagent context, omit `CLAUDE.md` in suitable custom workers, export per-request telemetry, and control effort. OpenAI supports deferred tool loading, prompt-cache diagnostics, explicit model/effort subagents, and native compaction, but FeatureKit currently has no measured host-specific profile.

### Hard boundary

FeatureKit cannot change the model already running the first turn in Codex or Claude Code. The practical response is to make the first-turn FeatureKit surface tiny, avoid primary analysis that a deterministic rule or JEV can perform, and move substantive work to an explicitly routed worker. A pre-session model selector would require replacing the host entry path and is not part of this proposal.

---

## B. Ranked maximum-savings opportunities

Ranges below are hypotheses for complete successful tasks, not promises. They overlap and must not be added. “Conservative” assumes mixed normal tasks; “optimistic” assumes the optimization is exercised by long, multi-stage, or routine-heavy tasks. Baselines and paired trials in section I decide what ships.

| Rank | Optimization | Conservative complete-task effect | Optimistic eligible-task effect | Frontier/reasoning effect | Complexity | Quality risk |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Phase-thin skills and smaller installed instruction block | 5–15% fewer total input tokens | 20–35%; 55–75% less FeatureKit-controlled phase context | Directly reduces premium primary input and distraction on every applicable turn | Medium | Low if behavior trials protect gates |
| 2 | Batched JEV capability + effort + context + provisional-review routing | 10–30% fewer frontier tokens across a mixed workload | 40–70% fewer frontier tokens on routine/standard-heavy workloads | Removes premium classification/reasoning and downshifts worker capability/effort | Medium | Medium; controlled by floors, confidence, margin, shadow labels |
| 3 | Structured task capsule and agent-specific projections | 5–20% fewer total tokens | 25–50% on long/multi-agent work | Prevents transcript replay and duplicate reasoning; strongest on escalations/handoffs | Medium-high | Low-medium; schema and freshness bugs must fail open |
| 4 | Exact repository-intelligence reuse and retrieval receipts | 0–10% on first tasks; 5–20% in normal repeated work | 20–45% when the same repo/area is revisited unchanged | Can eliminate whole discovery calls, including premium ones | Medium | Medium if invalidation is weak; low with content/tree hashes |
| 5 | Tiered review that lets JEV/cheap review replace premium review | 5–15% on ordinary implementation tasks | 15–30% on review-heavy workflows | Removes one fresh premium review and its reasoning on cleared ordinary diffs | Medium | Medium; never applies to high-risk/security floors |
| 6 | Explicit output and effort budgets with compact result contracts | 5–15% fewer output/reasoning tokens | 15–30% on chatty workers/reviewers | Cuts billed output/reasoning and primary re-reading | Low-medium | Low if evidence remains addressable |
| 7 | Fresh isolated workers with pointer packets and no inherited history | 5–15% on delegated tasks | 20–40% when parent history is long | Avoids duplicating premium planning history into workers | Low | Low |
| 8 | Tool-schema deferral and task-specific tool subsets | 0–5% where catalogues are already deferred | 15–30% input reduction with large MCP/tool catalogues | Reduces every model call in the affected host | Low-medium | Low; unavailable-tool routing must be explicit |
| 9 | Portable pruning plus native/Claude compaction | Near zero on short tasks; 5–10% overall | 20–50% of later-turn input on long tasks | Prevents accumulated tool/history context from repeatedly hitting premium models | Medium | Medium; pinned constraints and recoverability are mandatory |
| 10 | Exact caches for JEV, review metadata, projections, and immutable retrieval | Near zero on unique first runs | 5–25% on repeated/continued tasks | Eliminates calls rather than discounting them | Medium | Low-medium with strict keys |
| 11 | Provider prompt caching and stable prefixes | No logical token reduction; variable cost/latency reduction | Cached input can be billed at a small fraction of base price where the host exposes it | Reduces spend/rate-limit pressure, not model work | Low | Low; cache-write cost and invalidation must be measured |
| 12 | JEV pruning/relevance for large evidence sets | 0–5% in ordinary work | 15–35% in large handoffs, retrieval sets, or escalation packets | Replaces general-model context selection and shrinks the next premium call | Medium | Medium; verbatim pinned state and conservative fallback required |
| 13 | Semantic cache | Zero until proven | Potentially one discovery/analysis call per safe hit | High upside only in repetitive repositories | High | High; similarity is not correctness |
| 14 | LLMLingua/LongLLMLingua compression | Zero in the production path until benchmarked | 2–4x compression of selected recoverable prose; likely 0–10% whole-task initially | Could shrink long low-risk context before premium calls | High | High for code/invariants; experimental only |

The largest early cumulative win is not “JEV everywhere.” It is: shrink the premium prefix, make one small batched JEV route decision, pass a tiny state projection to an isolated worker, and avoid a premium review when deterministic proof plus a calibrated JEV review clears an ordinary change.

---

## C. JEV architecture

### C1. Optimization kernel

Replace the baseline’s single-purpose helper with a still-bounded **FeatureKit optimization kernel** under `orchestrate-work/scripts/`.

It should:

- read versioned JSON from stdin and emit versioned JSON only;
- evaluate deterministic gates before deciding whether a JEV call is useful;
- batch related JEV `choice`, `noul`, and `score` questions into one request;
- validate every answer, probability, confidence, and range;
- apply risk floors and per-dimension downgrade thresholds in code;
- produce compact task-state projections;
- perform exact cache lookup/write with strong invalidation keys;
- record content-free usage/latency/outcome metrics;
- read the API key only from the environment and never log it;
- fail open to the current adequate FeatureKit path.

It should not:

- plan, edit, run a workflow loop, spawn agents, approve work, or decide permissions;
- sit in front of every tool/model call;
- expose provider model IDs to JEV;
- persist prompts, source, raw diffs, transcripts, or secrets by default;
- become a public FeatureKit command or required daemon.

Use the existing shell/tool surface only where the host can reach TypeSafe without weakening its sandbox. The Codex 0.150.1 paired trial returned `ENOTFOUND` from the workspace sandbox and spent 2.30x baseline input after the agent inspected the helper source, so agent-driven schema discovery is prohibited and this shell path is not promotable for that host. A dependency-free host-side MCP server now exposes one metadata-only `route` tool for Codex and Claude Code; it reuses the optimizer policy and keeps its schema out of recurring context until the tool is selected. Keep it in `off` or `shadow` until paired complete-task economics beat the baseline. Continue using the upstream `jev-review` MCP for separately authorized source-aware review rather than duplicating it.

### C2. Batched route contract

The request stays metadata-only and bounded. Values such as objective and acceptance summary have byte limits; file bodies, diffs, raw output, and transcript text are rejected.

```json
{
  "schema": 1,
  "mode": "route",
  "task": {
    "id": "T1",
    "operation": "implement",
    "objective": "bounded outcome",
    "approval": "approved-write",
    "scope": ["src/session", "tests/session"],
    "acceptance": ["A1", "A2"]
  },
  "facts": {
    "files_estimate": 4,
    "cross_boundary": false,
    "unknown_root_cause": false,
    "current_failure": false,
    "attempts": 0
  },
  "policy": {
    "capability_floor": "routine",
    "effort_floor": "minimal",
    "risk_flags": [],
    "available_capabilities": ["routine", "standard", "deep"]
  }
}
```

One JEV request asks related questions:

- `task_family`: lookup, mechanical edit, scoped implementation, debugging, architecture, review, unclear;
- `required_capability`: routine, standard, deep, unclear;
- `required_effort`: minimal, low, medium, high, extra-high, unclear;
- `execution_shape`: direct deterministic, current primary, isolated worker, specialist, unclear;
- `context_breadth`: pointers only, targeted retrieval, broad discovery, unclear;
- pending user/product decisions are a deterministic input flag and skip JEV;
- `high_consequence_if_wrong`: noul;
- fixed `need_<reference>` nouls for non-governing lazy references;
- `provisional_review_tier`: deterministic, JEV source review, general review, deep/security review, unclear.

The kernel, not the LLM, reconciles them:

- deterministic direct actions skip JEV entirely;
- permissions, approval gates, risk floors, explicit pins, and unavailable routes mask options before/after the call;
- every downgrade-contributing choice must clear its calibrated confidence and top-two probability margin;
- a noul used to reduce capability/context must clear a calibrated distance from ambiguity;
- contradictory answers, `unclear`, missing fields, or an unavailable route produce `hold`, not a guessed downgrade;
- escalation recommendations may be accepted at a lower confidence threshold because they do not reduce protection, but still cannot invent an unavailable model or permission.

```json
{
  "schema": 1,
  "status": "apply",
  "route": {
    "capability": "standard",
    "effort": "low",
    "execution": "isolated-worker",
    "context": "targeted",
    "review_floor": "jev-review"
  },
  "references": ["worker-codex"],
  "gates": {
    "confidence_pass": true,
    "margin_pass": true,
    "risk_floor_applied": false
  },
  "cache": "miss",
  "usage": {"input_tokens": null, "output_tokens": null},
  "reason_codes": ["SHADOW_ONLY", "PARTIAL_ADVISORY"]
}
```

Return reason codes, not a prose essay. The primary reports only the selected route and any material fallback.

### C3. All proposed JEV uses

| Use | Input contract | Output contract | Model work replaced | Expected saving | Safe fallback | Privacy scope |
| --- | --- | --- | --- | --- | --- | --- |
| Batched task routing | Compact approved/read-only metadata, deterministic risk facts, attempt count | Capability, effort, execution shape, context breadth, provisional review, per-answer confidence/margin | Primary classification and worker route reasoning | High across routine/standard work | Current adequate route | Metadata opt-in; no source |
| Reference/skill selection | Current phase plus bounded names/descriptions of optional, non-governing references | `need_reference` nouls or a small choice | Primary reading of backend/review/compaction docs that are irrelevant | Medium input reduction | Load the reference | Metadata opt-in; descriptions only |
| Worker suitability | Route metadata plus available semantic route classes | Direct/current/worker/specialist | General-model decision to delegate | Medium | Current primary or configured default | Metadata opt-in |
| Failure escalation | Original assignment IDs, compact attempt result, failure class, changed-path/evidence refs | Retry, add targeted context, increase effort, increase capability, specialist, stop for user | Premium diagnosis of what kind of resource is missing | Medium-high on retries | Primary diagnoses/escalates | Metadata; no raw logs/source |
| Ambiguous completion assessment | Acceptance IDs, check statuses, changed paths, declared gaps | Supported/unsupported/unclear; review warranted; stronger reasoning warranted | General-model interpretation of a compact but ambiguous claim | Medium; call only when evidence is not deterministic | Primary evaluates evidence | Metadata; no source |
| Review gate | Risk facts, diff size/classes, deterministic check statuses, source-sharing permission | Review tier | Premium decision about whether premium review is needed | Medium | Existing review policy | Metadata opt-in |
| Source-aware quality review | Upstream `jev-review` input: task, focused diff, necessary files, repository context | Per-dimension applicability, score, confidence, weakness, priorities | Ordinary fresh general-model review | High on cleared ordinary diffs | Fresh general/deep review | Separate source-sharing opt-in |
| Packet pruning | Pinned IDs plus candidate entries or bounded summaries | Keep/drop probability per candidate, batched | General-model summarization/context selection | Medium on long packets | Original packet | Context-sharing opt-in if text leaves host |
| Retrieval relevance | Query/acceptance IDs plus cached fact metadata and source/hash refs; candidate text only when authorized | Keep/drop per candidate | Re-reading or general-model selection across old findings | Medium in repeated discovery | Retrieve locally again | Metadata by default; context scope if text sent |
| Escalation-packet pruning | Assignment, pinned constraints, latest failure and prior-attempt candidate entries | Keep/drop for non-pinned entries | Copying whole failed attempt into a stronger model | High on difficult multi-attempt work | Deterministic minimal packet or original bounded packet | Context-sharing opt-in |
| Claude transcript compaction | Upstream `fast-jev-compaction` transcript state with configured exclusions | Keep/drop call/result decisions; verbatim retained messages | General-model summary compaction | High on long Claude sessions | Claude native compaction | Separate transcript-sharing opt-in |
| Semantic-cache equivalence | Normalized request and candidate-cache metadata at identical repo/policy state | Equivalent/not equivalent/unclear | Potential repeated analysis call | Experimental high upside | Cache miss | Metadata or source scope, depending candidate |

Do not call JEV for deterministic test outcomes, permissions, explicit route pins, known security floors, exact hash equality, or trivial size/format thresholds. One call saved by JEV is useful; one JEV call that merely precedes the same general-model call is not.

### C4. Data, credentials, and failure policy

Use separate enablement flags for `routing`, `source_review`, `context_pruning`, and `transcript_compaction`. Enabling metadata routing does not authorize source or transcript disclosure.

TypeSafe currently prices Jev input far below general frontier models and does not meter output on its published pricing page, but FeatureKit must record actual reported usage and base rollout decisions on its own complete-task results rather than vendor comparisons. The reviewed implementations use the TypeSafe System One endpoint and `jev-latest`; pin the question schema and reviewed integration revision even if the model alias remains service-managed.

Standardize the FeatureKit helper on `TYPESAFE_API_KEY`, accept `JEV_API_KEY` only as an explicit compatibility alias, and never store either in repo config or state. The current upstream `jev-review` expects `JEV_API_KEY`; either configure that alias locally or contribute support for the canonical variable before broad rollout.

On timeout, rate limit, malformed schema, out-of-range probability, request too large, missing key, or policy contradiction, return an `unavailable`/`hold` result quickly and follow the current quality-safe FeatureKit route. Retries are bounded; the optimizer must not turn a provider outage into repeated delays.

---

## D. Capability and reasoning routing

### Portable semantics

Model capability and reasoning effort are independent policy dimensions.

| Dimension | Portable values | Meaning |
| --- | --- | --- |
| Capability | `routine`, `standard`, `deep` | The model’s coding/judgment/context capability required for the task. |
| Effort | `minimal`, `low`, `medium`, `high`, `extra-high` | How much reasoning budget the selected model should spend. |

Host adapters map these semantics to currently advertised models and effort settings. They never persist inferred provider model names as FeatureKit policy. If a host lacks a level, map to the nearest adequate supported level and record requested versus actual settings. Explicit user/repo pins and data/provider restrictions remain authoritative.

Current Codex subagent controls expose an explicit model plus several effort levels; current Claude Code subagents expose a model and effort, with supported values dependent on the selected model. These catalogues change, so adapters discover once per session/configuration hash and re-discover after a route failure or configuration change.

### Starting matrix

| Work shape | Capability start | Effort start | Rationale |
| --- | --- | --- | --- |
| Deterministic command or exact lookup | No worker / routine | Minimal | A tool should do the work when possible. |
| Narrow factual repository search | Routine | Minimal/low | Retrieval dominates reasoning. |
| Mechanical edit with exact acceptance | Routine | Low | Verification catches mistakes cheaply. |
| Normal bounded implementation | Standard | Low/medium | Adequate coding capability without default high reasoning. |
| Large-context but mechanical migration | Standard or deep | Low | Context handling may require a stronger model; reasoning does not. |
| Narrow algorithmic or type-system problem | Standard | High | Reasoning matters more than broad contextual capability. |
| Unknown-root-cause debugging | Standard, escalating to deep | High | Start adequate, then raise capability with preserved diagnostics. |
| Architecture, conflicting evidence, irreversible migration | Deep | High/extra-high | Judgment and consequence justify both floors. |
| Security-sensitive authorization/tenant boundary | Deep | High plus mandatory security review | No JEV downgrade below policy floor. |
| Fresh ordinary review after weak JEV signal | Standard | Medium/high | Independent diagnosis is needed, not necessarily the strongest model. |

### Cheap-first economics

Cheap-first is permitted only for task families whose observed economics satisfy:

```text
cheap attempt cost
+ probability of failure × (diagnosis + escalation + stronger retry cost)
< direct adequate stronger-route cost
```

Track this by task family and route class. Do not let the system mutate its own thresholds or model mappings. A human-reviewed policy update follows measured results. Families with repeated cheap-route failures move directly to the stronger route.

Reasoning downgrades and capability downgrades are gated independently. A strong model at low effort may be the best route for large-context mechanical work; a standard model at high effort may be best for a narrow difficult problem. No policy should collapse these into a single `routine -> cheap`, `deep -> maximum` ladder.

---

## E. Context architecture

### E1. Task capsule

Create one local, versioned task capsule in the target repo’s configured scratch/work area, defaulting to `.scratch/featurekit/<task-id>/`. Keep approved PRDs/plans/slices in their existing durable locations; the capsule references them rather than copying them.

The compact state contains:

```text
identity: task id, FeatureKit/policy/schema versions
snapshot: repo identity, HEAD, dirty-tree digest, artifact hashes
authority: read-only/approved-write, approved artifact, scope, exclusions
requirements: objective, acceptance IDs, governing constraint/ADR refs
risk: deterministic flags and capability/review floors
route: semantic capability, effort, execution, context, requested/actual host route
work: job IDs, owners, status, bounded attempts, changed-path refs
failures: current unresolved failures and diagnostic refs
evidence: command/runtime/manual evidence refs and validity hashes
review: tier, diff hash, result, open findings
decisions: short durable decisions with source and invalidation refs
```

State values stay short. Source, diffs, logs, test artifacts, ADRs, and plans remain in files and are addressed by path, symbol, line, commit/tree hash, and content hash. The primary owns capsule updates. Workers write bounded result files; the primary validates and imports them. Use atomic local writes and a schema version; on corruption or unsupported versions, rebuild from durable artifacts rather than guessing.

### E2. Projections

| Consumer | Pinned verbatim | Lazy/on demand | Excluded by default |
| --- | --- | --- | --- |
| Primary | Authority, objective, open acceptance, risks, active failures, route/evidence status | Relevant ADR/security/verification docs and current evidence | Old source reads, successful logs, worker prose |
| Worker | Exact objective, owned scope, applicable acceptance, governing constraints, current failure, proof expected | Source via path/symbol; selected backend/discipline reference | Parent transcript, unrelated decisions, prior rationale, whole repo map |
| Reviewer | Requirements, stable diff ref, actual checks/results, risk floor | Necessary surrounding source and ADR/security docs | Implementer rationale, route history, discarded attempts |
| Handoff | Approved artifact ref, current state, changed paths, open failures, evidence/gaps, next action | Detailed logs/source from refs | Transcript, duplicated diff/source, superseded findings |

Workers should receive a pointer to a generated projection when they share the filesystem, not the projection copied into the spawn prompt. The worker reads it once and retrieves source itself. When a destination cannot access the file, inline that one projection—never both pointer and duplicate text.

### E3. Pinned, prunable, and recoverable context

**Pinned verbatim:** approval/authority, scope, acceptance, user constraints, security/ADR constraints, current unresolved failure, current repo snapshot, latest material evidence, and active ownership.

**Deterministically prunable:** duplicate file reads, superseded findings, successful repeated output, old progress narration, source already addressable by path/hash, stale evidence invalidated by a new tree, and completed worker lifecycle chatter.

**JEV-prunable when ambiguous:** older diagnostic hypotheses, long tool evidence whose relevance is unclear, non-governing retrieved docs, and prior-attempt details before escalation.

**Recoverable on demand:** source, immutable commits, previous result files, full logs, old review reports, repository maps, and external documentation.

Keep tool action/result pairs interpretable. An error without the command or a conclusion without its evidence identity is not a useful saving.

### E4. Compaction by surface

- **Primary conversation:** checkpoint the capsule before host compaction. After compaction, load the tiny bootstrap plus the primary projection, not the old transcript. Codex uses native compaction because current hooks cannot return replacement messages. Claude may use the optional upstream `fast-jev-compaction` function hook when explicitly enabled.
- **Workers:** start fresh and isolated. Codex uses a self-contained packet/no history fork where supported. Claude uses isolated subagents; a custom self-contained worker may omit `CLAUDE.md` only if its projection carries every governing rule it needs.
- **Reviewer:** always fresh context against a stable diff and current evidence.
- **Handoff:** generate from capsule state and durable artifacts, not conversation summarization.
- **Tool output:** use RTK/quiet modes and deterministic truncation first. Store the full artifact locally when needed and pass a path plus the relevant excerpt.

### E5. Escalation packet

An escalation never forwards the entire failed conversation. It contains:

1. original bounded assignment and acceptance IDs;
2. applicable governing constraints;
3. resulting changed paths/diff reference;
4. exact failed check and compact diagnostic excerpt;
5. approaches ruled out, one line each, with evidence refs;
6. unresolved question;
7. requested higher capability/effort and why.

Deterministic policy pins items 1–4 and 6. JEV may prune only older optional diagnostics. The stronger model retrieves the source it needs.

### E6. Compression policy

Use this order:

1. eliminate duplication;
2. replace copied content with stable pointers;
3. retrieve only relevant source/symbols;
4. use compact tool modes and deterministic truncation;
5. prune whole entries while keeping retained text verbatim;
6. use provider-native compaction;
7. only then test lossy/model-aware compression.

Never lossily compress approval, scope, acceptance, security/ADR constraints, source code under review, a diff, exact failure output required for diagnosis, or current proof. LLMLingua-style compression is confined to recoverable documentation, old exploration, verbose logs, and long handoffs until coding-task benchmarks prove otherwise.

---

## F. Reuse and caching architecture

### F1. Reuse existing intelligence before building another index

FeatureKit already directs agents to Repowise for repo documentation/overview and Serena for symbol navigation. Reuse those systems rather than building a new repository summarizer. The optimizer adds **receipts and freshness**, not another code index.

A repository fact receipt records:

```text
fact id and concise value
source path/symbol/line or tool result ref
repo and commit/tree/dirty digest
relevant file content hashes
retrieval tool and contract version
query hash
created/last-validated time
```

If Repowise’s indexed commit differs from live HEAD—as it did during this analysis—the result is a candidate, not current proof. Refresh it or validate the cited live paths. Serena/source facts are reusable only while their relevant file hashes remain unchanged.

### F2. Exact caches

| Artifact | Key | Reuse rule |
| --- | --- | --- |
| JEV route | Normalized route request + question/policy version + route catalogue hash + JEV model | Safe exact reuse while all inputs match |
| JEV escalation/completion | Assignment snapshot + result/failure digest + policy/question version | Safe exact reuse for identical immutable result |
| Task projection | Capsule revision + projection type + projection schema | Regenerate locally on change; no model call |
| Retrieval receipt | Repo snapshot + query + tool/contract version + relevant source hashes | Reuse while sources and index freshness match |
| JEV review | Diff hash + task/criteria hash + supplied-context hashes + review schema/model | Reuse only for that exact diff/context |
| Verification output | Command + repo/dirty digest + environment/dependency fingerprint | May avoid an expensive repeat only when every input matches; otherwise rerun |
| Host catalogue | Host/version/config hash | Reuse for the session; refresh on failure/config change |

Store only local state and content-addressed artifacts under the task scratch area or a configured FeatureKit cache. Use restrictive permissions where the platform supports them. Never cache secrets. Source-sensitive cache entries follow the repo’s retention policy and are removable independently.

### F3. Invalidation

Every cache key that influences behavior includes the FeatureKit version, policy version, schema/question version, and relevant repo state. A dirty-tree digest is required because commit SHA alone does not identify the code under review. Evidence additionally includes runtime/environment/dependency identity where material.

Invalidation is conservative:

- changed relevant file -> invalidate its facts, review, and affected evidence;
- changed acceptance/plan/ADR/security rule -> invalidate route, projections, review, and completion assessment;
- changed model catalogue or host capability -> invalidate route mapping, not the semantic JEV result;
- changed question/policy thresholds -> invalidate derived JEV decisions;
- changed diff -> invalidate review;
- unknown freshness -> miss, never “probably current.”

### F4. Provider prompt caches are separate

Prompt caching reduces realized cost and latency but does not eliminate logical input. Keep stable material first and dynamic task material last: host/system instructions, stable FeatureKit invariant, stable tool definitions, then repo policy, capsule projection, retrieved content, and the current request.

Do not rewrite timestamps, route tables, or state into the stable prefix. Avoid changing tool inventories and effort settings mid-session merely for cosmetic reasons because those changes can invalidate provider caches. Record cache-read, cache-write, and uncached input separately from FeatureKit cache hits.

OpenAI and Anthropic both document discounted cache reads and higher-priced writes; the exact benefit depends on host/model and whether the subscription exposes that accounting. FeatureKit should shape a cacheable prefix but must not claim API pricing savings for a hosted Codex/Claude subscription without observed usage data.

### F5. Semantic cache

Semantic cache is an experiment, not a production shortcut. A candidate hit must share repo identity, exact commit/tree/dirty state, FeatureKit/policy version, task phase, security scope, and data permission. Use it only for recoverable read-only facts at first. Never reuse approval, route floors, verification, completion, security review, or code review solely because text is similar.

---

## G. Review architecture

Review is a replacement ladder, not an additive checklist.

```text
current deterministic verification
              |
              v
       deterministic risk floor
        /        |          \
 trivial      ordinary     high-risk/security
    |             |              |
no model     metadata gate       mandatory deep/security review
review       (only if needed)
                  |
             source sharing allowed?
               /       \
              no       yes
              |         |
       cheap general   JEV review
          review       /       \
                    clear     weak/uncertain
                      |             |
                    done      fresh general review
```

### Review tiers

| Tier | When | What runs | What it replaces |
| --- | --- | --- | --- |
| 0: Deterministic | Trivial/mechanical, narrow scope, checks prove acceptance, no policy review floor | Diff/scope checks plus tests/lint/type/runtime as applicable | All model review |
| 1: Metadata gate | Review need is ambiguous and source sharing is off/unnecessary | One batched JEV assessment | Premium decision about whether review is needed |
| 2: JEV source review | Ordinary stable nontrivial diff, checks pass, source sharing enabled | Focused upstream `jev-review` call | Normal fresh general-model review when calibrated signals clear |
| 3: General independent | JEV weak/uncertain/inapplicable, source sharing off, or diagnosis needed | Fresh adequate general model at routed effort | Frontier review unless the task truly requires it |
| 4: Deep/security | Authz, tenant isolation, secrets, destructive/irreversible, high-consequence, conflicting evidence, explicit policy | Existing deep/security workflow | Nothing; this is a mandatory floor |

A JEV-clear result can close ordinary review only when:

- all required deterministic checks and runtime evidence are current;
- no hard risk floor applies;
- JEV received enough focused context;
- calibrated applicable dimensions meet their score/confidence thresholds;
- no high-severity weakness or requirements/correctness/test/reliability concern is signaled;
- the primary confirms scope and evidence identity.

The current upstream `jev-review` evaluates 19 dimensions with applicability, score, and weakness questions. Start by pinning and measuring it unchanged. If JEV tokens or irrelevant dimensions are material, test a focused profile rather than immediately forking: correctness/requirements, test quality, reliability, security when relevant, and maintainability dimensions selected deterministically. Contribute a metric-selection option upstream if the experiment wins.

When JEV is weak, the independent reviewer receives requirements, stable diff, actual evidence, and the failing dimensions—not the implementer’s rationale or the full history. A JEV score never diagnoses the fix or approves the change. Allow at most one score-driven recheck after a targeted correction; do not create an automatic score-chasing loop.

---

## H. Host-specific optimization

### Shared portable layer

Both hosts use the same task capsule, schemas, semantic capability/effort levels, deterministic floors, JEV questions, confidence policy, exact-cache keys, projection formats, privacy scopes, and quality gates. Host adapters only map execution and telemetry.

### Codex

- Keep the installed `AGENTS.md` FeatureKit block small and move phase mechanics to skill references.
- For subagents, pass explicit model and supported effort and use fresh context/no history fork when the host exposes that choice. OpenAI notes that subagents consume more tokens than comparable single-agent work, so dispatch only when isolation, cheaper capability, or parallelism produces a complete-task win.
- Use native compaction and checkpoint the capsule before/after compaction. Current `PreCompact`/`PostCompact` hooks can observe or stop but cannot safely replace the message list; do not rewrite Codex transcripts.
- OpenAI’s Responses API supports deferred tool loading through tool search and recommends small namespaces. Whether the Codex app exposes that control is host-owned; measure the live tool surface instead of assuming API configuration applies to the desktop app.
- Preserve exact stable prefixes to benefit from automatic prompt caching. Use API cache diagnostics only where the host exposes them.
- Codex desktop currently exposes account usage limits more readily than per-task token waterfalls. Prefer per-run CLI/app/Agents API events when present; otherwise record unknown rather than attributing account usage to one worker.
- A hook may checkpoint state or record content-free metrics outside the conversation, but routing cannot rely on a hook capability that is not supported by both current Codex versions and tests.

### Claude Code

- `CLAUDE.md` content is included at session start and skill descriptions remain a recurring context cost; shorten the imported FeatureKit block and descriptions. Full skill bodies load on invocation, so progressive disclosure has direct value.
- MCP server/tool names load at startup while full schemas are deferred on demand by default. Verify with `/mcp` and `/context all`; use `ENABLE_TOOL_SEARCH=auto` or an appropriate threshold when local configuration has disabled useful deferral.
- Use isolated subagents with explicit `model`, `effort`, `maxTurns`, minimal tools/MCP, and compact output. A self-contained custom worker can use `omitClaudeMd` only when its projection includes the governing rules needed for the assignment. Avoid preloading broad skill sets because preloaded skill bodies consume worker context.
- Use `TASK_MAX_OUTPUT_LENGTH`, `MAX_MCP_OUTPUT_TOKENS`, and bounded structured-output retries when live measurements show oversized results or repair loops. Do not lower them blindly below required evidence.
- Claude hooks run outside conversational context unless they return injected output. Use them for capsule checkpoints and content-free metrics where stable. The upstream `fast-jev-compaction` `session.compact` function hook is early access; pin its reviewed revision and keep Claude native compaction as fallback.
- Claude Code can expose session usage/context via `/usage` and `/context all`, and can export token, cost, model, retry, compaction, and subagent events through OpenTelemetry. Keep prompt/tool content logging disabled; the measurement design needs counts and identifiers, not source.
- Preserve stable prefixes for Claude prompt caching. API cache reads are cheaper than writes, but subscription behavior must be observed rather than inferred from API prices.

---

## I. Measurement architecture

### I1. One complete-task trace

Each benchmark run writes a local content-free trace keyed by task/run ID:

```text
identity: scenario, repo snapshot, FeatureKit/policy version, host/version
input: controlled FeatureKit chars/tokens, task brief, retrieved context,
       worker/reviewer packet sizes, tool-schema/context readings when exposed
calls: primary, worker, reviewer and JEV calls; requested/actual model and effort
usage: input, cached input/write, output, reasoning tokens when exposed
workflow: tools, retries, escalations, compactions, cache hits/misses, latency
quality: checks, runtime evidence, findings, final success, human/evaluator verdict
cost: provider-reported realized cost only; otherwise unknown
```

Do not enable prompt, source, tool-content, or raw-response telemetry merely to obtain usage. Claude OTel and OpenAI observability both provide useful usage dimensions without making raw content part of the default trace.

### I2. Baseline and experiment design

Extend `tests/scenarios.md` with the requested families:

- deterministic/simple;
- routine edit;
- normal implementation;
- cross-module change;
- architecture;
- known and unknown-root-cause debugging;
- prior failed attempt;
- incomplete brief;
- long-context/tool-heavy;
- large repository discovery;
- security-sensitive/destructive;
- misleading completion claim;
- large review/handoff;
- repeated task against unchanged and changed repository states.

For each optimization, run paired baseline/variant trials from the same disposable snapshot, rotate execution order, and repeat stochastic tasks. Measure through final verified completion, including retries and fixes. Record simulated host conditions separately from live host/API trials.

### I3. Context regression CI

Add a dependency-free `tests/check_context_budget.py` and a reviewed budget file. It should count exact UTF-8 bytes/characters and words for:

- setup-written invariant block;
- model-invocable descriptions;
- bootstrap core;
- orchestrator core;
- representative interview, implementation, review, worker, escalation, and handoff bundles;
- JEV route request/response fixtures;
- task projections.

CI fails when a hard budget is exceeded or reports a deliberate budget update in the diff. Character budgets are portable and deterministic. Calibrate optional exact OpenAI/Anthropic token snapshots in host trials; do not add tokenizer dependencies merely for CI.

Provisional design targets, to be confirmed by the first refactor:

- setup-written FeatureKit block: from 2,920 to at most 1,200 characters;
- `using-featurekit`: from 9,296 to at most 2,500 characters;
- `orchestrate-work` always-loaded core: from 13,936 to at most 3,500 characters;
- worker projection: at most 4,000 characters before source retrieval for an ordinary slice;
- reviewer projection: at most 5,000 characters before diff/source retrieval;
- route request state: at most 4,000 characters and one request per phase.

These are pressure budgets, not permission to remove quality gates. If a behavior cannot fit, place its detail in an on-demand reference and protect it with a behavioral trial.

### I4. Release gates

An optimization may enforce only when:

- it produces zero false downgrades in the high-risk, security, destructive, ambiguous, prior-failure, and missing-evidence safety corpus;
- final verified task success is equivalent or better in paired trials;
- required evidence, scope, permission, and approval behavior remain intact;
- complete-task frontier tokens/calls or realized cost fall materially in the task families it targets;
- retries and latency do not erase the gain;
- disable/failure mode returns the baseline path.

Track route precision by task family, not one aggregate score. Report conservative/optimistic observed ranges only after enough repeated trials show variance. A high cache percentage, cheap JEV call, or smaller packet is not success unless complete-task metrics improve.

---

## J. Experimental optimizations

| Experiment | Why it might win | Trial | Promotion criterion | Main risk |
| --- | --- | --- | --- | --- |
| LLMLingua / LongLLMLingua / LLMLingua-2 | Published work reports large compression on QA/document benchmarks | Compare uncompressed, deterministic prune, and model-compressed recoverable docs/logs/handoffs on FeatureKit coding tasks | Material complete-task input/cost reduction with identical acceptance, diagnostics, and review outcomes across repetitions | Papers do not establish coding-agent safety; compressed text can be hard to inspect |
| Aggressive JEV entry pruning | Jev can classify many keep/drop decisions in parallel cheaply | Large packet, handoff, and failed-attempt fixtures; vary pin rules and thresholds | At least a meaningful reduction beyond deterministic pruning with no lost needed fact or extra retrieval/retry | False drop amplifies downstream cost |
| JEV reference selection | Avoid loading backend/security/review/host docs when irrelevant | Fixed optional reference catalogue in route batch | Fewer loaded chars/tokens without missed required discipline | JEV must never deselect governing/risk-required references |
| JEV retrieval relevance | Avoid rereading stale or irrelevant cached facts | Candidate receipt summaries, then optional authorized text | Fewer retrieval/model calls with identical fact accuracy | Old summary may hide changed semantics |
| Semantic cache | Eliminate semantically repeated repo analysis | Local embeddings or strict JEV equivalence over read-only fact queries at identical snapshots | High-precision hits that remove calls; every false hit counted as failure | Similar wording is not equivalent intent |
| Focused `jev-review` profile | Current upstream 19-dimension review may ask unnecessary questions | Compare full versus deterministically selected dimensions | Same caught-defect rate and escalation decisions with lower JEV input/latency | Narrow profile can miss cross-cutting issues |
| Prompt-cache shaping | Stable prefix may sharply reduce realized input cost | A/B stable ordering and cache diagnostics without changing logical content | Lower realized cost/rate-limit usage with no extra writes or invalidation churn | API pricing may not map to subscriptions |
| Exact verification reuse | Some expensive unchanged checks are pure enough to reuse | Hermetic fixture with command/environment/repo digest | Saved executions with reproducible identical result and no stale acceptance | Environment identity is often incomplete |

LLMLingua research reports up to 20x compression for selected benchmark prompts and LongLLMLingua reports roughly 4x in long-document settings, but neither establishes safe compression of code review, diffs, or software constraints. Treat these as ceilings for an experiment, not FeatureKit savings forecasts. Deterministic deduplication and RTK-style output reduction are the control and should win unless lossy compression adds clear value.

---

## K. Ordered implementation slices

Each slice is independently measurable and independently disableable. No slice changes production behavior until its artifact is approved under the normal FeatureKit gate.

### Slice 0 — Baseline, fixtures, and context budgets

Add the content budget check, task-trace schema, benchmark matrix, and baseline measurements for current Codex and Claude Code where available. Record unavailable metrics as unknown.

Acceptance:

- deterministic CI reports the measured surfaces in section A;
- complete-task traces separate root, worker, reviewer, JEV, cache, and quality data;
- no prompts/source are recorded by default;
- existing packaging and behavioral tests still pass.

Savings: none directly; this prevents optimizing the wrong component.

### Slice 1 — Thin invariant and phase-specific skill surface

Refactor the setup block, `using-featurekit`, `orchestrate-work`, and duplicated interview/implementation/handoff rules. Create one canonical invariant contract and on-demand references for interview, backend, worker lifecycle, review, host, and compaction mechanics. Shorten descriptions without weakening discovery.

Acceptance:

- provisional budgets in I3 are met or a measured exception is approved;
- existing interview, approval, security, routing-visibility, evidence, and handoff scenarios pass;
- a phase does not load another phase’s procedure without need;
- Codex and Claude install/use smoke tests pass.

Rollback: restore skill bodies; no data migration.

### Slice 2 — Task capsule and deterministic projections

Add the versioned local capsule, atomic state update, snapshot hashes, primary/worker/reviewer/handoff projections, and pointer-based packets. Do not add JEV yet.

Acceptance:

- focused worker and reviewer trials run from projections without transcript replay;
- stale repo/evidence hashes force refresh;
- corrupt/missing state rebuilds or falls back to existing artifacts;
- the primary remains the only state authority;
- packet sizes and repeated reads fall without quality loss.

Rollback: ignore/remove the scratch capsule and use current prose packets.

### Slice 3 — Batched JEV route/effort/context kernel in shadow

Implement the dependency-light optimizer entry point, strict schemas, deterministic gates, exact route cache, one batched JEV request, confidence/margin handling, timeouts, content-free trace, and mocked tests. Shadow outputs never affect execution.

Acceptance:

- direct/deterministic actions and hard floors skip JEV;
- one phase makes at most one routing request;
- route input rejects source, diff, transcript, raw output, unknown fields, and oversize strings;
- missing key/network/malformed answers preserve baseline behavior;
- mocked tests need no key;
- live shadow results are labelled against actual accepted routes/outcomes.

Live shadow requires a locally configured TypeSafe key; implementation and mocked tests do not.

### Slice 4 — Enforced capability + effort routing and compact results

Calibrate per-question thresholds by task family, then enable only approved downgrade classes. Map semantic routes to discovered host models/efforts, add bounded attempts/output, and use compact worker result files.

Acceptance:

- safety corpus has zero false downgrades;
- actual model/effort is recorded when exposed and never fabricated;
- routine/standard families show a complete-task frontier-token/call reduction;
- retry-adjusted economics remain positive;
- `JEV off` or absent key restores baseline routing.

#### Slice 4 amendment — route every level (2026-09-25, user decision)

The first 0.8.0 implementation obeyed JEV only for one class: easy (`routine`) work at `low` effort. It also required each product repo to name models. The user decided that JEV should route every level and that FeatureKit and product repos should not name models. This amendment replaces the one-class gate.

**Behavior in `enforce` mode:**

- **Enforced route.** Any JEV result that approves both capability and effort becomes an enforced route (`routine`, `standard`, or `deep`, plus an effort) for every operation that passes the approval gate. Unapproved work, pending user decisions, hard risks (security, authz, privacy, destructive, irreversible), and deterministic lookups still skip JEV and keep the baseline. A `hold`, `unavailable`, or weak capability/effort signal also keeps the baseline. Routes never go below the request's capability and effort floors.
- **Caution flags are up-only.** `migration`, `ambiguous`, `prior-failure`, and `missing-evidence` routes are marked `up_only`. The harness applies them only when they are at least as strong as the baseline model and effort; otherwise it runs the baseline.
- **The harness picks models.** It maps the level to a model discovered at runtime: `routine` gets the cheapest available tier, `standard` a middle tier, and `deep` the strongest. It also chooses a supported effort. FeatureKit and product repos name no models. `docs/agents/orchestration.md` may still hold an optional user override, but none is required.
- **Effort floor.** Both hosts expose `low` as their lowest effort, so enforcement raises a `minimal` effort floor to `low` before asking JEV.
- **Where it applies: everywhere.** A task launched headless or as a batch worker starts on the routed model. In a live session, the primary hands the work to one worker on the routed model.
- **Records.** The ledger records requested and runtime model/effort. A setting the host cannot pass or report stays `null`.
- **Escalation.** A route that fails verification escalates once to the baseline, and the escalation is counted against that route.
- **Unchanged.** Review still runs; JEV only chooses the model that reviews. Review replacement, JEV pruning, semantic cache, and transcript compaction remain out of scope.

**Evidence status.** Only `routine`/`low` implementation has paired complete-task evidence. The other levels are enforced by user decision without paired economics. This departs from gate I4, and the changelog and validation doc must say so. In-host delegation saved little on a small task in the 0.8.0 trials; that result stays recorded.

**Acceptance:**

- TDD for the policy change.
- Zero enforced routes below the safety-corpus minimums or floors, including against an adversarial always-cheapest JEV mock.
- Flagged tasks are up-only, and hard-risk tasks stay on baseline.
- `off` or an unset value restores the baseline exactly, and the hook off switch still works.
- Metadata-only requests; the key is never printed.
- `optimizer.test.mjs`, context budget, packaging, and `git diff --check` pass.
- The live corpus runs in `enforce`. Live end-to-end trials per host run on `tests/fixtures/service` with harness-chosen models and no repo mapping, plus one `off` trial. Results are recorded as live or simulated.

#### Slice 4 amendment 2 — richer route metadata (2026-09-25, user decision)

**Problem.** In the medium-task benchmark, JEV held on 5 of 6 `enforce` runs because capability confidence sat at 0.48–0.59, around the 0.55 gate. A metadata-only probe of 12 calls on the same task measured capability confidence as follows:

- current request: 0.35–0.39;
- concrete objective and itemized acceptance only: 0.65–0.67;
- five new facts only: 0.64–0.66;
- both: 0.83–0.87.

Effort stayed `low` at 0.81–0.94, and the consequence signal stayed low.

**Change.**

- Add five **optional** `facts` fields to the route request:
  - `existing_check` (bool): the acceptance names an automated check that already exists in the repo;
  - `spec_exact` (bool): the approved plan states exact inputs, outputs, and error behavior;
  - `follows_existing_pattern` (bool): the change mirrors an existing pattern in the repo;
  - `new_dependencies` (bool);
  - `lines_estimate` (integer).
- Omit any field that is not verified from the approved plan or repository. An absent field is never treated as favorable. Unknown fields are still rejected.
- Guidance: write `objective` and `acceptance` as the concrete approved spec (field rules, status codes, file placement) within the existing size limits. They still carry no source, diffs, or transcripts.
- Bump the policy version to 7 so old cache entries are not reused. Confidence and margin thresholds, floors, gates, `up_only`, and escalation are unchanged. Update the MCP schema and the optimizer reference example.

**Safety.** Richer facts can only change JEV's answer; request floors and deterministic gates still bound every route. The safety corpus gains honest facts, plus one family where hard work carries optimistic facts; it must still route no lower than its floors. The live corpus must show zero unsafe routes.

**Acceptance.**

- TDD for the schema and validation, including optional presence, type rejection, and cache-key change.
- `optimizer.test.mjs`, context budget, packaging, and `git diff --check` pass.
- The live corpus in `enforce` shows 0 unsafe routes.
- The paired medium-task benchmark is rerun, three pairs per host, with enriched metadata and recorded against the previous run.

### Slice 5 — Exact repository reuse and cache receipts

Persist freshness-aware Repowise/Serena/source receipts, exact JEV decisions, projections, host catalogue, and diff-bound review metadata. Do not add semantic caching.

Acceptance:

- repeated unchanged repo trials eliminate discovery work;
- one relevant file, dirty-tree, policy, or contract change causes the expected miss;
- stale indexed summaries cannot become current proof;
- cache hit/miss and eliminated calls are visible without storing secrets.

### Slice 6 — Tiered review replacement

Add deterministic review tiering, metadata-only review gate, optional pinned upstream `jev-review`, calibrated ordinary-diff clearance, and routed general/deep escalation. Source permission is independent.

Acceptance:

- trivial changes incur no model review;
- ordinary cleared diffs do not also receive a premium review;
- weak/uncertain JEV signals receive fresh adequate diagnosis;
- security/high-risk changes always keep their mandatory review;
- failed/missing verification cannot be cleared by JEV;
- defect-catch and final-success rates match or beat baseline.

#### Slice 6 decisions (2026-09-25, user)

- **No source sharing in this slice.** Tier 2 (`jev-review`, which sends code to TypeSafe) is not built. It remains an opt-in pilot, off by default, in a later change. JEV sees only metadata.
- **Tier 0 is a fixed rule, not a model judgment.** The review selector measures the working-tree diff locally with git: the tracked diff against a base, plus untracked files, excluding the scratch area. A change is trivial only when all of these hold:
  - at most 20 changed lines;
  - at most 2 files;
  - no new, deleted, or binary files;
  - verification `passed` and a stable diff;
  - no risk flags.

  A caller's own `trivial` label is no longer trusted.
- **Metadata JEV never clears a nontrivial diff.** In `enforce`, a confident review route (operation `review`) sets only the reviewer's capability and effort for tier 3. A weak, `hold`, or unavailable route uses the baseline reviewer. Hard risks select tier 4 deep/security. Unstable diffs, missing or failed verification, and any caution flag select a general review that JEV cannot clear.
- **Modes.** `off` or unset keeps today's `review-change` behavior (`status: off`); `shadow` returns the selection as advice; `enforce` makes it binding. Reviews are never stacked, and a matching diff-bound `review` receipt may be reused.

**Revision after the benchmark (user decision).** The first rule let a 7-line code change with a seeded, untested defect skip review. Only a small **docs-only** diff now skips model review. A small code diff always gets one review at `routine`/`low`, whatever JEV answers.

**Validation.** A defect-seeded benchmark on the medium fixture uses clean and defective diffs whose defects the acceptance check does not catch. The baseline reviews each diff with the host default. The tiered arm runs the enforced selector: no model review for a rule-trivial diff, and a routed-level reviewer otherwise. Record the defects caught, false alarms, and frontier tokens. Acceptance: equal or better defect catch, and security and verification floors intact.

### Slice 7 — Portable pruning and escalation packets

Add deterministic entry pruning, then batched JEV pruning only above measured thresholds. Generate compact failure/escalation projections and handoffs from capsule state.

Acceptance:

- pinned information remains verbatim and ordered;
- tool calls/results remain interpretable;
- failure or insufficient reduction uses the unpruned packet;
- stronger workers solve the same failures without extra rereads/retries;
- source/context disclosure follows its separate permission.

#### Slice 7 decisions (2026-09-25, user)

- **No JEV pruning.** The Slice 9 screen found that the JEV call cost more than the whole packet, and at a stricter threshold it dropped a required fact. Pruning stays deterministic, local, and metadata-only, so no packet text is shared. A future trial needs a much larger bounded packet, explicit context-sharing permission, and a complete-task baseline.
- **Insufficient reduction uses the unpruned packet.** Prune entries accept an optional `chars` count, computed locally from the entry text and never sent anywhere. The result reports kept and dropped characters and a `use_pruned` decision; when it is false, the caller sends the unpruned packet.
- **Failure packets for escalation.** A failed attempt records a short `failure` (a summary of at most 512 characters plus an `evidence_ref`). When the ledger returns `escalate-baseline`, it also returns a compact escalation packet: the routed class, what was requested, the failure summary, the evidence reference, and the changed paths. When a task capsule exists, the ledger appends the failure to it so the `escalation` projection carries it. The baseline worker continues from the failed attempt's working tree with this packet instead of restarting discovery; it may discard the attempt's changes when the evidence shows they are wrong. The one-escalation limit is unchanged.

**Validation.** A paired live trial of a genuine routed failure: a buggy DELETE implementation that fails a DELETE acceptance check. Arm A runs a cold baseline restart, the pre-Slice-7 behavior. Arm B runs the baseline with the failure packet on the failed tree. Three pairs on Claude, recording reads, turns, tokens, cost, and final acceptance. Acceptance: B passes at least as often as A, with fewer rereads and no more retries.

### Slice 8 — Host-native optimization adapters

Codex: fresh subagent packets, explicit model/effort, native compaction checkpoints, tool-surface/cache measurements. Claude: isolated minimal subagents, MCP deferral checks, output/turn bounds, OTel measurement, stable cache prefixes, and optional pinned `fast-jev-compaction` pilot.

Acceptance:

- live host behavior is distinguished from simulation;
- Claude compaction failure falls back to native compaction;
- Codex does not rewrite transcripts;
- tool schema and cache improvements are demonstrated by host context/usage readings;
- host-specific settings remain optional and documented.

#### Slice 8 decisions (2026-09-25, user)

- **Token savings only.** The optional Claude `fast-jev-compaction` pilot is left untouched. Its only live trial showed no saving, and a fallback-only test would save nothing. The acceptance item "Claude compaction failure falls back to native compaction" stays verified by code review (0.7.1) and is recorded as a gap. The pilot remains off.
- **Lean launched-worker profiles.** These are optional host flags for CLI workers (the `execute-slices` and escalation paths). They keep every governing control and drop only startup context the worker does not need:
  - **Claude:** `--strict-mcp-config` (no MCP servers), `--setting-sources project,local` (skips user-level plugins, hooks, and env), `--disable-slash-commands` (no skill catalogue; the packet names the skill files to read), `--exclude-dynamic-system-prompt-sections` (a stable, cache-friendly system prompt), and an explicit `--tools` list. Project `CLAUDE.md`/`AGENTS.md`, project settings, and permission controls still apply.
  - **Codex:** `--ignore-user-config` (skips user MCP servers and defaults) with an explicit model, effort, and sandbox. `--ignore-rules` is **not** used, because execpolicy rules are a safety control.
- **Measurement.** Default against lean launch, in paired live trials per host on the same bounded worker task (the Slice 7 escalation fix), with the same model and effort. Record host-reported input, cache-read, and cache-write tokens, the first-turn context where exposed, turns, and acceptance. The profile is documented as optional in `hosts.md` only if it saves tokens with equal acceptance.

### Slice 9 — Experimental compression and semantic reuse

Run the experiments in section J behind flags. Promote only the individual winners; do not ship a generic “AI compression” layer merely because it reduces characters.

Acceptance:

- each experiment has a paired complete-task report;
- quality and privacy gates are explicit;
- a losing experiment is removed or remains lab-only;
- no experimental cache/compressor affects approval, security, verification, or source review.

### Slice 10 — Release, docs, and end-to-end rollout

Update setup, orchestration, context, review, troubleshooting, local-model, security, and handoff guidance. Update `VERSION`, `CHANGELOG.md`, `.claude-plugin/plugin.json`, and every skill’s `metadata.featurekit-version`. Run all required packaging/install/use checks and the extended behavioral trials in disposable product repos.

Roll out in stages: `off` -> mocked -> live shadow -> family-specific enforcement -> review replacement -> pruning/compaction -> experiments. Each use has its own disable switch and privacy scope.

### Expected file surface

Likely core changes, refined per approved slice:

- `skills/productivity/using-featurekit/SKILL.md`
- `skills/productivity/orchestrate-work/SKILL.md`
- `skills/productivity/orchestrate-work/references/*.md`
- `skills/productivity/orchestrate-work/scripts/optimizer.mjs` and only the modules justified by tests
- `skills/engineering/grilling/SKILL.md`
- `skills/engineering/grill-with-docs/SKILL.md`
- `skills/engineering/implement/SKILL.md`
- `skills/engineering/validate-feature/SKILL.md`
- `skills/engineering/review-change/SKILL.md`
- `skills/productivity/handoff/SKILL.md`
- `skills/engineering/setup-featurekit/SKILL.md`
- `tests/check_context_budget.py`
- `tests/context-budget.json`
- `tests/optimizer.test.mjs`
- `tests/scenarios.md`
- relevant `docs/ai-workflow/` pages, `prompts/local-llm-featurekit.md`, and release inventory files

The external `jev-review` and `fast-jev-compaction` sources remain pinned external integrations unless measurement proves a small upstream contribution is necessary. Do not copy their implementations into FeatureKit.

---

## L. Final projected workflow

```text
user request
    |
    v
tiny repo invariant + tiny FeatureKit bootstrap
    |
    +--> approval / permission / security / deterministic gates
    |          |
    |          +--> blocked or question needed -> user (no JEV/workers first)
    |
    v
task-capsule lookup + exact freshness/cache checks
    |
    +--> reusable current fact/evidence/decision -> reuse by reference
    |
    v
direct deterministic action sufficient?
    | yes
    +------> run tool/check -> update evidence
    |
    no
    v
one batched JEV route decision
    | capability
    | reasoning effort
    | execution shape
    | context breadth / lazy references
    | provisional review tier
    v
deterministic floors + confidence/margin policy
    |
    +--> unavailable/uncertain -> current adequate baseline route
    |
    v
small agent-specific state projection
    |
    +--> routine worker / minimal-low effort
    +--> standard worker / independently selected effort
    +--> deep or specialist worker / independently selected effort
    +--> capable current primary when delegation has no complete-task benefit
    |
    v
worker retrieves source locally and returns compact structured result/evidence refs
    |
    v
primary integrates + deterministic verification against current tree
    |
    +--> fail
    |      |
    |      v
    |   compact failure capsule -> exact cache -> batched JEV escalation
    |      | retry | more targeted context | more effort | stronger capability | user
    |      v
    |   stronger worker receives only the escalation projection
    |
    +--> pass
           |
           v
       deterministic risk/review tier
           |
           +--> trivial/fully proved -> primary accepts
           |
           +--> ordinary + authorized -> focused JEV review
           |          |
           |          +--> calibrated clear -> primary accepts
           |          +--> weak/uncertain -> fresh adequate general review
           |
           +--> high-risk/security -> mandatory deep/security review
                                      |
                                      v
                              primary disposition
                                      |
                                      v
                        verified completion + compact final
```

Around the flow:

- the capsule replaces transcript replay;
- exact caches remove repeated decisions/retrieval where identity is proven;
- stable prefixes improve provider cache reuse;
- tool schemas and skills load on demand;
- deterministic/JEV pruning controls worker, reviewer, escalation, and handoff packets;
- Claude may use JEV transcript compaction, while Codex uses native compaction plus capsule restoration;
- complete-task traces decide whether every optimization remains enabled.

## Research basis

Implementation snapshots inspected for this plan:

- [Codex JEV router gist](https://gist.github.com/antoniolg/62f82f2a5d191fe074e3f5065501993d): typed routing, shadow/fallback, but too Codex-specific and proxy-oriented for FeatureKit.
- [`jev-kit`](https://github.com/jonathanavis96/jev-kit) at `dee304d86ae8d50daac83bfaaf74abe14e7bbf64`: deterministic rules, risk floors, confidence/margin policy, redaction, evaluation, and bounded decisions.
- [`jev-review`](https://github.com/NiazMorshed2007/jev-review) at `57690af54ef7d862c2483342c1e61c14dffcf727`: portable MCP, focused source/diff state, typed quality dimensions, confidence, and no hosted intermediary.
- [`fast-jev-compaction`](https://github.com/tamaratran/fast-jev-compaction) at `e3f262a7f4d42bd8dd32ced30d26176f7cb545b0`: paired call/result pruning, verbatim retention, size thresholds, and Claude function-hook integration.
- [TypeSafe Choice](https://docs.typesafe.ai/primitives/choice), [confidence routing](https://docs.typesafe.ai/patterns/confidence-routing), and [current TypeSafe pricing](https://typesafe.ai/).
- OpenAI [tool search](https://developers.openai.com/api/docs/guides/tools-tool-search), [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [compaction](https://developers.openai.com/api/docs/guides/compaction), [Agents observability](https://developers.openai.com/api/docs/guides/agents-api/observability), [Codex hooks](https://learn.chatgpt.com/docs/hooks), and [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
- Claude Code [feature/context loading overview](https://code.claude.com/docs/en/features-overview), [subagents](https://code.claude.com/docs/en/sub-agents), [hooks](https://code.claude.com/docs/en/hooks), [environment controls](https://code.claude.com/docs/en/env-vars), and [OpenTelemetry monitoring](https://code.claude.com/docs/en/monitoring-usage), plus Anthropic [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- Microsoft [LLMLingua](https://github.com/microsoft/LLMLingua), the [LLMLingua paper](https://arxiv.org/abs/2310.05736), [LongLLMLingua](https://arxiv.org/abs/2310.06839), and [LLMLingua-2](https://arxiv.org/abs/2403.12968).

Revalidate host documentation and external revisions at implementation time; hooks, model catalogues, effort levels, and early-access compaction surfaces are intentionally treated as changeable.
