---
name: execute-slices
description: Execute multiple approved FeatureKit implementation slices from a written PRD or plan. Use explicitly when ordered slices already exist and the user wants autonomous batch execution with verification, review checkpoints, optional subagents, and no branch, commit, push, or PR actions.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.4"
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

- Read the approved artifact and stable repo guidance once. Maintain a compact queue ledger with the current slice, relevant files or symbols, decisions, diff state, and verification state.
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
   - run the narrow slice verification,
   - use `verify-tests` when tests look weak, high-risk, generated, assertion-light, or security-sensitive,
   - compare the scoped diff with the slice acceptance criteria before moving on,
   - use `review-change` at a checkpoint when the slice is high-risk, cross-cutting, surprising, or difficult to reverse, and for the final combined review when it has not already been covered,
   - use `security-review` when the checkpoint has material security risk,
   - fix blocking review findings before continuing.
5. Stop when blocked by missing context, ADR conflict, failing verification, unclear scope, or a required user decision.
6. After all slices pass, run each broader repo verification command once.
7. Report changed areas, verification, review results, and any remaining work.

## Subagents

Do not use subagents by default. Use one only when separate context materially improves correctness, such as an isolated complex investigation or an independent high-risk review, and the expected benefit justifies the additional token cost.

- Give a subagent only the approved artifact, current slice, relevant ADRs and constraints, relevant files or symbols, and verification commands.
- Do not dispatch an implementer and reviewer for every routine slice.
- Inspect the subagent result and scoped diff before continuing.
- Do not run slices in parallel in this version.

Normally execute the queue in the current session. For each slice, follow the `implement` process for the coding work and use `review-change` and `verify-tests` only where their gates apply.

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
<commands run and results>

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

Next:
<review-change | handoff | next PRD or slice set>
```
