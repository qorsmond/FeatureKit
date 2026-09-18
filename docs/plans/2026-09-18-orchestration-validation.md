# Orchestration validation — 2026-09-18

Scope: the [approved plan](2026-09-18-capability-orchestration.md), implemented as FeatureKit 0.6.0. The primary accepted the work after inspecting changes, behavior and evidence. No publication, commits, branches, global model configuration changes or provider installation were performed.

## Deterministic checks

| Check | Result |
| --- | --- |
| `python3 tests/check_packaging.py` | Passed: all 30 skills match plugin inventory and release 0.6.0; local links resolve; required model-invoked disciplines remain discoverable. |
| Packaging falsification in temporary copies | Removing a plugin entry failed inventory validation. Removing the packaged backend reference failed link validation. Source remained intact. |
| Skill Creator `quick_validate.py` | Both new skills passed, using the already-installed Repowise Python environment for its YAML dependency. No dependency was added to FeatureKit. |
| `skills` CLI 1.7.0 discovery | `npx skills@latest add . --list` found 30 skills. The package was fetched into a temporary npm cache, then subsequent commands used it offline. |
| Scratch installation | Installed all 22 selected core skills for Codex, Claude Code and OpenCode. Confirmed release metadata, Claude links, universal skill files and the nested backend reference. This proves packaging, not live execution in all three agents. |
| Skill prompt loading | All 11 `skills use` commands listed in `AGENTS.md` succeeded, including `orchestrate-work` and `validate-feature`. |
| Diff hygiene | `git diff --check` passed. |

## Live scratch workflow

Followed the guide through install, setup discovery, draft review, explicit fixture-evaluator approval, approved focused implementation, verification, primary acceptance and handoff. Test-user setup answers and plan approval were supplied by the evaluator; these were not a live end-user interview.

The product was the Python HTTP fixture in `tests/fixtures/service/`, copied into a temporary Git repo. The routine native worker received bounded context and explicit ownership, used installed FeatureKit skills, and did not delegate again. Setup required one correction to distinguish the deep/current-session route from a spawned worker and clarify commands run from the repo root; no new framework or setup format was needed.

The approved implementation changed only two lines in `server.py`: the health body and content type. The acceptance check was unchanged.

| Acceptance/evidence | Observed result |
| --- | --- |
| Baseline real HTTP request | Failed at `response.headers.get_content_type() == "application/json"` because the original handler returned plain text. |
| Final real HTTP requests | Passed: `/health` returns HTTP 200, JSON content type and `{"status":"ok","version":1}`; `/missing` remains HTTP 404. |
| Deliberate wrong-version regression in a separate copy | Failed at the JSON-body assertion with version 2. The temporary copy was discarded; the passing product and source fixture were untouched. |
| Primary acceptance | Inspected the two-line diff and worker outputs; verified the acceptance script and source fixture hashes were unchanged. No browser evidence was needed for this backend requirement. |
| Handoff | Recorded approved scope, code state, red/green/regression evidence, requested route, unknown worker usage, primary acceptance, no active writers and exact continuation. No new user task was created. |

Final scratch source SHA-256: `6cff2453f12bd6eefa67dc9af9c265d71e8f1938f2177378daae2e2bddc6bd13`.

Immutable acceptance check SHA-256: `761285ab7ecce097e6e15e7edb85d95e0256a4964878ed89358ac5900f5d50e9`.

## Live authenticated CLI worker

`codex login status` reported ChatGPT authentication. Codex CLI 0.150.1 successfully executed a bounded read-only packet in the scratch checkout, returned a correct file/line-based answer, and did not claim feature validation. No API key or SDK was introduced.

The first smoke command selected the routine model but inherited `xhigh` effort. Independent review reported this as a defect in the command example. The example now explicitly passes both configured model and supported effort and checks reported settings. A second live run confirmed:

```text
model: gpt-5.6-luna
provider: openai
approval: never
sandbox: read-only
reasoning effort: medium
```

The second answer correctly identified the final `application/json` content type. Independent targeted re-review confirmed the fix. The work ledger now records effort as well as model, and a regression scenario covers inherited defaults.

The CLI printed `tokens used` of 48,999 and 30,754 for the two respective runs. These are CLI-reported run metrics, not verified billing, marginal subscription cost or measured savings. Setup context and the fixture changed between runs; this is not a controlled comparison. Even a tiny external job can load substantial skills/hooks/tool context. The backend guidance now explicitly includes startup context in the routing decision and preserves governing instructions/permission controls.

## Simulated behavioral trials

A fresh-context standard-capability worker received the skills and sixteen independent host situations (A–P), without the expected-outcome rubric or implementation narrative. The primary compared its concrete actions/packets/questions with the [behavioral scenarios](../../tests/scenarios.md).

