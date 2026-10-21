---
name: setup-featurekit
description: Initialize or refresh a target product repo for FeatureKit by persisting session bootstrap and automatic orchestration in its agent instructions and recording repo conventions under docs/agents. Use when the user asks to set up or refresh FeatureKit, after an upgrade, or when repo conventions change; writes only after approval.
metadata:
  featurekit-version: "0.13.0"
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
- `CONTEXT.md`, `CONTEXT-MAP.md` or another glossary, and ADRs (`docs/adr/` or elsewhere) with their naming, template and statuses,
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

Record where work lives; ask only if the repo does not show it:

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

When domain terms do not go in `CONTEXT.md`, record where as a line in `docs/agents/domain.md`, such as ``Glossary: `docs/agents/domain.md#language`; no `CONTEXT.md` ``.

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

Skills and the knowledge index read these labelled lines in `docs/agents/workflow-locations.md`, one per line with its value, as list items or plain lines; prose and tables may surround them. A missing line keeps the skill's default. For example:

```markdown
- ADR directory: `docs/decisions/`, listed in its README
- ADR filename: `NNNN-title.md`, numbered after the highest on `origin/main`
- ADR template: `docs/decisions/0000-template.md`
- ADR statuses: Proposed, Accepted, Superseded; work built on a Proposed ADR follows it
- Handoffs: `docs/agent-notes/<feature>/handoff.md`, updated in place
- Prototypes: `.scratch/prototypes/<question>/`, never committed
```

### Small Fixes

By default every production edit waits for an approved written plan. Ask whether a small fix the user asks for directly may skip it; the default is no. If the user opts in, add an `Exemption:` line under the block's plan rule, with the user's limits, such as: `Exemption: a small fix the user asks for directly (a few lines in one place that change no requirement, contract, saved format, security behaviour or ADR) may proceed without a written plan; its checks still run.`

### Knowledge Index (Optional)

Offer the knowledge index when finding code by search is costly, such as a large or unfamiliar codebase. It is a derived local index of Python code and of Markdown/RST knowledge (docs, ADRs, lessons): no services, model calls, or new dependencies. In trials on large Python repositories, its brief made impact analyses complete at about the same cost. If the user opts in, run `python3 <using-featurekit skill directory>/scripts/kx.py build` from the repo root, add `.kx/` to the repo's ignore file, and record `Knowledge index: enabled (.kx/)` in `docs/agents/workflow-locations.md`. The Claude Code plugin's hooks then deliver the index automatically and stay inert in repos without `.kx/`. For a skills install, ask before adding the setup guide's hook entries to the repo's `.claude/settings.json` (Claude Code) or `.codex/hooks.json` (Codex).

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

Where the repo already documents a topic authoritatively, such as its verification commands or deployment, summarise it in a few lines and link to it; never restate or override it.

Start each `docs/agents/*.md` file with OKF-style frontmatter so agents and the knowledge index can see its trust and freshness: `type: agent-guide`, `title`, `description`, `status: stable`, and `verified: {by: "human:<git user.name>", at: "<ISO date>"}` for content the user approved. Mark replaced guidance `status: deprecated` with `superseded_by: <path>` instead of deleting it while others still link to it.

Write `docs/agents/orchestration.md` only when repo-specific constraints or explicit overrides are useful and confirmed. Its absence leaves automatic runtime selection enabled. If an existing configuration already owns those choices, reference it rather than duplicating the values.

Update the existing instruction file:

- Prefer `AGENTS.md` if it exists.
- Else update `CLAUDE.md` if it exists.
- If neither exists, ask which one to create.

Use this block:

```markdown
## Agent skills

This repo is configured for FeatureKit. Repo-specific setup lives in `docs/agents/`.

- Start sessions with `using-featurekit`; use the smallest matching skill.
- No production code before explicit intent and final approval of a written plan, PRD, or slice.
- Treat `docs/agents/`, accepted ADRs, and the approved artifact as constraints.
- Use `orchestrate-work` for substantive routing and show observed routes honestly. The primary owns decisions, integration, evidence, and completion.
- Use `validate-feature` for runtime proof; unavailable proof stays a gap.

## Agent Operating Principles

- Think before coding: state assumptions, uncertainty, alternatives, and material tradeoffs.
- Simplicity first: make the smallest change that solves the approved request; add no speculative flexibility.
- Surgical changes: preserve user work, match existing style, and touch only lines required by scope.
```

If an `Agent skills` or `Agent Operating Principles` block already exists, update it in place. A section with the same purpose under another heading, such as `## Operating principles`, is that block: merge into it and rename it to the block's heading, so reruns update it and never duplicate it.

## Do Not

- Do not scaffold product code.
- Do not install dependencies.
- Do not overwrite unrelated project rules.
- Do not duplicate all rules into `CLAUDE.md`.
- Do not invent stack choices when the repo or user has not chosen them.

## Done

Verify the instruction blocks were updated in place without duplicates and required skills are installed. Tell the user which files were written and that future sessions load the saved bootstrap and orchestration policy without a repeated prompt or model roster. If the host cannot load repo instructions or expose workers, report that limitation. A setup write is not a live delegation test; use the guide's optional read-only smoke test when requested.
