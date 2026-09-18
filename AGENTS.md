# AGENTS.md

Canonical project context for FeatureKit. Keep this file lean: stable facts and rules only. Step-by-step usage belongs in `docs/ai-workflow/`; reusable agent behavior belongs in `skills/`.

## Project

FeatureKit is a private, framework-agnostic agent skill harness for building real full-stack products with coding agents.

The goal is portable, plain Markdown skills that can be installed with the open `skills` CLI and used from Codex, Claude Code, OpenCode, generic agents, and local LLMs.

## Agent Tool Routing

- Use Repowise for repository overview and documentation context/search.
- Use Serena for symbol-aware source navigation and refactoring when the repository contains analyzable source code.
- Do not repeat the same retrieval in both tools; choose the tool that owns the task above.

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
- Model-invoked skills hold reusable discipline such as ADR guidance, TDD, secure design/code/API/deploy guidance, bug diagnosis, review, domain modeling, and codebase design.
- `tdd` must remain model-invoked so implementation and bug-fix skills can reach for it automatically. Do not add `disable-model-invocation: true` to it.
- `secure-design`, `secure-code`, `secure-api`, and `secure-deploy` must remain model-invoked so planning, implementation, and review skills can reach for them automatically.
- `orchestrate-work` and `validate-feature` remain model-invoked shared disciplines. The primary owns completion; model mappings belong in target-repo configuration, and required runtime evidence cannot be replaced by a successful build.
- Prefer instructions over scripts unless deterministic execution is genuinely needed.
- Do not hardcode a product stack, work tracker, deployment platform, database, framework, or architecture into FeatureKit core.
- If a skill needs repo-specific choices, it should read `docs/agents/` in the target repo.
- When changing public workflow behavior, update `VERSION`, `CHANGELOG.md`, `.claude-plugin/plugin.json`, and each skill's `metadata.featurekit-version`.

## Core Workflow Rule

No production code starts until there is an approved written plan. Small work gets a small written plan; larger work gets a PRD and implementation slices.

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

## Verification

Use these checks before shipping changes to FeatureKit:

```bash
npx skills@latest add . --list
npx skills@latest add . -a codex -a claude-code -a opencode --skill using-featurekit --skill ask-featurekit --skill setup-featurekit --skill grill-with-docs --skill grilling --skill to-prd --skill to-slices --skill implement --skill execute-slices --skill handoff --skill record-adr --skill adr-guidance --skill secure-design --skill secure-code --skill secure-api --skill secure-deploy --skill tdd --skill orchestrate-work --skill validate-feature --skill verify-tests --skill review-change --skill security-review -y
npx skills@latest use . --skill using-featurekit
npx skills@latest use . --skill grill-with-docs
npx skills@latest use . --skill grilling
npx skills@latest use . --skill to-prd
npx skills@latest use . --skill to-slices
npx skills@latest use . --skill implement
npx skills@latest use . --skill execute-slices
npx skills@latest use . --skill record-adr
npx skills@latest use . --skill security-review
npx skills@latest use . --skill orchestrate-work
npx skills@latest use . --skill validate-feature
python3 tests/check_packaging.py
rg "featurekit-version: \"$(cat VERSION)\"" skills
```

For the interview mode gate, also run this behavioral smoke test in a harness where a native question tool exists but the current mode disables it:

1. Invoke `using-featurekit` with a raw feature request.
2. Confirm the first response chooses a provisional depth, shows an initial ledger, explains how to enable the question tool, and pauses.
3. Confirm no repo inspection, fact search, subagent, or task-specific secondary skill runs before the mode changes or the user explicitly accepts numbered plain text.

For user-answerable questions and implementation handoff, run these behavioral smoke scenarios in a harness with its native question UI:

1. Start an interview with an ambiguous choice that has a material consequence. Confirm every question contains its own short context, uses user-facing language, asks one decision, and explains what each option causes. Confirm scope, security or privacy, migration, cost, reversibility, or rollout consequences are explicit when material.
2. Answer one question with `I don't understand` or another question while answering the other questions normally. Confirm the unclear decision remains ready, the other answers remain settled, and the next round explains and re-asks only the unclear decision with a concrete example.
3. Complete a product-depth interview that still needs a PRD or slices. Confirm approval routes to that artifact and does not offer implementation.
4. Complete and approve a focused implementation-ready plan or slice after the original request asked for implementation. Confirm work continues in the current task without a destination question.
5. Complete and approve a substantial implementation-ready plan or slice. Confirm a separate destination question offers a fresh implementation task on the current checkout and branch, the current task, or stop after planning, and that no task is created before the user chooses fresh.
6. Choose fresh implementation task. Confirm the destination uses the same saved project checkout and active branch without creating a worktree, branch, clone, or isolated checkout, and that installed FeatureKit skills and project-scoped tools such as Serena remain available. Confirm it receives the approved artifact, objective, scope and out-of-scope boundaries, decisions, ADR and security constraints, repository state, verification commands, available project tools, and exact `/implement` or `/execute-slices` route. Confirm it receives no transcript and does not restart the interview. If suitable task creation is unavailable or disabled, confirm the source gives the exact remedy or one self-contained prompt instead.

For documentation changes, follow the guide end to end in a scratch product repo and fix any confusing step.

For orchestration/runtime changes, run the behavioral trials in `tests/scenarios.md`. Record observed choices and artifacts separately from simulated host conditions, and report unavailable external CLI/device checks without claiming they passed.
