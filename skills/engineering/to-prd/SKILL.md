---
name: to-prd
description: Turn a clarified product idea, plan, or conversation into a concise PRD for a full-stack product change. Use explicitly after grilling or when a durable spec is needed before implementation. Writes or drafts a PRD in the repo's configured workflow location.
disable-model-invocation: true
metadata:
  featurekit-version: "0.7.1"
---

# To PRD

Create a durable product spec from the current context.

## Process

1. Read `docs/agents/workflow-locations.md`, `docs/agents/security.md` if present, relevant project context, and relevant ADRs.
2. Use the clarified idea, existing plan, or conversation as input.
3. Do not restart the interview unless a critical decision is missing.
4. Write a concise PRD that can drive slice planning and review. Use `validate-feature` to plan acceptance evidence from `docs/agents/verification.md`, including target runtimes/platforms and unavailable device or manual checks. Do not report planned checks as executed.
5. Include accepted ADRs that constrain the PRD and decisions that need `/record-adr`.
6. Use `secure-design` for work that touches auth, authorization, sensitive data, APIs, deployment, integrations, generated code, or untrusted input.
7. Save it to the configured PRD location, defaulting to `docs/prd/<slug>.md`.
8. Show the completed PRD and ask one self-contained final approval question with short context and three clear choices: approve it, ask more questions, or change it. Apply the `grilling` question contract to any reopened decision; uncertainty does not approve or settle it.
9. Treat the PRD as staged until the user approves it. After approval, continue to slicing when the approved plan calls for slices. When the approved PRD is implementation-ready without slices, use the implementation destination rules from `using-featurekit`: continue focused work in the current task without asking, and ask about a fresh task only for substantial work. Do not implement from an unapproved or product-depth PRD.

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

## Security And Abuse Cases
<security requirements, trust boundaries, abuse cases, and sensitive data handling>

## ADR Context
<accepted ADRs that apply, plus any decisions to record with /record-adr>

## Decisions
<important choices and reasons>

## Risks
<known risks and mitigations>

## Acceptance Criteria
<observable completion criteria>

## Verification
<criterion-to-evidence plan: tests/checks, target runtimes/platforms, security review, manual/physical proof, prerequisites and known gaps>
```

## Done

Report where the PRD was written and the next options. If it is small enough for direct implementation, say so in the approval summary. After approval, continue in the current task only when the original request authorized implementation; otherwise stop after planning. Ask about a fresh task only when the work is substantial under `using-featurekit`. Writing the PRD is not approval; only its final approval question approves it.
