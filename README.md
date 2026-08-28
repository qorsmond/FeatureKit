# FeatureKit

Portable agent skills for building real full-stack products with coding agents.

FeatureKit is a private, framework-agnostic skill harness. It follows the Matt Pocock-style pattern: small composable skills, installed with the open `skills` CLI, then run from Codex, Claude Code, OpenCode, generic agents, or local LLMs.

Current release: see [VERSION](./VERSION) and [CHANGELOG.md](./CHANGELOG.md).

## Quickstart

Install from the repo:

```bash
npx skills@latest add qorsmond/FeatureKit
```

For local development inside this repo:

```bash
npx skills@latest add . --list
npx skills@latest add . \
  --skill using-featurekit \
  --skill ask-featurekit \
  --skill setup-featurekit \
  --skill grill-with-docs \
  --skill grilling \
  --skill to-prd \
  --skill to-slices \
  --skill implement \
  --skill execute-slices \
  --skill handoff \
  --skill record-adr \
  --skill adr-guidance \
  --skill secure-design \
  --skill secure-code \
  --skill secure-api \
  --skill secure-deploy \
  --skill tdd \
  --skill verify-tests \
  --skill review-change \
  --skill security-review
```

Then run this in your coding agent when setting up a product repo:

```text
/setup-featurekit
```

After setup, keep `using-featurekit` in session-start instructions when available. A raw feature request starts the design-tree interview automatically. You can also invoke `/grill-with-docs` directly. When you are unsure which skill fits, ask explicitly:

```text
/ask-featurekit
```

For a raw feature, `/ask-featurekit` begins the interview instead of returning only a route. For other work it routes you through planning, security, PRDs, slices, implementation, test verification, review, prototyping, debugging, and handoff.

## Confirm Version

Project installs copy FeatureKit skills into `.agents/skills/`. Each installed `SKILL.md` includes `metadata.featurekit-version`, so consumers can confirm the release they received:

```bash
rg "featurekit-version" .agents/skills
```

## The Main Flow

1. Start with `/setup-featurekit` once per product repo.
2. Keep `using-featurekit` as the lightweight session bootstrap so raw features begin interviewing automatically.
3. Use `/ask-featurekit` when you are unsure which flow fits; it also begins interviewing raw features immediately.
4. Use `/grill-with-docs` when you want to start the same design-tree interview explicitly against product context.
5. Use `/record-adr` when a durable architectural decision is made or changed.
6. Use `/to-prd` for work that needs a durable spec.
7. Use `/to-slices` to split a PRD into small vertical implementation slices.
8. Review each written plan, PRD, or slice and use its final approval question before implementation.
9. Use `/implement` for one approved slice, or `/execute-slices` for approved ordered slices.
10. Let `secure-design`, `secure-code`, `secure-api`, and `secure-deploy` apply automatically when work touches their security surfaces.
11. Use `verify-tests` when generated or changed tests need deeper proof.
12. Use `security-review` for focused security review and `review-change` before human review.
13. Use `/handoff` when a session needs to pause or continue elsewhere.

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

## Local LLMs

For Gemma or another local model, use [prompts/local-llm-featurekit.md](./prompts/local-llm-featurekit.md). Paste that prompt, then paste this repo's `AGENTS.md`, the target product repo's context, and the relevant `SKILL.md`.
