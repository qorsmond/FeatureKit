---
name: execute-slices
description: Execute multiple approved FeatureKit implementation slices from a written PRD or plan. Use explicitly when ordered slices already exist and the user wants autonomous batch execution with verification, review checkpoints, optional subagents, and no branch, commit, push, or PR actions.
metadata:
  featurekit-version: "0.12.0"
---

# Execute Slices

Execute approved implementation slices sequentially.

This skill is for throughput after planning is complete. It does not replace `/to-slices` or `/implement`.

## Preconditions

Before changing code, confirm:

- there is an approved PRD, plan, or equivalent written scope,
- ordered implementation slices exist,
- the user explicitly approved the slice set and asked to execute it now,
- each slice has acceptance criteria and verification guidance,
- out-of-scope work is explicit,
- relevant ADRs can be checked,
- security context from `docs/agents/security.md` can be checked when present,
- repo verification commands are known.

If these are missing, stop and recommend `/grill-with-docs`, `/to-prd`, or `/to-slices`.

A clarified feature summary or a newly generated slice list is not enough by itself. The user must approve the written scope before this skill changes code.

## Context Budget

- Read the approved artifact and stable repo guidance once. The plan file is the queue: start at the first slice whose `Status` is not `done`, and reuse recorded `Notes` and `Evidence` instead of rediscovering them.
- When Serena or an equivalent semantic code tool is available, activate the project and use symbol overviews, symbol lookup, and reference lookup before reading full code files.
- When RTK is available, use its appropriate wrappers for noisy search, read, diff, test, build, and lint commands. Otherwise bound paths and output and prefer quiet or failure-only modes. Expand only the failing target when compact output is insufficient.
- Do not copy raw source, full diffs, repeated successful test output, or prior slice summaries into the working context. Do not install optional tools during execution unless the user asks.
- If the remaining context is no longer sufficient for the next slice, stop at the completed slice boundary and create a compact `handoff` instead of dropping constraints or loading the entire repository.

## Process

1. Read the PRD or plan, slices, `AGENTS.md`, only the relevant `docs/agents/` files and ADRs, and verification docs.
2. State the slice queue, out-of-scope work, and verification commands.
3. Execute slices in dependency order without asking between slices.
4. For each slice:
   - implement only that slice,
   - use `secure-code`, `secure-api`, or `secure-deploy` when the slice touches their trigger areas,
   - use `tdd` for testable logic, bug fixes, services, API behavior, and data transformations,
   - use `orchestrate-work` to select direct work or bounded workers within the slice,
   - run the narrow slice verification and assess runtime/platform evidence with `validate-feature`,
   - use `verify-tests` when tests look weak, high-risk, generated, assertion-light, or security-sensitive,
   - compare the scoped diff with the slice acceptance criteria, then update the slice's `Status`, `Evidence` and `Notes` in the plan file before moving on,
   - use `review-change` at a checkpoint when the slice is high-risk, cross-cutting, surprising, or difficult to reverse, and for the final combined review when it has not already been covered,
   - use `security-review` when the checkpoint has material security risk,
   - fix blocking review findings before continuing.
5. Stop when blocked by missing context, ADR conflict, failing verification, missing required runtime proof, unclear scope, or a required user decision. Workers return evidence for the primary to assess; their completion status does not close the slice.
6. After all slices pass, run each broader repo verification command once.
7. Report changed areas, verification, review results, and any remaining work.

## Workers

Use `orchestrate-work` for capability selection, bounded packets, and escalation. When a slice's level is below this session's and a fresh CLI session on that model is available, run the whole slice there; the primary keeps verification. Otherwise work directly. Do not dispatch an implementer and reviewer for every slice.

Keep the queue sequential. Only independent jobs within the current slice may run concurrently, with explicit ownership and nonconflicting input snapshots/runtime resources. No worker recursively delegates. Inspect each result and scoped diff, then validate integrated behavior before continuing. Follow `implement` for coding and existing `review-change`, `security-review` and `verify-tests` gates for review.

## Boundaries

- Do not create branches or worktrees.
- Do not commit, push, merge, or open PRs.
- Do not silently change slice scope.
- Do not add production dependencies without user approval.
- Do not continue past failing verification unless the failure is unrelated and explicitly explained.
- Do not continue past unresolved P0/P1 security findings.
- Do not implement later slices early unless the current slice cannot be made coherent without a dependency; if that happens, stop and ask to revise the slices.

## Output

```markdown
Executed slices:
<slice list and status>

Verification:
<validate-feature verdict; commands/runtime/platform evidence, criterion results and gaps>

Work distribution:
<routes, observed models, results, escalations and primary disposition>

Reviews:
<review-change or subagent review results>

Security:
<secure-code/secure-api/secure-deploy/security-review results>

Test verification:
<verify-tests result | skipped and why>

Context efficiency:
<Serena/RTK or bounded fallbacks used; any handoff boundary>

ADRs:
<governing ADRs followed | conflict or update needed>

Divergence:
<none | what changed from the slices and why>

Lessons:
<none | each change and where it was made (see using-featurekit)>

Next:
<review-change | handoff | next PRD or slice set>
```
