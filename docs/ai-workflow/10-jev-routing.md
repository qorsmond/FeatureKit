# JEV Routing

JEV routing is an optional FeatureKit feature that saves model cost. For each approved task it asks TypeSafe JEV, a small, cheap classification service, how much model the task actually needs. Your coding tool then runs the task on a model of that size. It is **off by default**; nothing changes until you turn it on.

```text
approved task
  → FeatureKit sends JEV a short description of the task (never your code)
  → JEV answers: "routine, low effort", "standard, medium", "deep, high", or "not sure"
  → Claude Code or Codex runs the task on its cheapest, middle, or strongest model
  → checks pass: done
    checks fail: one retry on your normal model, starting from the failed attempt
```

When JEV is unsure, unavailable, or the task is sensitive, the task simply runs on your normal model.

## What Leaves Your Machine

JEV receives only a small, bounded description of the task:

- a one-line objective;
- the file paths in scope;
- the acceptance criteria;
- a few yes/no facts;
- the task's minimum level and any risk flags.

It never receives source code, diffs, logs, transcripts, or secrets, and the request format rejects anything else. Everything else FeatureKit remembers stays on your machine in `.scratch/featurekit/`.

| Capability | Switch | What leaves the machine |
| --- | --- | --- |
| Routing and review selection | `FEATUREKIT_JEV_ROUTING` (`off` / `shadow` / `enforce`) | Bounded task metadata to TypeSafe |
| Fact receipts, model catalogue cache, pruning, attempt ledger | Always local; delete `.scratch/featurekit/` to reset | Nothing |
| Source-aware `jev-review` pilot | Separately installed and authorized per repo | The focused diff and files you approve |
| Claude `fast-jev-compaction` pilot | Loaded for one session with its plugin; off by default | Transcript text, with separate transcript permission |

## Before You Start

You need:

- FeatureKit installed in your product repo ([Install](./01-install.md));
- Node.js, because the router is a small dependency-free Node script;
- Claude Code or Codex;
- a TypeSafe account and API key from [TypeSafe](https://typesafe.ai/);
- a local FeatureKit checkout, whose absolute path the connection commands below use as `FEATUREKIT_ROOT`.

## Step 1: Add Your API Key

Put the key in your shell profile, **never in the repository**. For zsh (the macOS default), open `~/.zshrc`; for bash, open `~/.bashrc` or `~/.bash_profile`. Add:

```sh
export TYPESAFE_API_KEY='your-key'
export JEV_API_KEY="$TYPESAFE_API_KEY" # only needed for the optional upstream jev-review pilot
```

Open a new terminal, then confirm the key is visible without printing it:

```sh
[ -n "$TYPESAFE_API_KEY" ] && echo "key is set" || echo "key is missing"
```

Keep the key out of repo files, committed `.env` files, prompts, command arguments, and agent instructions. FeatureKit reads it only from the environment and never writes it to traces or caches. Your shell profile must not print anything when it starts, because the router's MCP server and hook use standard output to exchange JSON.

On macOS, Codex Desktop does not read `~/.zshrc` by itself. The Codex commands in Step 3 launch through `zsh -ic` so they pick up the key anyway.

## Step 2: Choose A Mode

Set the mode in the same shell profile:

```sh
export FEATUREKIT_JEV_ROUTING=shadow
```

| Setting | Effect |
| --- | --- |
| unset or `off` | No TypeSafe call. FeatureKit uses its normal route. |
| `shadow` | JEV is asked and its advice is recorded, but the normal route still runs. Use this first. |
| `enforce` | When JEV is confident, the task runs at JEV's level and effort on a model your coding tool picks. Otherwise the normal route runs. |

Restart Claude Code or Codex after changing the key or the mode, so the router inherits the new values. Switching back to `off` is always safe and does not require removing the key or deleting the cache.

## Step 3: Connect Your Coding Tool

The router can run two ways. An **MCP server** gives the agent one `route` tool. A **prompt hook** routes an approved task automatically before the model starts, which saves a model turn. Set up whichever your installation supports.

### Claude Code with the FeatureKit plugin

Nothing to add. The plugin ships the MCP server (`.mcp.json`) and the prompt hook (`hooks/hooks.json`). Restart Claude Code, or run `/reload-plugins`, after changing the key or mode, then check that `featurekit-jev` appears in `/mcp`. Do not also add a user-level MCP entry.

### Claude Code with skills only

Connect the MCP server once, using your FeatureKit checkout path:

```sh
FEATUREKIT_ROOT=/absolute/path/to/FeatureKit
claude mcp add --transport stdio --scope user featurekit-jev -- node "$FEATUREKIT_ROOT/skills/productivity/orchestrate-work/scripts/mcp-server.mjs"
```

Start Claude Code from a terminal that has the key, then check `/mcp`.

### Codex

Connect the MCP server once:

```sh
FEATUREKIT_ROOT=/absolute/path/to/FeatureKit
codex mcp add featurekit-jev -- /bin/zsh -ic "exec node '$FEATUREKIT_ROOT/skills/productivity/orchestrate-work/scripts/mcp-server.mjs'"
```

Check it with `codex mcp get featurekit-jev`.

For the prompt hook, merge this group into the `hooks.UserPromptSubmit` array in `~/.codex/hooks.json`. Replace `/absolute/path/to/FeatureKit` with your checkout path, and keep your other hook events and existing groups:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "[ \"$FEATUREKIT_JEV_ROUTING\" = off ] || FEATUREKIT_JEV_HOST_ROUTING=\"$FEATUREKIT_JEV_ROUTING\" exec /bin/zsh -ic 'exec node \"/absolute/path/to/FeatureKit/skills/productivity/orchestrate-work/scripts/route-hook.mjs\"'",
            "timeout": 6,
            "statusMessage": "Checking FeatureKit route"
          }
        ]
      }
    ]
  }
}
```

Then trust the hook:

1. In Codex, open `/hooks` and choose **Review hooks**.
2. Open **UserPromptSubmit**.
3. Select the FeatureKit command ending in `route-hook.mjs`, and press `t` until it shows **Trusted** and enabled. Trust only this entry, not all pending hooks.
4. Start a new task.

Repeat the trust step whenever the command changes. If you set up the hook before FeatureKit 0.8.0, replace its command with the one above. The `FEATUREKIT_JEV_HOST_ROUTING` prefix keeps an explicit `off` or `enforce` from being overridden by your shell profile.

### Every product repo

Add `.scratch/featurekit/` to the product repo's `.gitignore`. Set `FEATUREKIT_SCRATCH_ROOT` only if the repo uses a different approved scratch location.

## Step 4: Check It Works

From the product repo, send one small test request straight to the router. It contains no code:

```sh
FEATUREKIT_ROOT=/absolute/path/to/FeatureKit
echo '{"schema":1,"mode":"route","task":{"id":"jev-setup-check","operation":"implement","objective":"Setup check: add one approved field to an existing form","approval":"approved-write","scope":["src/form"],"acceptance":["Existing form tests pass"]},"facts":{"files_estimate":1,"cross_boundary":false,"unknown_root_cause":false,"current_failure":false,"attempts":0},"policy":{"capability_floor":"routine","effort_floor":"low","risk_flags":[],"available_capabilities":["routine","standard","deep"]}}' \
  | FEATUREKIT_JEV_ROUTING=shadow node "$FEATUREKIT_ROOT/skills/productivity/orchestrate-work/scripts/optimizer.mjs"
