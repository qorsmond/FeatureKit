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
- work tracker clues,
- database, security, deployment, and runtime config,
- existing docs, specs, or scratch folders.

If the answer is in the repo, the agent should discover it instead of asking you.

## Decisions Setup Asks You To Make

Setup groups these into short, clear rounds through the harness question UI when available:

1. Where work lives: GitHub Issues, GitLab Issues, Linear, Jira, local Markdown, or another workflow.
2. Where product/domain context lives: one `CONTEXT.md`, multiple contexts, or a new layout.
3. Which stack and verification commands the repo uses.
4. How deployment/runtime notes should be recorded.
5. How security notes should record auth, authorization, sensitive data, APIs, secrets, dependencies, CI/CD checks, deployment security, logging, and incident contacts.
6. Where PRDs, slices, ADRs, prototypes, and handoffs should be saved.

For teams that use delegated work, setup may also record an optional `docs/agents/orchestration.md` routing table. It is safe to omit: missing mappings, models, workers, authentication, or permissions fall back to direct work in the current session when capable and authorized; otherwise report the prerequisite. Prefer an available native worker or authenticated subscription CLI; do not add automatic API spend. Keep actual provider/model choices in that product-repo file; the shared workflow remains stack- and provider-neutral. Extend `docs/agents/verification.md` with applicable runtimes, platforms, commands, fixtures, devices or simulators, environment prerequisites, and hardware limits so validation can report missing evidence explicitly.

ADRs default to per-decision files in `docs/adr/` unless the repo already has a convention.

Each question should cover one decision, include its own short context, use the user's words and concrete outcomes, explain what the options cause, and recommend a default based on what the agent found. Uncertainty stays unresolved and is explained and re-asked in simpler language.

## Files Setup Writes

By default, setup writes:

- `docs/agents/work-tracker.md`
- `docs/agents/domain.md`
- `docs/agents/stack.md`
- `docs/agents/verification.md`
- `docs/agents/security.md`
- `docs/agents/deployment.md`
- `docs/agents/workflow-locations.md`

It also updates the existing `AGENTS.md` or `CLAUDE.md` with a short `Agent skills` section that points to these docs.

Setup also adds the `Agent Operating Principles` section so every new coding, refactoring, review, or verification session starts with explicit assumptions, simplicity, and surgical-change rules.

Setup also adds a short FeatureKit bootstrap note and planning gate. Agents should use `using-featurekit` at the start of FeatureKit sessions or after context compaction. Raw feature requests then begin the design-tree interview automatically, and production code waits until the complete written plan, PRD, or slice has been shown and approved through its final approval question.

## What Setup Should Not Do

Setup should not:

- scaffold product code,
- install dependencies,
- create a new app framework,
- overwrite existing project rules,
- duplicate all repo instructions into `CLAUDE.md`,
- make stack choices that belong to the product.

## Rerunning Setup

Rerun `/setup-featurekit` only when the repo's workflow changes: a new work tracker, new security posture, new deployment platform, new verification commands, or a changed docs layout.

For small edits, update `docs/agents/*.md` directly.

## Series Navigation

- Previous: [Install](./01-install.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Main Flow](./03-main-flow.md)