Observed decisions matched the key requirements: pause before discovery when the question tool is disabled; block unapproved edits; retain deep judgment for conflicting tenant-authorization evidence; parallelize independent reads and serialize conflicting writes/resources; reject failed worker claims and stop repeated retries; preserve authentication/provider restrictions; retain NFC and unrun-platform gaps; invalidate stale evidence; prepare independent review without implementer rationale; keep unknown usage unknown; preserve unclear-answer state and settled answers; route product-depth approval through PRDs/slices; continue focused work; and keep substantial/fresh-task destination selection separate from approval.

These are decision simulations, not live permission, multi-provider, native question UI, task-creation, or mobile-runtime tests. The explicit CLI-effort case additionally has the live evidence above. No simulated task or question tool call was submitted to the user's app.

## Work distribution and review

| Work | Requested route | Outcome / primary disposition |
| --- | --- | --- |
| Bounded planning/docs audit | Native routine worker, `gpt-5.6-luna`, medium | Accepted source-based findings; primary retained design/approval decisions. |
| Guide and local-model documentation | Native routine worker, `gpt-5.6-luna`, medium | Accepted after correcting one out-of-scope placeholder config file into an inline guide template. The mistaken file was removed. |
| Behavioral trials and independent review | Native standard worker, `gpt-5.6-terra`, medium | Simulated decisions accepted within stated limits. One actionable CLI-effort finding fixed and re-reviewed. |
| Scratch setup/implementation/handoff | Native routine worker, `gpt-5.6-luna`, medium | Bounded assignment and immutable runtime check passed; primary inspected and accepted. |
| CLI backend smoke | Codex CLI, `gpt-5.6-luna`; corrected effort medium | Live command/result and client-reported settings verified; startup overhead recorded. |
| Architecture, integration, evidence evaluation | Current primary/deep | Kept ownership of scope, corrections, integration, provider boundaries and completion. |

Native worker effective execution models and token/cost data were not exposed by the collaboration tool and remain unknown. Requested names in this receipt are observations from this session, not core routing rules. Codex CLI metadata is labeled as client-reported configuration, not an independent identification of the serving model. No dollar savings are claimed.

## Remaining environment limits

- Claude Code was absent from the shell PATH. Its optional adapter was checked against official documentation, but no live Claude subscription run was performed.
- Android/iOS, Expo/React Native, desktop and physical hardware behavior were not exercised by this backend fixture. The mobile trials establish honest handling of absent evidence, not device functionality.
- Native question/task UI behavior was simulated; installation for Claude Code/OpenCode does not prove execution in those hosts.
- This is a repeatable scratch integration trial, not production-product dogfooding or a benchmark of the routing tiers. Real project outcomes should refine the optional routing table over time.

Local raw receipts were retained under `/private/tmp/featurekit-orchestration-1x63e9gu/` (`install.log`, `use-*.log`, `decisions.md`, `setup-draft.md`, `worker-result.md`, `red.log`, `green.log`, `mutant.log`, CLI logs/results and the scratch product/handoff). Temporary paths may expire; the observations, commands and hashes above are the durable record.

## Human-visible routing follow-up — 0.6.1

Added a shared live-feedback contract after the user identified that an internal ledger did not make routing sufficiently visible. The bootstrap routes to this contract; backend guidance, the guide and behavioral scenarios explain the same requested-versus-reported settings and lifecycle states.

Packaging validation passed for all 30 skills at release 0.6.1, the changed skill passed `quick_validate.py`, and `git diff --check` passed. Fresh scratch discovery found 30 skills; installation of the 22 core selections for Codex, Claude Code and OpenCode and all 11 required prompt-loading checks passed. The final corrected orchestration skill was reinstalled and its packaged content checked against the source. Raw receipts are under `/private/tmp/featurekit-feedback-iqud8ip2/`; no dependencies or runtime were added.

Before committing, the all-skill `add` refresh documented for existing installs was also checked in a fresh scratch repo using this checkout: Codex and Claude Code received all 30 skills at 0.6.1, including the two new disciplines. The startup guide now includes explicit worker-model selection and a read-only smoke prompt. Blitza's existing 0.5.4 installation was inspected to tailor upgrade instructions; its files were not changed and its live orchestration trial remains to be run after upgrade.

Job W1 used native worker `/root/routing_feedback_check`, requested `gpt-5.6-luna` with medium effort. The host confirmed its running/completed states but exposed no effective model or effort. The primary displayed planned, dispatched, running, checking, retry and accepted updates in the conversation while checking packaging directly.

The worker generated simulated traces for native execution without model metadata, a CLI configuration mismatch and failed fallback, retained primary judgment, direct checks and a long wait. Initial traces exposed a changed job label across retries and unsupported conclusions that no work ran after an ambiguous dispatch and that absent model metadata implied no suitable worker. The contract was tightened; one focused retry preserved the job label, labeled execution state unknown, and grounded primary retention in cross-service ownership. The primary accepted those corrected traces. These are instruction-following simulations plus this session's observed native lifecycle, not live provider-failure or mismatch tests. The earlier real HTTP and CLI results remain 0.6.0 evidence; they were not rerun for this text-only follow-up.
