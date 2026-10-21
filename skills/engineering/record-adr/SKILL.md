---
name: record-adr
description: Record or update architectural decision records (ADRs) for durable technical decisions in a product repo. Use explicitly when a feature, PRD, prototype, design review, implementation, or migration chooses or changes architecture that future work must follow.
disable-model-invocation: true
metadata:
  featurekit-version: "0.14.1"
---

# Record ADR

Write durable architecture decisions so future agents and humans can follow them.

## Process

1. Read the `ADR directory`, `ADR filename`, `ADR template` and `ADR statuses` lines in `docs/agents/workflow-locations.md`. Use the defaults below for any it does not record; the ADR directory defaults to `docs/adr/`.
2. Read relevant existing ADRs, `AGENTS.md`, the `Glossary:` that `docs/agents/domain.md` names (default `CONTEXT.md`), `docs/agents/`, PRDs, slices, prototypes, and handoffs.
3. Confirm the decision is durable architecture, not ordinary product scope or ticket-local implementation detail.
4. If the decision is not settled, ask the smallest question needed or recommend `/prototype`.
5. Create one ADR per decision, or update an existing ADR only for status, links, or minor correction. Add it to the directory's index if one exists.
6. When changing an accepted decision, prefer a new ADR that supersedes the old one. Do not rewrite history casually.
7. Report the ADR path and any PRD, slice, or implementation follow-ups.

## ADR Triggers

Record an ADR for choices that future work must obey, such as:

- system boundaries and module ownership,
- data ownership, storage, migrations, or retention,
- integration contracts and external dependencies,
- authentication, authorization, privacy, or security posture,
- runtime, deployment, scaling, or operational constraints,
- public API shape or cross-cutting architectural patterns.

Do not create ADRs for copy, minor UI choices, local refactors, or reversible implementation details unless they establish a durable project rule.

## Status Rules

Use the repo's `ADR statuses` and their meanings when recorded. Otherwise:

- `Proposed`: under discussion; informative but not governing.
- `Accepted`: governing context for future plans, slices, implementation, and review.
- `Superseded`: replaced by a newer ADR.
- `Deprecated`: intentionally retired without a direct replacement.

Accepted ADRs, and any others the repo says govern, are constraints. If the current request conflicts with one, stop and resolve the conflict before writing implementation code.

## File Naming

Use the repo's `ADR filename` pattern and numbering rule; without a rule, number after the highest ADR on the default branch and in the working tree. Otherwise use:

```text
YYYY-MM-DD-short-decision-title.md
```

Use lowercase hyphen-case for the slug. Save it in the configured ADR directory.

## ADR Format

Copy the repo's `ADR template` and fill every section. Otherwise use:

```markdown
# ADR: <decision title>

Status: <Proposed | Accepted | Superseded | Deprecated>
Date: <YYYY-MM-DD>
Supersedes: <none | ADR path or title>
Superseded by: <none | ADR path or title>
Related: <PRD, slice, prototype, handoff, or none>

## Context
<why the decision is needed>

## Decision
<the architectural choice future work must follow>

## Consequences
<tradeoffs, constraints, and follow-up obligations>

## Alternatives Considered
<credible options rejected and why>
```

## Output

```markdown
ADR:
<path>

Status:
<status>

Decision:
<one-sentence summary>

Follow-ups:
<none | PRD, slice, implementation, or review updates needed>
```
