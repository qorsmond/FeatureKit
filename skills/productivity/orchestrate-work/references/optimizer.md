# JEV optimizer contract

The optional optimizer is a metadata-only adviser invoked through `scripts/optimizer.mjs`. It never plans, edits, dispatches, approves, or overrides FeatureKit gates.

- `FEATUREKIT_JEV_ROUTING` is `off` (default when unset), `shadow`, or `enforce`. `off` makes no call; `shadow` never changes execution; `enforce` changes execution only when the result status is `enforced` (see below).
- Read `TYPESAFE_API_KEY` from the environment; `JEV_API_KEY` is a compatibility alias. Never put either value in repo files, command arguments, traces, or output.
- Send one bounded request per phase. Reject source, diffs, transcripts, raw output, unknown fields, and oversized values.
- Treat task-family labeling as optional metadata. A weak label is omitted without discarding independently confident capability and effort advice.
- Deterministic work, pending user decisions, and hard risk floors skip JEV. Risk-flagged requests keep baseline execution/context; low confidence, a small top-two margin, contradictions, unavailable routes, timeout, rate limit, network failure, or malformed answers produce partial advice, `hold`, or `unavailable` while preserving the baseline route.
- Record only content-free identity, route, confidence/margin gates, token counts reported by TypeSafe, latency, cache status, and reason codes.

Prefer the connected FeatureKit JEV server's single `route` tool. It exposes this schema directly and performs the provider call outside the coding sandbox. If that tool is unavailable, run `node scripts/optimizer.mjs` from this skill directory with one JSON request on stdin. Do not read the script or tests to discover the schema. Use exactly this shape and replace only values:

```json
{"schema":1,"mode":"route","task":{"id":"T1","operation":"implement","objective":"bounded outcome","approval":"approved-write","scope":["path"],"acceptance":["criterion"]},"facts":{"files_estimate":1,"cross_boundary":false,"unknown_root_cause":false,"current_failure":false,"attempts":0},"policy":{"capability_floor":"routine","effort_floor":"minimal","risk_flags":[],"available_capabilities":["routine","standard","deep"]}}
```

Optional `facts`, sent only when verified from the approved plan or repository (omit when unsure; absence is never favorable): `existing_check` (the acceptance names an automated check already in the repo), `spec_exact` (the plan states exact inputs, outputs, and errors), `follows_existing_pattern`, `new_dependencies`, `lines_estimate`. Write `objective` and `acceptance` as the concrete approved spec (field rules, status codes, file placement) within their limits. On a measured medium task this raised JEV's capability confidence from about 0.37 to 0.85. Floors and gates still bound every route.

Operations: `lookup`, `edit`, `implement`, `debug`, `architecture`, `review`, `handoff`, `other`. Approvals: `read-only`, `approved-write`, `not-approved`. Risk flags: `security`, `authz`, `privacy`, `destructive`, `irreversible`, `migration`, `ambiguous`, `prior-failure`, `missing-evidence`, `user-decision-pending`. If the result is `off`, `skipped`, `hold`, or `unavailable`, use the baseline once; do not retry or inspect optimizer internals.

## Enforced route

In `enforce`, the optimizer raises a `minimal` effort floor to `low`, the lowest effort both hosts can run, then asks JEV once. Any `shadow`-quality answer becomes `status: "enforced"` with `route: {"class":"<capability>-<effort>","capability":"routine|standard|deep","effort":"...","up_only":false,"escalation":"baseline-once"}`. It applies to every operation that passes the approval gate. Deterministic skips (not approved, pending decision, hard risk, exact lookup), `hold`, `unavailable`, and weak signals keep the baseline. Routes never go below the request floors. A request with any caution flag (`migration`, `ambiguous`, `prior-failure`, `missing-evidence`) is marked `up_only`: use it only when it is at least as strong as the baseline model and effort.

On `enforced`:

1. The harness picks the model from those the host offers at runtime: `routine` = cheapest tier, `standard` = middle, `deep` = strongest. Pass the routed effort when the host supports it. A user override in `docs/agents/orchestration.md` wins; none is required, and FeatureKit names no models.
2. If the chosen model is the one already running, work directly. Otherwise dispatch one worker immediately with plan and scope paths, not pre-read source, and verify with the acceptance checks and diff. For batch or slice work, prefer a fresh [CLI worker](backends.md) session: it runs the whole slice on the routed model and can take the routed effort, which Claude Code's in-session worker tool cannot. The measured savings come from this configuration; in-session delegation reduced frontier tokens but not total cost on a medium task.
3. Record each attempt; any setting the host could not pass or did not report is `null`:

```json
{"schema":1,"mode":"attempt","action":"record","task_id":"T1","attempt":{"route":"routed","route_class":"routine-low","requested":{"model":"<chosen>","effort":"low"},"runtime":{"model":null,"effort":null},"outcome":"failed","evidence_ref":"path/to/check-output","failure":{"summary":"DELETE returns 200 but GET still finds the item","changed_paths":["app/store.py"]}}}
```

The ledger (`tasks/<id>/attempts.json`) returns `next`. A check blocked by the environment (sandbox, network, authentication) is not a routed failure: run it outside the restriction or report the gap. `failure` is `null` for a passed attempt. For a failed one it holds a one-line `summary` (at most 512 characters) and `changed_paths`, never source or diffs. The ledger appends the failure to the task capsule when one exists.

A failed routed attempt returns `escalate-baseline` with an `escalation` packet: the route class, the requested settings, the failure, the evidence reference, and `continue_from: "failed-attempt-tree"`. Run the baseline once with `route: "baseline"` and `route_class: null`, counted against the routed route. Give that worker the packet, the capsule's `escalation` projection, and the failed attempt's working tree. It fixes the recorded failure rather than restarting discovery, and it may discard the attempt's changes when the evidence shows they are wrong. A routed attempt is accepted only as the first attempt. Baseline failures follow normal [recovery](recovery.md). The prompt hook injects these instructions with the exact ledger command.

Only `routine`/`low` implementation has paired complete-task evidence; other levels are enforced by user decision without paired economics.

## Task capsule

The same script accepts `mode: "capsule"` without contacting JEV:

- `action: "write"` stores the full validated capsule atomically under `.scratch/featurekit/tasks/<task-id>/capsule.json`. Supply the current `expected_revision`; a mismatch rejects the write.
- `action: "project"` writes a primary, worker, reviewer, or handoff projection. Supply the expected repo snapshot; changed head, dirty digest, or artifact hashes return `stale` instead of reusing context.

The primary is the only capsule writer. Workers receive a projection path and return bounded result/evidence references for the primary to validate and import. Missing, corrupt, unsupported, or stale state falls back to the approved artifact and current repository evidence.

For a host preflight, store the validated request above as `capsule.route.request`, set `capsule.work.status` to `ready`, and keep `capsule.authority.level` equal to `request.task.approval`. The bundled `UserPromptSubmit` hook ignores the user prompt and runs only when exactly one valid approved capsule matches; zero or multiple matches produce no output. Its compact result is advisory and replaces the later model-called route request, not the baseline route.

## Exact fact receipts

Check a receipt before repeating repository discovery, and write one after discovering a durable fact. Pass a `key`; the script derives the exact identity locally from git state and file hashes:

```json
{"schema":1,"mode":"receipt","action":"read","task_id":"T1","key":{"repo":"/abs/repo","query":"Where is POST /items validated?","tool":"source","contract_version":1,"index_head":null,"paths":["app/validation.py"]}}
```

- `write` adds `"fact":{"id":"items-validation","value":"concise fact","ref":"path#symbol"}`. `read` returns `hit` with the fact, or `miss`.
- `tool` is `repowise`, `serena`, `source`, or `review`. Set `index_head` only for Repowise. An index behind HEAD returns `stale` and is never stored as current proof.
- The identity covers FeatureKit/policy version, repo, HEAD, and a dirty-tree digest (tracked diff plus untracked contents, excluding the scratch area). It also covers the query, tool contract, index head, and the content hash of every listed path. Any change is a miss; restoring identical content hits again.
- A `review` receipt with the changed paths as `paths` is bound to the exact diff. Reuse a review result only on a hit.
- The full `identity` object from earlier releases remains accepted in place of `key`.

