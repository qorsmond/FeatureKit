# Tool Setup

Our skills and prompts ship inside **BridgeKit**, a dedicated Angular library we set up for this. Projects get them on install and update them on a version bump. There's nothing to clone or `git pull` per repo. CUI stays our component library; BridgeKit is the home for the agent tooling.

A **skill** is just a small `SKILL.md` file of instructions the agent follows, like `plan-story` or `frontend-review`. This page is the reference for what lives where, and how each tool actually picks these files up and runs them.

## What lives where

```
BridgeKit (a library we depend on)
  .agents/
    skills/                  our skills (plan-story, split-story, implement-slice, frontend-review, ...)
    prompts/                 reusable prompt snippets

each project
  AGENTS.md                  canonical project context + rules (the source of truth for that repo)
  CLAUDE.md                  one-line pointer to AGENTS.md
  docs/ai-workflow/          this workflow
```

`AGENTS.md` is the **single source of truth** for project context. `CLAUDE.md` only points at it — never copy rules into `CLAUDE.md`, or they'll drift. The `.agents/` skills and prompts arrive with BridgeKit, so every project that depends on it gets the same set.

## Updating

When we improve a skill, it's a normal PR to **BridgeKit**, reviewed like any other code. Every project picks the change up on the next BridgeKit version bump. No per-repo copy, no symlink to maintain, no drift between repos.

## How each tool uses the same files

The point of keeping everything as plain Markdown in `.agents/` and `AGENTS.md` is that the tools share the same assets. You don't maintain a different setup per tool.

- **Claude Code** — reads `CLAUDE.md` (which points to `AGENTS.md`) and picks the skills up from `.agents/skills/`.
- **Codex** — reads `AGENTS.md` natively and discovers skills from `.agents/skills/` (and `~/.agents/skills/`).
- **OpenCode** — reads `AGENTS.md` natively (and `CLAUDE.md` for compatibility) and discovers `SKILL.md` files from `.agents/skills/`.
- **Manual chat (any model, including local)** — open `AGENTS.md` and paste the relevant rules at the top of the session. To "run" a skill, open the matching `.agents/skills/<name>/SKILL.md` and paste it in, telling the model to follow it. The skill files are written to work this way — no tooling required.

To invoke a skill we call it by name, for example "plan this story with `plan-story`". Same instructions across every tool.

Keep harness-specific wiring thin. If a new tool comes along, the job is just: point it at `AGENTS.md`, point it at `.agents/skills/`, pick how you invoke a skill. The workflow itself doesn't change.

## Guardrails belong in git, not the tool

We want guardrails that hold no matter which agent wrote the code, so the baseline is **git-native**:

- **Pre-commit hooks** run lint, type, and tests before a commit lands.
- **Branch protection** on protected branches requires the checks to pass and an approving review before merge.

We don't have these wired up yet, so setting them up is part of bringing this in. Tool-specific guardrails (command-blocking hooks, sandbox/approval settings, per-tool permissions) are a nice extra layer, but they're not the foundation — set the git-native ones up first.
