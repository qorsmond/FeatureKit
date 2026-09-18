---
name: setup-featurekit
description: Initialize or refresh a target product repo for FeatureKit by persisting session bootstrap and automatic orchestration in its agent instructions and recording repo conventions under docs/agents. Use once before engineering work, after a workflow upgrade, or when repo conventions change. User-invoked setup skill.
disable-model-invocation: true
metadata:
  featurekit-version: "0.6.2"
---

# Setup FeatureKit

Configure the current product repo so FeatureKit skills can operate without guessing.

This is prompt-driven setup. Explore first, present findings, confirm with the user, then write.

For an already configured repo, refresh only missing or outdated FeatureKit instructions and affected setup docs. Preserve settled choices and unrelated rules; do not repeat the full setup interview. Honor an explicitly limited refresh scope: a request to update only the `Agent skills` block does not authorize adding other setup sections. Show the focused patch for approval unless the user already authorized those exact writes.

## 1. Explore

Inspect the repo before asking questions. Look for:

- `git remote -v` and `.git/config`,
- `AGENTS.md`, `CLAUDE.md`, and other agent guidance,
- existing `docs/agents/`,
- `CONTEXT.md`, `CONTEXT-MAP.md`, and `docs/adr/`,
- package manifests and scripts,
- test, lint, typecheck, build, and CI config,
- target runtimes/platforms, simulators/emulators/devices, hardware/native integrations and existing runtime tests,
- existing worker/model configuration and advertised native tools; inspect installed external CLI help/status only for intended backends, without reading secrets,
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

### Verification And Runtime

Extend `docs/agents/verification.md` with acceptance-to-evidence guidance using `validate-feature`: commands and fixtures, target runtimes/platforms, simulator/emulator vs device requirements, environment prerequisites, hardware limitations, and manual procedures/evidence. Record known unavailable checks. Discover affected Android/iOS, web, service or desktop targets instead of treating a browser as the universal runtime. A build alone does not prove a feature.

### Automatic Orchestration And Optional Constraints

Persist the shared `orchestrate-work` policy in the repo's agent instructions by default. It delegates suitable bounded work and selects the actual available model/backend/effort at runtime; the user does not need to select models or repeat an orchestration prompt each session. Discover host capabilities rather than asking the user for a model catalogue. Ask only about unresolved human constraints such as allowed providers, spending or a deliberate model preference.

Create `docs/agents/orchestration.md` only for useful repo-specific constraints or explicit overrides. Prefer stable constraints to a snapshot of today's model list. When the user deliberately pins a route, record verified choices:

| Capability | Backend / mechanism | Model or alias / effort | Preference | Auth / usage pool | Tools / restrictions |
| --- | --- | --- | --- | --- | --- |
| routine / standard / deep | Available native worker or installed CLI | Actual supported selection, or unknown | User's relative cost preference | Verified subscription/API mode; pool if known | Context, permissions, runtime and data limits |

The shared concurrency default is two, within host limits; record only needed overrides and provider restrictions. Do not copy placeholder values as usable routes or freeze automatically discovered models into mandatory pins. An absent mapping does not disable orchestration: runtime discovery still applies. One model, one provider and direct execution remain valid when appropriate. Prefer existing authenticated subscriptions; do not enable API spend, install a backend, change global settings or expose secrets as part of discovery. Unknown cost/model/auth fields remain unknown; an unverified external billing route is not ready to run.

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

Write `docs/agents/orchestration.md` only when repo-specific constraints or explicit overrides are useful and confirmed. Its absence leaves automatic runtime selection enabled. If an existing configuration already owns those choices, reference it rather than duplicating the values.

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
- Work distribution: use `orchestrate-work` for substantive work. Delegate suitable bounded tasks to available workers/subagents and select their model/backend/effort at runtime by capability, risk and known cost; use direct tools when sufficient. Follow `docs/agents/orchestration.md` if present. The primary owns integration and acceptance. Preserve planning and permission gates.
- Routing visibility: show live destinations, requested versus reported model/effort, worker IDs, retries and validation outcomes; label unavailable metadata honestly.
- Feature evidence: use `validate-feature` and `docs/agents/verification.md` for runtime/platform proof and explicit gaps; use `verify-tests` for test quality.
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

Verify the instruction blocks were updated in place without duplicates and required skills are installed. Tell the user which files were written and that future sessions load the saved bootstrap and orchestration policy without a repeated prompt or model roster. If the host cannot load repo instructions or expose workers, report that limitation. A setup write is not a live delegation test; use the guide's optional read-only smoke test when requested.
