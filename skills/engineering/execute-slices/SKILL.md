---
name: execute-slices
description: Execute multiple approved FeatureKit implementation slices from a written PRD or plan. Use explicitly when ordered slices already exist and the user wants autonomous batch execution with verification, review checkpoints, optional subagents, and no branch, commit, push, or PR actions.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.2"
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

## Process

1. Read the PRD or plan, slices, `AGENTS.md`, `docs/agents/`, relevant ADRs, and verification docs.
2. State the slice queue, out-of-scope work, and verification commands.
3. Execute slices in dependency order without asking between slices.
4. For each slice:
   - implement only that slice,
   - use `secure-code`, `secure-api`, or `secure-deploy` when the slice touches their trigger areas,
   - use `tdd` for testable logic, bug fixes, services, API behavior, and data transformations,
   - run the slice verification,
   - use `verify-tests` when tests look weak, high-risk, generated, assertion-light, or security-sensitive,
   - use `review-change` for a checkpoint review before moving to the next slice,
   - use `security-review` when the checkpoint has material security risk,
   - fix blocking review findings before continuing.
5. Stop when blocked by missing context, ADR conflict, failing verification, unclear scope, or a required user decision.
6. After all slices pass, run the broader repo verification command.
7. Report changed areas, verification, review results, and any remaining work.

## Subagents

Use subagents when the current harness provides them and the slices can be worked safely in sequence:

- dispatch one implementer subagent per slice,
- give the subagent only the PRD or plan, the current slice, relevant ADRs, constraints, and verification commands,
- after each slice, dispatch one reviewer subagent or run `review-change`,
- inspect the subagent result and diff before continuing,
- do not run slices in parallel in this version.

If subagents are unavailable, execute the same process in the current session. For each slice, follow the `implement` process for the coding work, then use `review-change` and `verify-tests` where their gates apply.

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

ADRs:
<governing ADRs followed | conflict or update needed>

Divergence:
<none | what changed from the slices and why>

Next:
<review-change | handoff | next PRD or slice set>
```
