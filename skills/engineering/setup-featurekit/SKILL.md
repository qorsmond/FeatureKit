---
name: setup-featurekit
description: Configure a target product repo for FeatureKit by discovering repo conventions and writing lightweight docs under docs/agents. Use once before other FeatureKit engineering skills, or when work tracker, domain docs, stack commands, security notes, deployment notes, or workflow locations change. User-invoked setup skill.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.3"
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
- database, migration, auth, security, secrets, CI/CD, and deployment config,
- existing docs, specs, work folders, or scratch folders.

If a fact is discoverable, do not ask the user for it.

## 2. Present Findings

Summarize:

- what guidance files exist,
- what stack and commands appear to be used,
- what work tracker appears likely,
- whether domain docs already exist,
- what auth, security, API, secrets, and deployment conventions appear to exist,
- where specs and handoffs seem to belong,
- what is missing.

## 3. Confirm Decisions In Clear Rounds

Use the harness's structured question tool when available. Ask up to its current limit, with one clear decision per question. Put one or two short context sentences inside every question so it explains the current situation and why the answer matters without relying on earlier commentary. Use the user's words and concrete outcomes, recommend a default, and make each option explain its practical effect and any material consequence. Treat uncertainty as unresolved and re-ask that decision in simpler language without discarding other settled answers. If no question tool exists, ask no more than three numbered questions per round. Wait for the answers before continuing.

### Work Tracker

Record where work lives:

- GitHub Issues,
- GitLab Issues,
- Linear,
- Jira,
- local Markdown,
- other described workflow.

For local Markdown, default to `.scratch/<feature>/slice-N.md`.

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

### Security

Record:

- authentication and session model,
- authorization, roles, tenant boundaries, and ownership rules,
- sensitive data classes, privacy constraints, retention, and audit needs,
- API styles, public/internal boundary, webhook and third-party API patterns,
- secrets source, local secret handling, and rotation expectations,
- dependency, package, container, and artifact integrity policy,
- CI/CD security tooling, secret scanning, audits, SAST, dependency checks, and manual security checks,
- deployment environments, IAM/service accounts, security headers, CORS, TLS, cookies, and debug settings when discoverable,
- logging, alerting, incident response contacts, and vulnerability handling process,
- known security ADRs and security decisions that need `/record-adr`.

### Workflow Locations

Record where to save:

- PRDs,
- implementation slices,
- ADRs, including the ADR directory and filename/status convention,
- prototypes,
- handoffs.

## 4. Draft Before Writing

Show a draft of:

- the `Agent skills` and `Agent Operating Principles` blocks for `AGENTS.md` or `CLAUDE.md`,
- each `docs/agents/*.md` file.

Let the user correct it before writing.

## 5. Write

Write or update:

- `docs/agents/work-tracker.md`,
- `docs/agents/domain.md`,
- `docs/agents/stack.md`,
- `docs/agents/verification.md`,
- `docs/agents/security.md`,
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

- Session bootstrap: use `using-featurekit` at the start of FeatureKit sessions or after context compaction. Raw feature requests begin a design-tree interview automatically.
- Planning gate: no production code starts until a written plan, PRD, or slice has been presented and approved through its final approval question. Earlier interview answers and accepted recommendations are not approval.
- Work tracker: see `docs/agents/work-tracker.md`.
- Domain docs: see `docs/agents/domain.md`.
- Architectural decisions: see the ADR location in `docs/agents/workflow-locations.md`.
- Stack and commands: see `docs/agents/stack.md` and `docs/agents/verification.md`.
- Security: see `docs/agents/security.md`.
- Deployment: see `docs/agents/deployment.md`.
- Workflow locations: see `docs/agents/workflow-locations.md`.

## Agent Operating Principles

Every new session should follow these principles before coding, refactoring, or verification work.

### Think before coding

- State assumptions explicitly before implementing.
- Do not hide confusion. If something is unclear, stop, name what is confusing, and ask.
- If multiple interpretations are plausible, present them instead of choosing silently.
- Surface important tradeoffs, including simpler approaches and reasons to push back.

### Simplicity first

- Write the minimum code that solves the requested problem.
- Do not add features, abstractions, flexibility, or configurability that were not requested.
- Do not add error handling for impossible scenarios.
- If a solution is much larger than it needs to be, simplify it before handing off.

### Surgical changes

- Touch only the files and lines required by the user's request.
- Do not improve adjacent code, comments, formatting, or naming unless it is necessary for the requested change.
- Match existing style, even where another style would be preferable.
- Mention unrelated dead code or cleanup opportunities instead of deleting them.
- Remove only imports, variables, functions, or files made unused by your own change.
- Every changed line should trace directly to the user's request.
```

If an `Agent skills` or `Agent Operating Principles` block already exists, update it in place. Do not duplicate it.

## Do Not

- Do not scaffold product code.
- Do not install dependencies.
- Do not overwrite unrelated project rules.
- Do not duplicate all rules into `CLAUDE.md`.
- Do not invent stack choices when the repo or user has not chosen them.

## Done

Tell the user which files were written and which skills now read them.
