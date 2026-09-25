# JEV experimental optimization screen — FeatureKit 0.7.0

Date: 2026-09-24

Scope: Slice 9 of [`2026-09-24-jev-orchestration.md`](./2026-09-24-jev-orchestration.md). This is a promotion screen, not permission to change production behavior. Synthetic inputs contain no FeatureKit source, user data, transcript, diff, log, or secret.

## Decision

No Slice 9 experiment is promoted. Existing deterministic pruning, exact receipts, lazy references, stable prefixes, and host-native compaction remain the smaller and safer implementation. No compression dependency, semantic cache, verification cache, or additional JEV call was added.

## Live batched screen

One TypeSafe `jev-1.13.0` request batched eight packet keep/drop questions and six strict fact-query equivalence questions. Provider-reported usage was 2,185 input and 288 output tokens.

### Aggressive packet pruning

The synthetic packet contained four required current facts and four optional stale/recoverable entries, totalling 743 characters.

| Keep threshold | Dropped characters | Required false drops | Result |
| ---: | ---: | --- | --- |
| 0.50 | 361 / 743 (48.6%) | none | Safe on this tiny corpus, but negative economics |
| 0.70 | 460 / 743 (61.9%) | `environment-gap` | Unsafe |
| 0.85 | 743 / 743 (100%) | all four required entries | Unsafe |

At 0.50, deterministic metadata rules already remove three of the four optional entries; JEV's only incremental drop was incidental implementation chatter. The shared JEV call consumed far more tokens than the whole candidate packet and did not replace a complete frontier-model call. This fails the promotion gate. JEV packet pruning remains off; a future trial is justified only for a much larger already-bounded packet with explicit context-sharing permission and a complete-task baseline.

### Strict semantic equivalence

At a 0.80 cache-hit threshold, JEV rejected all four deliberately non-equivalent query pairs and accepted one of two equivalent paraphrases. There were zero false hits and one false miss. At 0.90 it accepted neither equivalent pair.

This tiny corpus is insufficient for a semantic cache, and the shared JEV request cost is material compared with many read-only fact lookups. Exact hash-keyed receipts remain the production path. A future semantic trial must show repeated high-precision hits that eliminate a larger downstream call at an identical repository/policy snapshot; any false hit is a failure.

## Remaining experiment disposition

| Experiment | Evidence | Disposition |
| --- | --- | --- |
| LLMLingua family | No FeatureKit coding-task safety evidence; adds a model/dependency and lossy text | Not run; no dependency added |
| JEV reference selection | Already batched into shadow routing; existing Codex pairs did not show positive complete-task economics | Advisory only; phase/lazy loading stays authoritative |
| JEV retrieval relevance | Exact receipt invalidation is deterministic; semantic screen had a false miss | Exact receipts only |
| Semantic cache | Zero false hits but only 50% recall on two positive pairs, with material shared call cost | Not implemented |
| Focused `jev-review` profile | Prior pilot exposed a 26,800-character schema and weak correctness confidence; upstream has no proven selected-metric win here | Keep pinned full upstream pilot optional; no fork |
| Prompt-cache shaping | Stable FeatureKit prefixes already exist; Codex pairs exposed cached input but no clean per-task realized-cost win | Keep stable ordering; no new flag |
| Exact verification reuse | Environment identity is not complete enough to make a cached pass acceptance evidence | Not implemented |

## Promotion status

The live screen and earlier Codex/review evidence are observed; Claude Code and complete-task trials for experiments remain unavailable. Because no candidate passed the cheap pre-screen, no further provider calls or paired frontier runs were spent. Slice 9 changes no approval, security, verification, review, or source-sharing behavior.
