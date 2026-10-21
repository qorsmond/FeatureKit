# Knowledge retrieval experiment

Isolated proof of concept. Nothing here is loaded by FeatureKit's skills.

`kx.py` is a derived, local index (Python 3.9+ stdlib: `ast`, SQLite FTS5, PageRank). It links code symbols, callers, callees, class attributes, tests, documentation sections, ADRs, and lessons. Every result names its file and lines. Results from files changed since indexing are marked STALE. Knowledge with `status: deprecated`, `superseded_by`, or a passed `stale_after` is hidden from search unless `--all` is given. Commands: `build`, `refresh`, `map`, `find`, `node`, `brief`.

## Run

```sh
experiments/knowledge/fetch.sh
python3 evals/run.py --suite experiments/knowledge --arms bare,featurekit,kx,kx-brief --label <name>
```

The fetch script pins `pallets/click` at `2247b35` and installs a verification venv. The scaffold adds `fixtures/overlay/`: three ADRs (one superseded), a verification guide, verified lessons, and an acceptance check.

Arms:

- `bare`: no plugin.
- `featurekit`: plugin plus the setup block.
- `kx`: FeatureKit plus `arm-kx.md`, which advertises the index.
- `kx-brief`: FeatureKit plus a `kx brief` of the request injected before the run (`arm-kx-brief.py`).

## Results (2026-10-21, Sonnet, 2 runs per case)

| Arm | Grader checks | Fix verified | Cost/run | Turns | Input tokens | Seconds |
|---|---|---|---|---|---|---|
| bare | 11/16 | 2/2 | $0.37 | 22 | 643K | 109 |
| featurekit | 11/16 | 1/2 | $0.48 | 30 | 1.04M | 143 |
| kx (advertised) | 9/16 | 2/2 | $0.47 | 29 | 1.01M | 136 |
| kx-brief (injected) | 10/16 | 2/2 | $0.45 | 22 | 683K | 112 |

- Agents rarely used an advertised index: 4 `kx` calls in 8 runs.
- An injected brief cut FeatureKit's turns by 27% and its input tokens by 34%. It fixed the multi-hop miss: all three `split_envvar_value` callers were found in 2 of 2 runs, against 0 of 2 for FeatureKit and 1 of 2 for bare. It did not beat the bare agent on overall correctness, and it did worse on the planning task.
- Index cost: 0.6 s, 1.7 MB for Click (29K Python lines); 4.8 s, 19 MB, 152 MB peak memory for LiteLLM (708K lines). Queries take about 60 ms and return 2–4 KB. A refresh check takes 74 ms.
- Repowise 0.46 (deterministic mode, for comparison): 26 s, 15 MB for Click, a 680 MB install, AGPL-3.0. Its init writes `.claude/` and `.mcp.json` into the repo.

Limitations:

- Two runs per cell, one model, Claude Code only.
- `kx` gained attribute indexing and `brief` after the pilot, so the `kx-brief` arm is not on held-out tasks.
- `git` does not work inside the eval sandbox.

## Held-out test on a large repository (2026-10-21)

The suite is `experiments/knowledge-large/`: SQLAlchemy at `8301bec` (253K library, 379K test, and 150K documentation lines), with four new tasks that `kx` was not tuned on. The arms are `featurekit` and `kx-brief`, three runs each, on Sonnet.

| Task | FeatureKit checks | + brief checks | Cost/run | Turns |
|---|---|---|---|---|
| Trace commit to SQL | 6/6 | 6/6 | $0.39 → $0.42 | 21 → 21 |
| Impact of changing `get_callable_argspec` | 5/9 (callers 0/3) | 9/9 (callers 3/3) | $0.23 → $0.25 | 15 → 14 |
| Plan a custom column type | 3/9 | 5/9 | $0.64 → $0.53 | 16 → 28 |
| Fix commit-without-flush (verified, with a hidden check) | 3/3 | 3/3 | $0.35 → $0.29 | 22 → 18 |
| **Total** | **14/24 (58%)** | **20/24 (83%)** | **$0.40 → $0.37** | **18.5 → 20.4** |

- The index for 780K lines builds in 4.3 s, takes 24 MB, and answers queries in about 60 ms.
- Across both repos, the brief found every caller in the impact tasks (5 of 5 runs, against 0 of 5 for FeatureKit alone).
- The agents still called `kx` themselves only twice in 12 runs. All of the benefit came from the injected brief.
- Six brief-arm runs were rerun. The eval tool cut each prompt's frontmatter at a run of `---` from an RST underline that the brief quoted. `run.py` now collapses dash runs, and `kx` drops underline lines from its summaries.

## Agent-run brief in FeatureKit 0.12 (2026-10-21)

The final test used the integrated script, an index in the workspace, and nothing injected. `using-featurekit` tells the agent to run the brief itself.

| Run | Checks | Cost/run | Brief actually run |
|---|---|---|---|
| SQLAlchemy held-out, FeatureKit 0.12 | 20/24 (83%) | $0.39 | 2 of 12 runs |
| Click impact case, FeatureKit 0.12 / bare | 2/9 / 4/9 | $0.27 / $0.29 | 0 of 3 runs |

The agent often never loaded `using-featurekit` for analysis questions (6 of 12 SQLAlchemy runs, 3 of 3 Click runs), so the step did not fire. The 83% matched the injected-brief arm without using the index. It also shows run-to-run variance: the impact task scored 6/6 here and 5/9 in the earlier FeatureKit baseline under identical conditions. The earlier 58% → 83% comparison is therefore mostly noise.

The one signal that holds across both repositories: with brief content in context, impact analyses listed every caller in 6 of 6 runs, against 7 of 17 without it.

## Improvement episode: hook delivery and import-aware resolution (2026-10-21, $5.91)

| Component | Change | Observed | Verdict |
|---|---|---|---|
| `kx.py` (script) | Calls resolve through the class, imports, and re-exports; builtins and external modules are skipped | Offline: callers match ground truth on all four held-out targets, including the two same-named `_offset_or_limit_clause` functions that were merged before | helped |
| Plugin hooks | Prompt pointer, symbol-search and file-read neighbourhoods, once per session | The index reached the agent in 13 of 13 runs (vs 2/15 skill step, 3/8 trigger line); 0 errors; 4–39 ms per event | helped |
| Plugin hooks | Same | Cost per run $0.37 → $0.31 across four impact tasks (lower in 4 of 4); turns lower in 3 of 4 | helped (medium: n=3, baselines run on other days) |
| Plugin hooks | Same | Checks 18/33 → 21/33 | confounded (within variance; resolution changed at the same time) |
| `using-featurekit` text | Hook-aware knowledge section; lesson format | Plan gate held 2/2 and implement verified 3/3 at unchanged cost | no observed effect |

Lesson.

- **cue:** an agent must take a step at a specific moment (consult an index before exploring), but only instructions ask for it.
- **lesson:** deliver the step through the tool loop with a non-blocking hook keyed to that moment, rather than through prose in a skill or always-on text.
- **evidence:** skill step 2/15, always-on trigger line 3/8, hook 13/13; cost per run −18% with the hook.
- **confidence:** medium.
