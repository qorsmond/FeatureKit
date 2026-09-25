# JEV optimizer contract

The optional optimizer is a metadata-only adviser invoked through `scripts/optimizer.mjs`. It never plans, edits, dispatches, approves, or overrides FeatureKit gates.

- Default mode is `off`; `shadow` calls JEV but never changes execution. No enforcement mode exists in this release.
- Read `TYPESAFE_API_KEY` from the environment; `JEV_API_KEY` is a compatibility alias. Never put either value in repo files, command arguments, traces, or output.
- Send one bounded request per phase. Reject source, diffs, transcripts, raw output, unknown fields, and oversized values.
- Treat task-family labeling as optional metadata. A weak label is omitted without discarding independently confident capability and effort advice.
- Deterministic work, pending user decisions, and hard risk floors skip JEV. Risk-flagged requests keep baseline execution/context; low confidence, a small top-two margin, contradictions, unavailable routes, timeout, rate limit, network failure, or malformed answers produce partial advice, `hold`, or `unavailable` while preserving the baseline route.
- Record only content-free identity, route, confidence/margin gates, token counts reported by TypeSafe, latency, cache status, and reason codes.

Prefer the connected FeatureKit JEV server's single `route` tool. It exposes this schema directly and performs the provider call outside the coding sandbox. If that tool is unavailable, run `node scripts/optimizer.mjs` from this skill directory with one JSON request on stdin. Do not read the script or tests to discover the schema. Use exactly this shape and replace only values:

```json
{"schema":1,"mode":"route","task":{"id":"T1","operation":"implement","objective":"bounded outcome","approval":"approved-write","scope":["path"],"acceptance":["criterion"]},"facts":{"files_estimate":1,"cross_boundary":false,"unknown_root_cause":false,"current_failure":false,"attempts":0},"policy":{"capability_floor":"routine","effort_floor":"minimal","risk_flags":[],"available_capabilities":["routine","standard","deep"]}}
```

Operations: `lookup`, `edit`, `implement`, `debug`, `architecture`, `review`, `handoff`, `other`. Approvals: `read-only`, `approved-write`, `not-approved`. Risk flags: `security`, `authz`, `privacy`, `destructive`, `irreversible`, `migration`, `ambiguous`, `prior-failure`, `missing-evidence`, `user-decision-pending`. If the result is `off`, `skipped`, `hold`, or `unavailable`, use the baseline once; do not retry or inspect optimizer internals.

## Task capsule

The same script accepts `mode: "capsule"` without contacting JEV:

- `action: "write"` stores the full validated capsule atomically under `.scratch/featurekit/tasks/<task-id>/capsule.json`. Supply the current `expected_revision`; a mismatch rejects the write.
- `action: "project"` writes a primary, worker, reviewer, or handoff projection. Supply the expected repo snapshot; changed head, dirty digest, or artifact hashes return `stale` instead of reusing context.

The primary is the only capsule writer. Workers receive a projection path and return bounded result/evidence references for the primary to validate and import. Missing, corrupt, unsupported, or stale state falls back to the approved artifact and current repository evidence.

For a host preflight, store the validated request above as `capsule.route.request`, set `capsule.work.status` to `ready`, and keep `capsule.authority.level` equal to `request.task.approval`. The bundled `UserPromptSubmit` hook ignores the user prompt and runs only when exactly one valid approved capsule matches; zero or multiple matches produce no output. Its compact result is advisory and replaces the later model-called route request, not the baseline route.

## Exact fact receipts

The script also accepts local `mode: "receipt"` requests without contacting JEV. Use these before repeating repository discovery:

- `action: "write"` requires `task_id`, `identity`, and a bounded `fact` with `id`, `value`, and `ref`.
- `action: "read"` requires the same `task_id` and `identity`; an exact match returns `status: "hit"`, while changed or missing state returns `miss`.
- `identity` contains the capsule `snapshot`, a SHA-256 `query_hash`, `tool` (`repowise`, `serena`, or `source`), `contract_version`, `index_head` (only for Repowise), and a non-empty map of relevant paths to SHA-256 content hashes.

FeatureKit/policy version, repo/head/dirty state, artifact hashes, query, tool contract, index head, and relevant file hashes all participate in the exact key. A Repowise index behind the snapshot returns `stale` and is never stored as current proof. Keep values concise and local; store references, not source, diffs, logs, transcripts, or secrets.

## Review tier selection

Reuse the phase's route result; never call JEV again just to choose a reviewer. The local selector accepts no source or diff:

```json
{"schema":1,"mode":"review","action":"select","change":{"kind":"ordinary","stable_diff":true,"verification":"passed","source_sharing":"off","risk_flags":[]},"route":{"status":"shadow","review_floor":"general","approved_dimensions":["review_floor"]}}
```

Run it through `optimizer.mjs` stdin. A verified stable trivial change selects deterministic review. Hard security/privacy/destructive risk selects deep/security review. Any other risk flag, unstable diff, missing/failed verification, weak/unavailable route signal, or denied source permission for `jev-review` keeps general review. The result remains shadow-only; it cannot clear production review until paired trials promote that class.

When source review is explicitly authorized and the selector yields `jev-review`, use the separately installed pinned upstream tool with a focused task/diff and only necessary context. One baseline call is enough unless a concrete weakness justifies one correction and one rescore. Weak/error signals fall back to general review; paired replacement trials run one selected tier rather than stacking reviewers.

## Deterministic context pruning

Before escalation or a large handoff, call the local selector with metadata only; keep the text outside the request:

```json
{"schema":1,"mode":"prune","action":"deterministic","entries":[{"id":"scope","kind":"requirement","state":"current","pinned":true,"content_hash":"<sha256>","ref":"docs/plan.md#scope","pair_id":null}]}
```

Kinds are `authority`, `requirement`, `constraint`, `failure`, `evidence`, `ownership`, `source`, `retrieved-doc`, `diagnostic`, `progress`, `decision`, `tool-action`, and `tool-result`. States are `current`, `resolved`, and `superseded`. Mark authority, scope, acceptance, constraints, unresolved failures, current proof, and ownership as pinned.

The result returns ordered `keep_ids` and dropped IDs/reasons. It keeps pinned entries verbatim, removes unpinned exact duplicates and superseded entries, replaces recoverable source/docs with their references, removes resolved progress and referenced old diagnostics, and keeps or drops each tool action/result pair together. Unknown or incomplete pairs fail instead of producing ambiguous context. This path is local and makes no JEV call; use the unpruned packet if selection fails.
