---
name: to-prd
description: Turn a clarified product idea, plan, or conversation into a concise PRD for a full-stack product change. Use explicitly after grilling or when a durable spec is needed before implementation. Writes or drafts a PRD in the repo's configured workflow location.
disable-model-invocation: true
metadata:
  featurekit-version: "0.1.1"
---

# To PRD

Create a durable product spec from the current context.

## Process

1. Read `docs/agents/workflow-locations.md`, relevant project context, and relevant ADRs.
2. Use the clarified idea, existing plan, or conversation as input.
3. Do not restart the interview unless a critical decision is missing.
4. Write a concise PRD that can drive issue slicing and review.
5. Include accepted ADRs that constrain the PRD and decisions that need `/record-adr`.
6. Save it to the configured PRD location, defaulting to `docs/prd/<slug>.md`.

## PRD Format

```markdown
# PRD: <feature>

## Goal
<what outcome this creates>

## Users
<who benefits or is affected>

## Scope
<included behavior>

## Out Of Scope
<excluded behavior>

## Requirements
<product and system requirements>

## UX/API Behavior
<user workflows, API behavior, states, and errors>

## Data And Integrations
<data model, storage, external systems, migrations>

## ADR Context
<accepted ADRs that apply, plus any decisions to record with /record-adr>

## Decisions
<important choices and reasons>

## Risks
<known risks and mitigations>

## Acceptance Criteria
<observable completion criteria>

## Verification
<tests, checks, manual review>
```

## Done

Report where the PRD was written and whether it is ready for `/to-issues` or direct `/implement`.
