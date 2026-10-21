# Setup

Run setup once per product repo before using the other engineering skills.

```text
/setup-featurekit
```

You can also ask an agent to set up or refresh FeatureKit; it loads the same skill. Setup teaches FeatureKit how this repo works. It does not choose your stack for you. It records the repo's actual conventions so the other skills can follow them.

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
7. Whether a small fix you ask for directly may skip the written plan. The default is no; if you opt in, setup records the exemption and its limits in the `Agent skills` block.

Setup does not ask what it can find in the repo, such as a work tracker its remote or docs already show.

Setup enables orchestration through the repo's persistent agent instructions. The orchestrator chooses available models, backends and effort at runtime; you do not need to provide a model list. Setup asks only about unresolved human constraints such as allowed providers, spending or an explicit preference. An optional `docs/agents/orchestration.md` stores those constraints or deliberate overrides; its absence does not disable delegation. Unavailable workers, authentication or permissions fall back to capable, authorized direct work or a stated prerequisite. Prefer existing authenticated routes and do not add automatic API spend. Extend `docs/agents/verification.md` with applicable runtimes, platforms, commands, fixtures, devices or simulators, environment prerequisites, and hardware limits so validation can report missing evidence explicitly.

ADRs default to per-decision files in `docs/adr/` unless the repo already has a convention.

Setup records each location the skills need as a labelled line, so `record-adr`, `adr-guidance`, `handoff`, `prototype` and the knowledge index follow the repo instead of their defaults. In `docs/agents/workflow-locations.md`, as list items or plain lines:

```markdown
- ADR directory: `docs/decisions/`, listed in its README
- ADR filename: `NNNN-title.md`, numbered after the highest on `origin/main`
- ADR template: `docs/decisions/0000-template.md`
- ADR statuses: Proposed, Accepted, Superseded; work built on a Proposed ADR follows it
- Handoffs: `docs/agent-notes/<feature>/handoff.md`, updated in place
- Prototypes: `.scratch/prototypes/<question>/`, never committed
```

In `docs/agents/domain.md`, a `Glossary:` line names where domain terms go when it is not `CONTEXT.md`, for example ``Glossary: `docs/agents/domain.md#language`; no `CONTEXT.md` ``. A missing line keeps the default: `docs/adr/`, `YYYY-MM-DD-short-decision-title.md`, `record-adr`'s own format and statuses, `docs/handoff/<slug>.md`, `.scratch/prototypes/<slug>/` and `CONTEXT.md`. Rerun setup after an upgrade to add the lines to an existing repo.

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

Where the repo already documents a topic, such as its verification commands or deployment, the page summarises it in a few lines and links to it rather than restating it.

It also updates the existing `AGENTS.md` or `CLAUDE.md` with a short `Agent skills` section that points to these docs.

Setup also adds the `Agent Operating Principles` section so every new coding, refactoring, review, or verification session starts with explicit assumptions, simplicity, and surgical-change rules.

Setup also adds the FeatureKit bootstrap, planning gate, explicit delegation instruction and live-routing feedback. Agents use `using-featurekit` at session start and after context compaction, then `orchestrate-work` for substantive work. You give ordinary requests; the orchestrator chooses worker models and explains the choices. Raw feature requests begin the design-tree interview automatically, and production code waits for final approval of the written plan, PRD or slice.

Setup can also enable the optional knowledge index for large or unfamiliar codebases. It is a derived local index (`.kx/`, ignored by git) of Python code and of Markdown/RST docs, ADRs, and lessons, built by a standard-library script with no services or model calls. When it is enabled, two hooks deliver it without relying on the agent to remember: a short pointer when a prompt names code, and a symbol's callers, tests, and governing decisions when the agent searches for it or reads a governed file. Each item appears once per session, adds about 150 tokens, and costs tens of milliseconds; in repositories without `.kx/` the hooks exit immediately. The Claude Code plugin includes them. With a skills install, add them to the repo so they apply to this project only.

For Claude Code, add them to `.claude/settings.json`. The paths use `$CLAUDE_PROJECT_DIR` because hooks run from the session's working directory, which may be a subfolder:

```json
{
  "hooks": {
    "UserPromptSubmit": [{"hooks": [{"type": "command", "command": "[ -f \"$CLAUDE_PROJECT_DIR/.kx/index.db\" ] || exit 0; exec python3 \"$CLAUDE_PROJECT_DIR/.agents/skills/using-featurekit/scripts/kx.py\" hook prompt", "timeout": 5}]}],
    "PostToolUse": [{"matcher": "Grep|Bash|Read", "hooks": [{"type": "command", "command": "[ -f \"$CLAUDE_PROJECT_DIR/.kx/index.db\" ] || exit 0; exec python3 \"$CLAUDE_PROJECT_DIR/.agents/skills/using-featurekit/scripts/kx.py\" hook tool", "timeout": 5}]}]
  }
}
```

For Codex, add them to the repo's `.codex/hooks.json`, or to `~/.codex/hooks.json` for every repo, and trust them in `/hooks`:

```json
{
  "hooks": {
    "UserPromptSubmit": [{"hooks": [{"type": "command", "command": "[ -f .kx/index.db ] || exit 0; exec python3 .agents/skills/using-featurekit/scripts/kx.py hook prompt", "timeout": 5}]}],
    "PostToolUse": [{"matcher": "Bash", "hooks": [{"type": "command", "command": "[ -f .kx/index.db ] || exit 0; exec python3 .agents/skills/using-featurekit/scripts/kx.py hook tool", "timeout": 5}]}]
  }
}
```

The index covers Python and Markdown/RST files that git tracks or would track, so new docs count before they are committed. A decision links to the code it governs through `sources` frontmatter or by naming a Python file in backticks, by path or, for a script, by its command name.

Setup also gives each `docs/agents/` file OKF-style frontmatter (`type: agent-guide`, `status`, `verified` with your git user name, and `superseded_by` when replaced), so agents can tell current guidance from outdated guidance.

## What Setup Should Not Do

Setup should not:

- scaffold product code,
- install dependencies,
- create a new app framework,
- overwrite existing project rules,
- duplicate all repo instructions into `CLAUDE.md`,
- make stack choices that belong to the product,
- store credentials or silently enable provider integrations.

## Rerunning Setup

Rerun `/setup-featurekit` when a FeatureKit upgrade needs a new persistent instruction or the repo's workflow changes. Existing choices are preserved; setup drafts only the missing or changed instructions and affected docs rather than repeating the full interview. A section with the same purpose under another heading, such as `## Operating principles`, is merged and renamed in place, so a rerun never adds a duplicate. Updating installed skills alone does not rewrite the product repo's `AGENTS.md`.

For small edits, update `docs/agents/*.md` directly.

## Series Navigation

- Previous: [Install](./01-install.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Main Flow](./03-main-flow.md)
