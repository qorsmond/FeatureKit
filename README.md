# FeatureKit

Portable agent skills for building real full-stack products with coding agents.

FeatureKit is a private, framework-agnostic skill harness. It follows the Matt Pocock-style pattern: small composable skills, installed with the open `skills` CLI, then run from Codex, Claude Code, OpenCode, generic agents, or local LLMs.

Current release: see [VERSION](./VERSION) and [CHANGELOG.md](./CHANGELOG.md).

## FeatureKit In One Minute

**The problem.** Coding agents write code fast, but on their own they often:

- start before the feature is clear;
- drift out of scope;
- say "done" without proof;
- forget security;
- spend expensive-model tokens on easy work.

**The idea.** FeatureKit is a set of plain-Markdown skills you install into your product repo. They give any coding agent (Codex, Claude Code, OpenCode, or a local model) the disciplined workflow a careful senior engineer follows. There is no new CLI, server, or framework to adopt, and FeatureKit never picks your stack.

**How it works.** You describe a feature in plain words. The agent takes it through the same steps every time:

```text
idea → interview → written plan → small slices → your approval
     → build (tests first) → prove it works → right-sized review → ship or hand off
```

1. **Clarify.** The agent interviews you one decision at a time, grounded in your repo's docs, and explains what each choice means.
2. **Plan.** Your answers become a written plan or PRD, split into small vertical slices. No production code is written until you approve the plan.
3. **Build.** One slice at a time, with tests first where they fit and security guidance applied automatically. The agent follows your repo's conventions and architecture decisions.
4. **Prove.** Every acceptance criterion is checked against real evidence. A passing build is not proof, and missing device or platform checks are reported as gaps, not glossed over.
5. **Review.** The review is sized to the risk. A small docs change needs checks only, every code change gets at least one review, and security changes always get a deep review.
6. **Hand off.** Work can pause or continue in a fresh session without replaying the whole conversation.

**Guardrails that stay on:**

- It asks you before building.
- Security floors are never lowered.
- Scope stays exactly what you approved.
- Anything unknown is reported as unknown.
- It makes no branches, commits, or pushes unless you ask.

**Smart about cost.** The agent uses a plain tool when one is enough and works directly by default. Routine work runs on the host's cheaper model and only hard work on the strongest. In trials, delegating a small task from an expensive session to a cheaper worker saved nothing, so FeatureKit runs whole slices at the needed level instead. Small reviews go to the cheapest reviewer (every planted bug still caught, at about 70% lower cost for those reviews), and a failed attempt hands its evidence to the stronger model instead of restarting (29% cheaper escalations). An [eval suite](./evals/run.py) compares FeatureKit with a bare agent on real development scenarios.

**Getting started takes two steps:** install the skills, then run `/setup-featurekit` once. After that, just ask for features.

## Install And Initialize A Product Repo

Run this in the **product repo where you want to use FeatureKit**, such as your app's root directory. FeatureKit is private, so your GitHub authentication must have access.

```bash
npx skills@latest add qorsmond/FeatureKit \
  -a codex -a claude-code -a opencode --skill '*' -y
```

This installs the complete skill set, including optional tooling skills. Remove any `-a` options for agents you do not use. For a smaller selection or installation from a local FeatureKit checkout, see [Install](./docs/ai-workflow/01-install.md).

Open a fresh coding-agent session in that same product repo so it loads the installed skills, then initialize it once:

```text
/setup-featurekit
```

Setup previews and updates the existing `AGENTS.md` or equivalent instruction file and records repo conventions under `docs/agents/`. It saves session bootstrap, automatic orchestration and live routing feedback. The orchestrator chooses available worker models and effort; no model roster or repeated orchestration prompt is required. Future sessions need only your normal request.

A raw feature request starts the design-tree interview automatically. You can also invoke `/grill-with-docs` directly. When you are unsure which skill fits, ask explicitly:

```text
/ask-featurekit
```

For a raw feature, `/ask-featurekit` begins the interview instead of returning only a route. Interview questions carry their own plain-language context and consequences, and uncertainty is explained and re-asked rather than inferred. For other work it routes you through planning, security, PRDs, slices, implementation, test verification, review, prototyping, debugging, and handoff.

## Update An Existing Product Repo

Run the same full-install command from the product repo after a FeatureKit release:

```bash
npx skills@latest add qorsmond/FeatureKit \
  -a codex -a claude-code -a opencode --skill '*' -y
```

