# Splitting Work into Slices

Large stories get broken into **vertical slices** before implementation. The tool is the `split-story` skill. This page explains what a good slice looks like.

## What "vertical slice" means

A vertical slice cuts through every layer needed to deliver one small, real piece of value — component, facade method (`*.facade.service.ts`), state slice, repository call, types, and a test — end to end. It's the opposite of a horizontal slice ("do all the types this week, all the UI next week"), which leaves nothing actually working until the end.

Each slice should be:

- **Independently understandable** — a reviewer gets it without reading the other slices.
- **Independently reviewable** — it's its own PR, under 400 lines.
- **Independently testable** — it has its own meaningful tests and can be verified on its own.

## Don't pin tickets to file paths

Describe a slice by **behavior and outcome**, not by a list of files to edit. File paths go stale the moment someone renames or moves something, and they push the implementer toward a predetermined solution instead of the best one. Name the components/services involved if it helps, but the slice is defined by what it should *do*.

## Good vs bad slices

Story: *"Add filtering to the bookings list."*

**Bad slicing (horizontal):**
- Slice 1: Add all the filter types and interfaces.
- Slice 2: Build the filter UI.
- Slice 3: Wire up the facade, repository, and state.

Nothing works until slice 3. Reviewers can't judge slice 1 in isolation, and a wrong type decision isn't caught until the end.

**Good slicing (vertical):**
- Slice 1: Filter the list by **status** only — control, state slice, facade method, repository `status` param, types, tests. Shippable on its own.
- Slice 2: Add **date-range** filtering, combinable with status.
- Slice 3: **Persist** active filters across navigation.

Each slice delivers working, reviewable, testable behavior. If we stop after slice 1, status filtering still works.

## Bad slice smells

- "Refactor X" with no user-visible outcome (fold refactors into the slice that needs them, or make them an explicit standalone slice with its own tests).
- A slice that can't be tested without another slice existing first.
- A slice that's really the whole story wearing a hat (if every slice depends on every other, you haven't sliced).
- A PR creeping past 400 lines — that's a sign the slice was too big; split it.

## Output

`split-story` produces a short, ordered list of slices. For each: a one-line **goal**, its **acceptance criteria**, and any **dependency** on an earlier slice. These become your tickets/PRs. No file-path manifests.