```

| Result | Meaning |
| --- | --- |
| `"status":"shadow"` or `"hold"` with a `usage` token count | Working: JEV answered. A line is appended to `.scratch/featurekit/traces/jev.jsonl`. |
| `"status":"unavailable"` with `MISSING_API_KEY` | The key is not visible in this terminal; repeat Step 1 in a new terminal. |
| `"status":"unavailable"` with a network or HTTP reason | The machine cannot reach `api.typesafe.ai`, or the key was rejected. |
| `"status":"off"` | The mode was not applied; check the `FEATUREKIT_JEV_ROUTING=shadow` part of the command. |

Then work normally. FeatureKit routes each approved task once, and `jev.jsonl` grows by one line per new routing decision.

## Step 5: Roll Out

Move one step at a time, and step back whenever the ledger or traces show a problem:

1. **`off`.** Install and confirm the normal workflow. No provider calls are made.
2. **`shadow`.** Set the key and mode, and restart the host. Watch `.scratch/featurekit/traces/jev.jsonl` for `hold` rates and routes that look wrong for your kind of tasks. Nothing changes execution.
3. **`enforce`.** Switch when the shadow routes look right. Watch `.scratch/featurekit/tasks/<task>/attempts.json` for escalations, and the reviews for missed issues. Only routine, low-effort implementation has paired cost evidence so far; the other levels run by your choice.
4. **Back off per task family.** If one kind of task keeps misrouting, return to `shadow` (or `off`) and describe those tasks more concretely before trying again.

## How Enforced Routing Decides

JEV decides the level (`routine`, `standard`, or `deep`) and an effort. Your coding tool decides the model: its cheapest tier for routine work, a middle tier for standard, and its strongest for deep. FeatureKit and your repos never name models. If you want to force a model, add an optional override to `docs/agents/orchestration.md`.

Some things never change:

- Unapproved work, pending user decisions, security, authorization, privacy, destructive, and irreversible work never go to JEV. They run on your normal route.
- A `hold`, provider failure, or weak answer runs the normal route.
- A route never goes below the task's own minimum capability and effort.
- Tasks flagged as a migration, ambiguous, previously failed, or missing evidence can only move up, never to a cheaper model.
- A `minimal` effort floor is raised to `low`, the lowest effort both hosts run.

JEV is more decisive when the task is described concretely. Write the approved spec (field rules, status codes, file placement) in the objective and acceptance. When the plan or repo confirms them, add the optional facts: an existing automated check, an exact spec, following an existing pattern, new dependencies, and a size estimate. Leave out anything unconfirmed. On a measured medium-size task, this raised JEV's confidence from about 0.37 to 0.85.

A task launched headless or as a batch worker starts directly on the routed model; this is where the largest savings were measured. In a live session, the main agent hands the work to one worker on that model, or works directly if it already runs on it.

Each attempt is recorded in the local `attempts.json` ledger with the requested and actual model and effort; unknown values stay `null`. If a routed attempt fails its checks:

1. It records a one-line failure summary and the changed paths.
2. The task reruns once on your normal model, continuing from the failed attempt's work with that summary instead of starting over.

A check blocked by the sandbox, network, or authentication is reported as a gap, not treated as a failed route.

Review follows the same switch. In `enforce`, FeatureKit measures the diff itself:

- A verified docs-only change of at most 20 lines in at most 2 existing files gets checks only.
- A small code change always gets one review on the cheapest level.
- Security and other hard risks keep the deep/security review.
- Everything else gets one review on the level JEV picks, or the normal level when JEV is unsure.

JEV never waves a code change through without review, because it never sees the code.

## Where Things Are Stored

Everything lives in the product repo's `.scratch/featurekit/` folder:

| Path | Contents |
| --- | --- |
| `traces/jev.jsonl` | One line per routing decision: status, level, reason codes, and token counts. No task text. |
| `traces/cache.jsonl` | Receipt and catalogue cache hits and misses. |
| `cache/routes/` | Exact cached JEV answers, so an identical request is not paid for twice. |
| `tasks/<task>/` | Task capsule, attempt ledger, receipts, and projections. |

Delete the folder at any time to reset. Nothing in it is needed for correctness.

## Turn It Off

```sh
export FEATUREKIT_JEV_ROUTING=off
```

Restart the host. `off` makes no provider call. You do not need to remove the key or delete the cache.

## Troubleshooting

- **The test returns `MISSING_API_KEY`.** The key is not in that terminal's environment. Check your shell profile and open a new terminal.
- **Codex never routes.** Codex Desktop may not see `~/.zshrc`; use the `zsh -ic` commands above. Check `codex mcp get featurekit-jev`, and that the hook shows **Trusted** in `/hooks`.
- **An explicit `off` or `enforce` is ignored.** Your Codex hook command predates 0.8.0. Replace it with the one in Step 3 and re-trust it.
- **Calls fail with `ENOTFOUND` inside a sandbox.** Use the MCP server or the hook, which call TypeSafe from outside the coding sandbox. Do not loosen the sandbox.
- **JEV mostly says `hold`.** Describe tasks more concretely and add the optional verified facts (see [How Enforced Routing Decides](#how-enforced-routing-decides)).

More symptoms are covered in [Troubleshooting](./07-troubleshooting.md#jev-is-calling-unexpectedly-or-not-calling).

## Under The Hood

Both hosts use the same dependency-free optimizer (`skills/productivity/orchestrate-work/scripts/optimizer.mjs`), an optional MCP server that exposes one read-only `route` tool, and a prompt hook. The hook runs before the model and ignores the submitted prompt. It routes only when exactly one approved, `ready` task capsule with a route request exists. In `shadow` it injects advice. In `enforce` it injects the binding route and the exact attempt-ledger command, so the model never calls JEV again. Missing, corrupt, stale, unapproved, or duplicate capsules produce no hook output.

The route request rejects unknown fields, oversized input, source, diffs, transcripts, and raw output. Traces contain only identifiers, decisions, usage counts, latency, cache status, and reason codes.

The same local area holds exact fact receipts. A receipt is keyed by the repo, the query, the tool, and the relevant paths. The optimizer derives the exact identity from HEAD, the working tree, and file hashes, so any change forces a fresh lookup. Before a large handoff or escalation, a local pruner can drop duplicate and stale packet entries by metadata alone; it sends the full packet when pruning saves less than 20%. The installed [optimizer reference](../../skills/productivity/orchestrate-work/references/optimizer.md) has the exact request shapes.

### Optional source-review pilot

Source review is off unless you or the repo explicitly allow focused code/diff sharing and the upstream [`jev-review`](https://github.com/NiazMorshed2007/jev-review) tool is separately connected. FeatureKit's review selection never chooses it. Pin the reviewed upstream revision rather than following `main`; the v0.7.0 pilot used `57690af54ef7d862c2483342c1e61c14dffcf727` (`jev-review` 0.1.1).

Use it only for a stable ordinary diff after the required checks pass and no risk flag applies. Send only the task, the focused diff, and the necessary surrounding files; never secrets, environment files, repository-wide source, logs, or transcripts. A weak or error result keeps the ordinary review, and hard risk keeps the deep/security review. Do not install this MCP server by default: its tool schema is large, and complete-task savings are unproven.

The v0.7.0 experiments did not promote JEV packet pruning, semantic caching, lossy compression, verification caching, or a focused review fork; see the [experiment record](../plans/2026-09-24-jev-experiments.md). Measured results for everything on this page are in the [validation record](../plans/2026-09-24-jev-shadow-validation.md).

## Series Navigation

- Previous: [Orchestration](./09-orchestration.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Security Workflow](./08-security.md)
