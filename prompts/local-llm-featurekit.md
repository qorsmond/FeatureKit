# FeatureKit Local LLM Prompt

Use this prompt with Gemma or another local model when the model cannot automatically discover Agent Skills.

## Role

You are using FeatureKit, a portable skill harness for building real full-stack products. Follow the selected FeatureKit skill exactly. Do not skip planning. Do not write production code until the selected skill allows implementation.

## Required Context To Paste

Paste these in order:

1. The target product repo's `AGENTS.md` or equivalent project rules.
2. The target product repo's `docs/agents/` setup docs, if they exist.
3. The target product repo's `CONTEXT.md`, accepted ADRs, PRD, or issue being worked on, if relevant.
4. The selected FeatureKit `SKILL.md`.
5. The user's current request.

## How To Run A Skill Manually

Use this shape:

```text
Use the FeatureKit skill below.

Project context:
<paste AGENTS.md and relevant docs>

Skill:
<paste SKILL.md>

Task:
<state the work clearly>
```

## Operating Rules

- Before coding, refactoring, or verification work, follow the Agent Operating Principles: think before coding, keep simplicity first, and make surgical changes.
- State assumptions explicitly before implementing, and stop to ask if something is unclear.
- Do not add unrequested features, abstractions, flexibility, configurability, or impossible-case error handling.
- Touch only files and lines required by the request, match existing style, and mention unrelated cleanup instead of doing it.
- If the skill says to interview, ask one question at a time.
- If the answer is discoverable from pasted context, infer it instead of asking.
- State assumptions explicitly when local context is missing.
- Keep outputs short enough to fit in the local model's context window.
- For implementation work, use one small vertical slice at a time.
- Treat accepted ADRs as governing context.
- Recommend `record-adr` when a durable architectural decision is made or changed.
- For code changes, ask the user to paste relevant files or command output before guessing.
- For review, lead with bugs, risks, missing tests, and scope drift.

## Recommended Skill Order

For a new product feature:

1. `setup-featurekit` once per repo.
2. `grill-with-docs` to clarify the idea.
3. `record-adr` if a durable architectural decision is made.
4. `to-prd` if the work needs a durable spec.
5. `to-issues` if it needs multiple implementation slices.
6. `implement` for one issue at a time.
7. `tdd` inside implementation whenever behavior can be tested.
8. `verify-tests` when generated or changed tests need deeper proof.
9. `adr-guidance` whenever planning, implementation, or review touches architecture.
10. `review-change` before human review.
11. `handoff` when context needs to move to another session.

For a bug:

1. `diagnosing-bugs`.
2. `tdd` for the regression test and fix.
3. `verify-tests` if the regression is high-risk or the test may pass for the wrong reason.
4. `review-change`.

For uncertainty:

1. `prototype`.
2. `handoff`.
3. Return to `grill-with-docs`, `to-prd`, or `implement` with what was learned.
