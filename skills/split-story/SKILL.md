---
name: split-story
description: Break a large or multi-part frontend story into independent vertical slices, each its own small PR. Use after a plan exists and the work is too big for one PR, or when the user says "split this", "break this down", "slice this", or asks how to divide a story into tickets. Works from an approved plan.
---

# split-story

Decompose an approved plan into **vertical slices** — each cutting through every layer (component, facade method, state slice, repository call, types, test) to deliver one small piece of working, reviewable, testable value.

## What to do

1. Start from the written plan. If there's no plan yet, run `plan-story` first.
2. Identify the smallest sequence of slices where each one:
   - delivers real, user-visible (or independently verifiable) value,
   - is independently understandable by a reviewer,
   - is independently testable,
   - fits in a PR under 400 lines.
3. Order them so each builds on the last, and note dependencies.
4. Describe each slice by **behavior and outcome**, not by files to edit.

## What not to do

- Don't slice horizontally ("all types first, all UI later") — nothing works until the end.
- Don't pin slices to file paths; they go stale and pre-decide the solution.
- Don't create slices that can't be tested without another slice existing first.
- Don't produce one giant slice that's the whole story renamed.
- Fold small refactors into the slice that needs them, or make a refactor an explicit slice with its own tests.

## Output format

An ordered list:

```
### Slice 1: <one-line goal>
- Acceptance criteria: <how we know it's done>
- Depends on: <none | slice N>

### Slice 2: <one-line goal>
...
```

Each slice becomes a ticket/PR. No file-path manifests.
