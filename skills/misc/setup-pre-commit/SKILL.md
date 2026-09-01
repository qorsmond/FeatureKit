---
name: setup-pre-commit
description: Set up or improve pre-commit hooks for a product repo using its package manager and verification commands. Use when the user wants commit-time formatting, linting, typechecking, tests, Husky, lint-staged, or equivalent guardrails.
metadata:
  featurekit-version: "0.5.4"
---

# Setup Pre-Commit

Add repo-level commit guardrails without assuming a specific stack.

Apply the target repo's `Agent Operating Principles` before changing hooks, dependencies, or verification commands.

## Process

1. Read `docs/agents/verification.md`, package manifests, lockfiles, and existing hook config.
2. Detect the package manager:
   - `pnpm-lock.yaml` -> pnpm,
   - `yarn.lock` -> yarn,
   - `package-lock.json` -> npm,
   - `bun.lockb` or `bun.lock` -> bun.
3. Check whether the repo already uses Husky, Lefthook, pre-commit, lint-staged, or another hook runner.
4. Recommend the smallest setup that fits the repo. Prefer existing tooling over replacing it.
5. Ask before installing dependencies or changing hook behavior.
6. Add formatting/linting for staged files and run available typecheck/test commands when practical.
7. Verify the hook runner and staged-file command.

## Default Node Setup

If the repo has no hook tooling and uses Node, default to:

- Husky,
- lint-staged,
- Prettier if no formatter exists.

Hook content should use the detected package manager. Include only commands that exist in `package.json`.

Example:

```bash
pnpm lint-staged
pnpm typecheck
pnpm test
```

## Do Not

- Do not add dependencies without user confirmation.
- Do not replace an existing hook system without a reason.
- Do not invent `typecheck` or `test` scripts. Ask or omit missing commands.
- Do not commit automatically unless the user asks.

## Output

Report:

- hook runner chosen,
- files changed,
- commands added,
- verification run,
- commands intentionally omitted.
