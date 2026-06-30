# AGENTS.md

Canonical project context for FeatureKit. Keep this file lean: stable facts and rules only. Step-by-step usage belongs in `docs/ai-workflow/`; reusable agent behavior belongs in `skills/`.

## Project

FeatureKit is a private, framework-agnostic agent skill harness for building real full-stack products with coding agents.

The goal is portable, plain Markdown skills that can be installed with the open `skills` CLI and used from Codex, Claude Code, OpenCode, generic agents, and local LLMs.

## Product Direction

- FeatureKit v1 is private.
- Do not build a custom FeatureKit CLI in v1.
- Use `npx skills@latest add ...` as the install and update path.
- Keep the core stack-neutral. Stack choices live in the target product repo's `AGENTS.md`, `CONTEXT.md`, ADRs, and `docs/agents/` setup docs.
- Dogfood against real products first. The workflow must be useful for production apps, not toy demos.
- Docs are part of the product. v1 is not complete unless someone can follow the guide from install through a complete feature workflow.

## Repository Layout

- `skills/engineering/` contains product and engineering workflow skills.
- `skills/productivity/` contains cross-cutting workflow skills.
- `skills/misc/` contains optional tooling skills that are useful in some repos but are not part of the default product-building flow.
- `.claude-plugin/plugin.json` lists installable skill folders for Claude/plugin-compatible discovery.
- `VERSION` and `CHANGELOG.md` track the FeatureKit release.
- `docs/ai-workflow/` is the canonical guide for using FeatureKit.
- `prompts/local-llm-featurekit.md` is the compiled entry prompt for Gemma and other local LLMs.
- `CLAUDE.md` points to this file. Do not duplicate rules there.

## Skill Rules

- Skills are small, composable, and written as plain `SKILL.md` files.
- Skill names use lowercase hyphen-case.
- Skill frontmatter must include `name` and `description`.
- User-invoked skills orchestrate a workflow and should not auto-trigger unexpectedly.
- Model-invoked skills hold reusable discipline such as ADR guidance, TDD, bug diagnosis, review, domain modeling, and codebase design.
- `tdd` must remain model-invoked so implementation and bug-fix skills can reach for it automatically. Do not add `disable-model-invocation: true` to it.
- Prefer instructions over scripts unless deterministic execution is genuinely needed.
- Do not hardcode a product stack, issue tracker, deployment platform, database, framework, or architecture into FeatureKit core.
- If a skill needs repo-specific choices, it should read `docs/agents/` in the target repo.
- When changing public workflow behavior, update `VERSION`, `CHANGELOG.md`, `.claude-plugin/plugin.json`, and each skill's `metadata.featurekit-version`.

## Core Workflow Rule

No production code starts until there is a written plan. Small work gets a small written plan; larger work gets a PRD and sliced issues.

## Verification

Use these checks before shipping changes to FeatureKit:

```bash
npx skills@latest add . --list
npx skills@latest add . -a codex -a claude-code -a opencode --skill ask-featurekit --skill setup-featurekit --skill record-adr --skill adr-guidance -y
npx skills@latest use . --skill record-adr
rg "featurekit-version: \"$(cat VERSION)\"" skills
```

For documentation changes, follow the guide end to end in a scratch product repo and fix any confusing step.
