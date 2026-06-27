---
name: setup-featurekit
description: Configure a target product repo for FeatureKit by discovering repo conventions and writing lightweight docs under docs/agents. Use once before other FeatureKit engineering skills, or when issue tracker, domain docs, stack commands, deployment notes, or workflow locations change. User-invoked setup skill.
disable-model-invocation: true
---

# Setup FeatureKit

Configure the current product repo so FeatureKit skills can operate without guessing.

This is prompt-driven setup. Explore first, present findings, confirm with the user, then write.

## 1. Explore

Inspect the repo before asking questions. Look for:

- `git remote -v` and `.git/config`,
- `AGENTS.md`, `CLAUDE.md`, and other agent guidance,
- existing `docs/agents/`,
- `CONTEXT.md`, `CONTEXT-MAP.md`, and `docs/adr/`,
- package manifests and scripts,
- test, lint, typecheck, build, and CI config,
- database, migration, auth, and deployment config,
- existing docs, specs, issue folders, or scratch folders.

If a fact is discoverable, do not ask the user for it.

## 2. Present Findings

Summarize:

- what guidance files exist,
- what stack and commands appear to be used,
- what issue tracker appears likely,
- whether domain docs already exist,
- where specs and handoffs seem to belong,
- what is missing.

## 3. Confirm Decisions One At A Time

Ask one section at a time. For each section, explain the choice, recommend a default, and wait for the answer.

### Issue Tracker

Record where issues live:

- GitHub Issues,
- GitLab Issues,
- Linear,
- Jira,
- local Markdown,
- other described workflow.

For local Markdown, default to `.scratch/<feature>/issue-N.md`.

### Domain Docs

Record whether the repo uses:

- single context: `CONTEXT.md` plus `docs/adr/`,
- multi-context: `CONTEXT-MAP.md` pointing to multiple contexts,
- another documented layout.

### Stack And Commands

Record:

- package manager,
- runtime,
- frontend framework if any,
- backend framework if any,
- database and migration approach if discoverable,
- lint, typecheck, test, build, and dev commands.

### Deployment

Record:

- hosting/deployment provider,
- environments,
- migration/deploy order,
- required manual checks,
- unknowns.

### Workflow Locations

Record where to save:

- PRDs,
- sliced issues,
- ADRs,
- prototypes,
- handoffs.

## 4. Draft Before Writing

Show a draft of:

- the `Agent skills` block for `AGENTS.md` or `CLAUDE.md`,
- each `docs/agents/*.md` file.

Let the user correct it before writing.

## 5. Write

Write or update:

- `docs/agents/issue-tracker.md`,
- `docs/agents/domain.md`,
- `docs/agents/stack.md`,
- `docs/agents/verification.md`,
- `docs/agents/deployment.md`,
- `docs/agents/workflow-locations.md`.

Update the existing instruction file:

- Prefer `AGENTS.md` if it exists.
- Else update `CLAUDE.md` if it exists.
- If neither exists, ask which one to create.

Use this block:

```markdown
## Agent skills

This repo is configured for FeatureKit. Repo-specific setup lives in `docs/agents/`.

- Issue tracker: see `docs/agents/issue-tracker.md`.
- Domain docs: see `docs/agents/domain.md`.
- Stack and commands: see `docs/agents/stack.md` and `docs/agents/verification.md`.
- Deployment: see `docs/agents/deployment.md`.
- Workflow locations: see `docs/agents/workflow-locations.md`.
```

If an `Agent skills` block already exists, update it in place. Do not duplicate it.

## Do Not

- Do not scaffold product code.
- Do not install dependencies.
- Do not overwrite unrelated project rules.
- Do not duplicate all rules into `CLAUDE.md`.
- Do not invent stack choices when the repo or user has not chosen them.

## Done

Tell the user which files were written and which skills now read them.
