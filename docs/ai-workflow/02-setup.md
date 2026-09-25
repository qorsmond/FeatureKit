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

Setup enables orchestration through the repo's persistent agent instructions. The orchestrator chooses available models, backends and effort at runtime; you do not need to provide a model list. Setup asks only about unresolved human constraints such as allowed providers, spending or an explicit preference. An optional `docs/agents/orchestration.md` stores those constraints or deliberate overrides; its absence does not disable delegation. Unavailable workers, authentication or permissions fall back to capable, authorized direct work or a stated prerequisite. Prefer existing authenticated routes and do not add automatic API spend. Extend `docs/agents/verification.md` with applicable runtimes, platforms, commands, fixtures, devices or simulators, environment prerequisites, and hardware limits so validation can report missing evidence explicitly.

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

Setup also adds the FeatureKit bootstrap, planning gate, explicit delegation instruction and live-routing feedback. Agents use `using-featurekit` at session start and after context compaction, then `orchestrate-work` for substantive work. You give ordinary requests; the orchestrator chooses worker models and explains the choices. Raw feature requests begin the design-tree interview automatically, and production code waits for final approval of the written plan, PRD or slice.

JEV is separate from repo setup. `/setup-featurekit` never asks for an API key, writes one to the repo, enables provider calls, or grants source/transcript sharing. Installations remain on the normal route unless the user configures metadata-only `shadow` routing as described in [Orchestration](./09-orchestration.md); source review and Claude transcript compaction require their own explicit scopes.

## What Setup Should Not Do

Setup should not:

- scaffold product code,
- install dependencies,
- create a new app framework,
- overwrite existing project rules,
- duplicate all repo instructions into `CLAUDE.md`,
- make stack choices that belong to the product,
- store credentials or silently enable JEV/provider integrations.

## Rerunning Setup

Rerun `/setup-featurekit` when a FeatureKit upgrade needs a new persistent instruction or the repo's workflow changes. Existing choices are preserved; setup drafts only the missing or changed instructions and affected docs rather than repeating the full interview. Updating installed skills alone does not rewrite the product repo's `AGENTS.md`.

For small edits, update `docs/agents/*.md` directly.

## Series Navigation

- Previous: [Install](./01-install.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Main Flow](./03-main-flow.md)