Keep the `-a` selections appropriate for your agents. Re-running `add` refreshes installed FeatureKit skills and includes newly added ones. `npx skills@latest update` updates existing skill entries; use the full `add` command above to pick up the complete current set.

Start a fresh coding-agent session in the same repo, then run:

```text
/setup-featurekit

Refresh this repo's FeatureKit setup to the installed release. Update missing
or outdated FeatureKit instructions and affected docs/agents files. Preserve
existing project rules and settled choices; do not repeat the full setup
interview or add fixed model selections. Show the focused changes before writing.
```

Both steps matter: installation updates the skills, while setup refreshes the instructions saved in the product repo. Setup updates existing blocks in place; repeated runs should make no unnecessary changes or duplicate sections. Use this flow after upgrades; normal work sessions load the saved policy automatically.

Confirm the version below. To see delegation in action once after setup, use the [read-only orchestration smoke test](./docs/ai-workflow/09-orchestration.md#read-only-smoke-test).

## Confirm Version

Project installs copy FeatureKit skills into `.agents/skills/`. Each installed `SKILL.md` includes `metadata.featurekit-version`, so consumers can confirm the release they received:

```bash
rg "featurekit-version" .agents/skills
```

All FeatureKit entries should match the installed release's [VERSION](./VERSION). After upgrading, confirm that `orchestrate-work` and `validate-feature` are present too.

## The Main Flow

1. Start with `/setup-featurekit` once per product repo.
2. Let the setup-written repo instructions load `using-featurekit` and orchestration in each session.
3. Use `/ask-featurekit` when you are unsure which flow fits; it also begins interviewing raw features immediately.
4. Use `/grill-with-docs` when you want to start the same design-tree interview explicitly against product context.
5. Use `/record-adr` when a durable architectural decision is made or changed.
6. Use `/to-prd` for work that needs a durable spec.
7. Use `/to-slices` to split a PRD into small vertical implementation slices.
8. Review each written plan, PRD, or slice and use its final approval question before implementation.
9. After an implementation-ready artifact is approved, continue focused work in the current task. For substantial work only, choose a fresh implementation task on the current checkout and branch, the current task, or stop after planning; use `/implement` for one approved slice or `/execute-slices` for approved ordered slices.
10. Let `secure-design`, `secure-code`, `secure-api`, and `secure-deploy` apply automatically when work touches their security surfaces.
11. Use `verify-tests` when generated or changed tests need deeper proof.
12. Use `security-review` for focused security review and `review-change` before human review.
13. Use `/handoff` when a session needs to pause or continue elsewhere.

Within these workflows, `orchestrate-work` chooses a direct tool, the current agent, or a bounded worker by capability and risk, and `validate-feature` checks acceptance evidence in the relevant runtime, including mobile and hardware gaps. Optional repo restrictions or explicit overrides live in `docs/agents/orchestration.md`; no model roster is required, and single-model use still works. Plan files carry each slice's status, evidence and notes, so a new session resumes where the last one stopped without repeating its investigation. See [Orchestration](./docs/ai-workflow/09-orchestration.md).

## Optional Tooling Skills

FeatureKit also includes misc skills for repo guardrails and specialized setup:

- `git-guardrails-claude-code`
- `setup-pre-commit`
- `scaffold-exercises`
- `migrate-to-shoehorn`

These are useful when a product repo needs them, but they are not part of the default idea-to-ship flow.

## Full Guide

The detailed usage guide is the source of truth:

- [Overview](./docs/ai-workflow/00-overview.md)
- [Install](./docs/ai-workflow/01-install.md)
- [Setup](./docs/ai-workflow/02-setup.md)
- [Main Flow](./docs/ai-workflow/03-main-flow.md)
- [Working With Agents](./docs/ai-workflow/04-working-with-agents.md)
- [Local LLMs](./docs/ai-workflow/05-local-llms.md)
- [End-to-End Example](./docs/ai-workflow/06-end-to-end-example.md)
- [Troubleshooting](./docs/ai-workflow/07-troubleshooting.md)
- [Security Workflow](./docs/ai-workflow/08-security.md)
- [Orchestration](./docs/ai-workflow/09-orchestration.md)

## Local LLMs

For Gemma or another local model, use [prompts/local-llm-featurekit.md](./prompts/local-llm-featurekit.md). Paste that prompt, then paste this repo's `AGENTS.md`, the target product repo's context, and the relevant `SKILL.md`.
