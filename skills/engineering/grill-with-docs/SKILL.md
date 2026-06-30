---
name: grill-with-docs
description: Interview the user about a product or engineering idea while reading and updating repo context such as AGENTS.md, docs/agents, CONTEXT.md, and ADRs. Use explicitly before PRDs or implementation when scope, domain language, risks, or success criteria need clarification. User-invoked planning skill; do not write production code.
disable-model-invocation: true
metadata:
  featurekit-version: "0.1.0"
---

# Grill With Docs

Clarify an idea until it is ready for a written plan or PRD.

## Process

1. Read `AGENTS.md`, `docs/agents/`, `CONTEXT.md`, relevant ADRs, and relevant code.
2. Identify what is known and what is uncertain.
3. Ask one question at a time.
4. For each question, include:
   - the question,
   - your recommended answer,
   - a one-line reason grounded in repo context.
5. If a question can be answered by reading the repo, read instead of asking.
6. Capture decisions, out-of-scope items, assumptions, risks, and domain terms.
7. Treat accepted ADRs as constraints and do not recommend conflicting architecture without calling out the conflict.
8. When useful, propose updates to `CONTEXT.md` or recommend `/record-adr`, but ask before writing durable docs.

## Question Order

Resolve dependencies first:

1. user and problem,
2. success criteria,
3. scope and out of scope,
4. domain terms,
5. data and state,
6. system boundaries,
7. UX/API behavior,
8. errors and edge cases,
9. rollout and migration,
10. tests and verification.

## Output

When the idea is clear, output:

```markdown
## Clarified Feature: <name>

Goal:
<short statement>

Users:
<who this affects>

Scope:
<included work>

Out of scope:
<excluded work>

Decisions:
<important decisions and reasons>

Domain terms:
<terms to add or update>

Risks:
<risks and unknowns>

ADR updates:
<none | decisions to record with /record-adr>

Ready for:
<to-prd | to-issues | implement | prototype>
```

Do not write implementation code from this skill.
