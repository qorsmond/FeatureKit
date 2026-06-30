---
name: prototype
description: Build or plan a disposable prototype to answer a concrete product, UX, architecture, state, performance, or integration uncertainty before committing to implementation. Use explicitly when discussion cannot settle a decision. User-invoked; prototype output is not production code.
disable-model-invocation: true
metadata:
  featurekit-version: "0.1.0"
---

# Prototype

Answer a concrete uncertainty with disposable work.

## Process

1. State the question the prototype must answer.
2. Define the cheapest artifact that can answer it.
3. Read relevant ADRs when the question touches architecture.
4. Confirm what production code must not be touched.
5. Build or outline the prototype in an isolated location.
6. Run only the checks needed to trust the result.
7. Summarize what was learned.
8. Recommend `/record-adr` if the result settles a durable architectural decision.
9. Recommend the next step in the main flow.

## Good Prototype Questions

- Will this interaction make sense to users?
- Is this data model enough for the workflow?
- Can this integration return the data we need?
- Is this performance risk real?
- Which of these UI directions is clearer?

## Output

```markdown
Question:
<what we needed to learn>

Prototype:
<what was built or tested>

Result:
<what we learned>

Decision:
<recommended product or technical decision>

ADR follow-up:
<none | decision to record with /record-adr>

Discard:
<what temporary files or code should not ship>

Next:
<return to grill-with-docs | to-prd | implement | handoff>
```