Keep values concise and local. Store references, not source, diffs, logs, transcripts, or secrets.

Cache the host's runtime model list once a day, keyed by exact host version, so the harness need not rediscover it every session:

```json
{"schema":1,"mode":"catalogue","action":"write","host":{"name":"codex","version":"0.150.1"},"models":[{"id":"<model id>","efforts":["low","medium"]}]}
```

`read` with the same `host` returns `hit` with the models, `miss` for another version, or `stale` after 24 hours. `{"schema":1,"mode":"cache","action":"stats"}` reports receipt, catalogue, and JEV route hit/miss/stale counts and the calls each hit eliminated. Traces hold only kind, tool, status, and reason codes.

## Review tier selection

Reuse the phase's review route: one JEV request with `operation: "review"` and `approval: "read-only"`. Never call JEV again just to choose a reviewer. The local selector measures the diff itself and sends nothing:

```json
{"schema":1,"mode":"review","action":"select","change":{"repo":"/abs/repo","base":"HEAD","stable_diff":true,"verification":"passed","risk_flags":[]},"route":{"status":"enforced","capability":"standard","effort":"low"}}
```

- **Diff measurement.** `base` is a plain git revision. The selector counts the tracked diff against it plus untracked files, excluding the scratch area, and reports `files`, `lines`, `code_files`, and `new_or_deleted`.
- **Tiers, in order:**
  1. A hard risk selects `deep-security`, the existing mandatory workflow.
  2. An unstable diff, missing or failed verification, or any caution flag selects `general` with the baseline reviewer.
  3. A **small** diff has at most 20 changed lines, at most 2 files, and no new or deleted files. If every changed file is docs (`.md`, `.mdx`, `.markdown`, `.txt`, `.rst`, `.adoc`), it selects `deterministic`: checks and scope inspection only. Any small code change selects `general` with the cheapest reviewer (`{"source":"small-diff","capability":"routine","effort":"low"}`), because a passing check proves nothing about new, untested behavior.
  4. Otherwise one `general` review runs. A confident route (`enforced` or `shadow` with capability and effort) sets the reviewer to `{"source":"routed",...}`, and the harness picks the model as for any route. A weak or unavailable route keeps the baseline reviewer.
- **Metadata-only JEV never clears a nontrivial diff.**
- **Modes.** `off` returns `status: off` and today's review behavior. `shadow` is advisory. `enforce` is binding.
- **Reuse.** Reuse a matching diff-bound `review` receipt instead of repeating a review. Never stack reviews.

Source-aware `jev-review` sends code to TypeSafe. It is not part of this selector and remains a separately authorized, opt-in pilot.

## Deterministic context pruning

Before escalation or a large handoff, call the local selector with metadata only; keep the text outside the request:

```json
{"schema":1,"mode":"prune","action":"deterministic","entries":[{"id":"scope","kind":"requirement","state":"current","pinned":true,"content_hash":"<sha256>","ref":"docs/plan.md#scope","pair_id":null}]}
```

Kinds are `authority`, `requirement`, `constraint`, `failure`, `evidence`, `ownership`, `source`, `retrieved-doc`, `diagnostic`, `progress`, `decision`, `tool-action`, and `tool-result`. States are `current`, `resolved`, and `superseded`. Mark authority, scope, acceptance, constraints, unresolved failures, current proof, and ownership as pinned.

Each entry may add `chars`, a local character count of its text; the text itself is never sent. The result returns ordered `keep_ids`, dropped IDs and reasons, `input_chars` and `kept_chars` (null unless every entry is measured), and `use_pruned`. Use the pruned packet only when `use_pruned` is true. With sizes, that requires dropping at least 20% of the characters and at least 200 characters; without them, at least 20% of the entries. Otherwise send the unpruned packet. It keeps pinned entries verbatim, removes unpinned exact duplicates and superseded entries, replaces recoverable source/docs with their references, removes resolved progress and referenced old diagnostics, and keeps or drops each tool action/result pair together. Unknown or incomplete pairs fail instead of producing ambiguous context. This path is local and makes no JEV call; use the unpruned packet if selection fails. JEV-assisted pruning is not provided: the only measured trial cost more than the packet it pruned.
