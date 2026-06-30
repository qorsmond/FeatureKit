---
name: adr-guidance
description: Read and apply architectural decision records (ADRs) as governing project context. Use when planning, designing, implementing, reviewing, diagnosing, or handing off work that may touch architecture, data, integrations, deployment, public APIs, or durable technical conventions.
metadata:
  featurekit-version: "0.3.0"
---

# ADR Guidance

Use ADRs as durable constraints while planning and changing a product repo.

## Process

1. Locate ADRs from `docs/agents/workflow-locations.md`; default to `docs/adr/`.
2. Read relevant ADRs before technical recommendations, implementation, review, or handoff.
3. Treat `Accepted` ADRs as governing context.
4. Treat `Proposed` ADRs as useful context, not binding decisions.
5. Treat `Superseded` and `Deprecated` ADRs as historical unless needed to understand migration.
6. If work conflicts with an accepted ADR, stop or flag the conflict before proceeding.
7. If a new durable decision appears, recommend `/record-adr`; do not write ADRs from this skill.

## What Needs ADR Attention

Flag decisions about:

- system boundaries, ownership, and module shape,
- data model, storage, migrations, and retention,
- external integration contracts,
- auth, authorization, privacy, and security posture,
- deployment, runtime, scaling, and operations,
- public APIs and cross-cutting architectural conventions.

Do not require ADRs for ticket-local choices, small reversible refactors, copy changes, or ordinary UI details.

## Conflict Handling

When a plan or diff conflicts with an accepted ADR:

- name the ADR,
- describe the conflict in one sentence,
- recommend changing the plan or running `/record-adr` to supersede the decision,
- do not silently implement against the ADR.

## Output

When useful, include:

```markdown
ADR context:
- <ADR path or title>: <governing point>

ADR conflicts:
- <none | conflict and required resolution>

ADR updates needed:
- <none | decision that should be recorded with /record-adr>
```
