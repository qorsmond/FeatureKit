---
name: grilling
description: Reusable interview loop for turning a fuzzy idea, plan, or design into clear decisions. Use when the model needs to ask focused questions before planning, PRD creation, or implementation.
metadata:
  featurekit-version: "0.4.0"
---

# Grilling

Interview until the work is clear.

## Rules

- Ask one question at a time.
- Recommend an answer with a short reason.
- Discover facts from available context instead of asking.
- Resolve decisions in dependency order.
- Capture scope, out of scope, assumptions, risks, and acceptance criteria.
- Capture security requirements and abuse cases when work touches auth, data, APIs, deployment, integrations, or untrusted input.
- Flag durable architecture decisions that should be recorded with `/record-adr`.
- Stop when the next concrete artifact can be produced.

## Output

Summarize:

- clarified goal,
- decisions,
- ADR follow-ups,
- out of scope,
- open risks,
- next recommended skill or action.
