---
name: prototype
description: Build or plan a disposable prototype to answer a concrete product, UX, architecture, state, performance, or integration uncertainty before committing to implementation. Use explicitly when discussion cannot settle a decision. User-invoked; prototype output is not production code.
disable-model-invocation: true
---

# Prototype

Answer a concrete uncertainty with disposable work.

## Process

1. State the question the prototype must answer.
2. Define the cheapest artifact that can answer it.
3. Confirm what production code must not be touched.
4. Build or outline the prototype in an isolated location.
5. Run only the checks needed to trust the result.
6. Summarize what was learned.
7. Recommend the next step in the main flow.

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

Discard:
<what temporary files or code should not ship>

Next:
<return to grill-with-docs | to-prd | implement | handoff>
```
