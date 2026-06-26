---
name: plan-story
description: Turn an underspecified frontend story or ticket into a short, written, reviewable plan before any code is written. Use at the start of any new story, feature, or non-trivial change, or whenever the user says "plan this", "let's plan", asks to scope work, or starts describing a story to build. Interview-driven; do not write code from this skill.
---

# plan-story

Produce a written plan for a frontend story by interviewing the developer until the work is fully specified. **Do not write implementation code in this skill** — the output is a plan, not a feature.

## What to do

1. Read the story. Read `AGENTS.md` and explore the codebase for anything relevant (existing models, services, components, patterns).
2. Interview the developer to resolve every ambiguity:
   - Ask **one question at a time** and wait for the answer. Never dump multiple questions at once.
   - With each question, give **your recommended answer and a one-line reason**, grounded in what you found in the codebase.
   - If a question can be answered by **reading the code**, read it instead of asking.
   - Walk the decision tree in dependency order (resolve decisions that others depend on first).
3. Continue until there are no fuzzy areas left. Capture anything the developer marks out of scope.
4. Write the plan (format below).

## What not to do

- Don't write or scaffold implementation code.
- Don't ask things you can discover in the codebase.
- Don't ask several questions in one message.
- Don't invent new domain terms, enums, or models when existing ones fit — reuse them.
- Don't pad the plan with file-path manifests.

## Output format

A concise Markdown plan:

```
## Plan: <story title>

**Goal:** <1–2 sentences>
**Scope:** <what's included>
**Out of scope:** <what we're deliberately not doing>
**Approach:** <chosen design in plain language; decisions + reasons>
**Affected areas:** <named components/services/screens — not exhaustive file paths>
**Test plan:** <how we'll know it works>
**Open questions:** <ideally none>
```

End by reminding the developer to get a second set of eyes on the plan if the work type requires it (large story or unclear technical risk), ideally from someone with more experience in that area.
