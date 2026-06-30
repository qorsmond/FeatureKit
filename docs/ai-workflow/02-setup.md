# Setup

Run setup once per product repo before using the other engineering skills.

```text
/setup-featurekit
```

Setup teaches FeatureKit how this repo works. It does not choose your stack for you. It records the repo's actual conventions so the other skills can follow them.

## What Setup Discovers

The agent checks the repo for:

- `AGENTS.md` and `CLAUDE.md`,
- existing `docs/agents/` files,
- `CONTEXT.md` and ADRs,
- package manifests and common verification commands,
- issue tracker clues,
- database, deployment, and runtime config,
- existing docs, specs, or scratch folders.

If the answer is in the repo, the agent should discover it instead of asking you.

## Decisions Setup Asks You To Make

Setup walks through these one at a time:

1. Where issues live: GitHub, GitLab, Linear, Jira, local Markdown, or another workflow.
2. Where product/domain context lives: one `CONTEXT.md`, multiple contexts, or a new layout.
3. Which stack and verification commands the repo uses.
4. How deployment/runtime notes should be recorded.
5. Where PRDs, issues, ADRs, prototypes, and handoffs should be saved.

ADRs default to per-decision files in `docs/adr/` unless the repo already has a convention.

The agent should recommend defaults based on what it found.

## Files Setup Writes

By default, setup writes:

- `docs/agents/issue-tracker.md`
- `docs/agents/domain.md`
- `docs/agents/stack.md`
- `docs/agents/verification.md`
- `docs/agents/deployment.md`
- `docs/agents/workflow-locations.md`

It also updates the existing `AGENTS.md` or `CLAUDE.md` with a short `Agent skills` section that points to these docs.

Setup also adds the `Agent Operating Principles` section so every new coding, refactoring, review, or verification session starts with explicit assumptions, simplicity, and surgical-change rules.

## What Setup Should Not Do

Setup should not:

- scaffold product code,
- install dependencies,
- create a new app framework,
- overwrite existing project rules,
- duplicate all repo instructions into `CLAUDE.md`,
- make stack choices that belong to the product.

## Rerunning Setup

Rerun `/setup-featurekit` only when the repo's workflow changes: a new issue tracker, new deployment platform, new verification commands, or a changed docs layout.

For small edits, update `docs/agents/*.md` directly.

## Series Navigation

- Previous: [Install](./01-install.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Main Flow](./03-main-flow.md)
