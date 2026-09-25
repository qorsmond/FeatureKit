---
name: scaffold-exercises
description: Scaffold course, tutorial, workshop, or exercise directories with problem, solution, and explainer variants. Use when a repo needs structured learning content or exercise stubs.
metadata:
  featurekit-version: "0.10.2"
---

# Scaffold Exercises

Create structured exercise content for course or workshop repos.

This is optional and not part of the default FeatureKit product flow.

## Process

1. Read the user's exercise plan.
2. Inspect the repo for existing exercise naming and lint rules.
3. Use existing conventions if present.
4. If no convention exists, default to:
   - `exercises/<section-number>-<section-name>/<exercise-number>-<exercise-name>/`,
   - variants: `problem/`, `solution/`, `explainer/`.
5. Create only requested sections and variants.
6. Add non-empty `readme.md` files for every variant.
7. Run the repo's exercise/content lint command if one exists.

## Default Structure

```text
exercises/
  01-section-name/
    01.01-exercise-name/
      problem/readme.md
      solution/readme.md
      explainer/readme.md
```

For stubs, readme-only variants are enough unless the repo's lint rules require code files.

## Moving Existing Exercises

Use `git mv` for renames or renumbering so history is preserved.

## Do Not

- Do not assume AI Hero-specific tooling unless the repo contains it.
- Do not create empty placeholder files.
- Do not add `.gitkeep` files unless the repo already uses them.
- Do not rename existing exercises without confirming the numbering plan.

## Output

Report:

- sections created,
- exercises created,
- lint/check command run,
- any missing content the user still needs to fill in.
