---
name: handoff
description: Write a compact handoff note so work can continue in a fresh session, another agent, or another developer. Use when context is long, work is pausing, a prototype result needs to return to planning, or a task moves between tools.
disable-model-invocation: true
metadata:
  featurekit-version: "0.1.2"
---

# Handoff

Capture the current state without dumping the whole conversation.

## Process

1. Identify the active objective.
2. Link to the PRD, issue, prototype, or plan.
3. Summarize what is done.
4. List the next steps in order.
5. Record changed files or areas.
6. Capture decisions, risks, gotchas, and relevant ADRs.
7. Recommend `/record-adr` for unrecorded durable architecture decisions.
8. Write the handoff to the configured location, defaulting to `docs/handoff/<slug>.md`.

## Output File Format

```markdown
# Handoff: <task>

Objective:
<what we are trying to achieve>

Plan:
<link to PRD, issue, or plan>

Done:
- <completed item>

Next:
- <next step>

Changed:
- <files or areas>

Decisions:
- <important decision>

ADRs:
- <governing ADRs or pending /record-adr follow-up>

Watch out for:
- <gotcha>

Suggested next skill:
<skill>
```

Tell the user where the handoff was written.
