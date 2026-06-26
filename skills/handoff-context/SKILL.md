---
name: handoff-context
description: Write a short handoff note so work can continue cleanly in a new session or with another developer. Use when a session is getting long, context is filling up, work needs to pause, or the user says "hand this off", "save context", "pick up later", or "summarize where we are". Produces a compact note, not a full history dump.
---

# handoff-context

Capture just enough context for a fresh session or another developer to continue without re-reading the whole conversation. Keep it short — this is a handoff, not a transcript.

## What to do

1. Identify the active goal and where things stand right now.
2. Pull out only what the next session needs to resume: the objective, what's done, what's left, what changed, and any decisions or gotchas.
3. Write the note (format below) to a file the next session can open.

## What not to do

- Don't dump the whole conversation or restate everything.
- Don't include resolved tangents or dead ends (unless a dead end is a warning worth keeping).
- Don't lose the link to the plan — reference it, don't re-paste it.

## Output format

```
## Handoff: <task>

**Objective:** <what we're trying to achieve>
**Plan:** <link/reference to the written plan>
**Done so far:** <bullet list>
**Next steps:** <bullet list, in order>
**Changed:** <files/areas touched so far, named>
**Watch out for:** <gotchas, decisions, anything non-obvious>
**Suggested next skill:** <e.g. implement-slice, frontend-review>
```

Tell the developer where the note was written so they can open it in the next session.
