# Install

FeatureKit uses the open `skills` CLI. Do not install a custom FeatureKit CLI for v1.

## Install From GitHub

In the product repo where you want to use FeatureKit:

```bash
npx skills@latest add qorsmond/FeatureKit
```

Because FeatureKit is private in v1, use an authenticated environment that can read the GitHub repo.

## Install From A Local Checkout

While developing FeatureKit itself:

```bash
git clone git@github.com:qorsmond/FeatureKit.git
cd FeatureKit
npx skills@latest add . --list
```

To install selected skills into a scratch product repo:

```bash
npx skills@latest add /absolute/path/to/FeatureKit \
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
  --skill orchestrate-work \
  --skill record-adr \
  --skill adr-guidance \
  --skill secure-design \
  --skill secure-code \
  --skill secure-api \
  --skill secure-deploy \
  --skill tdd \
  --skill verify-tests \
  --skill validate-feature \
  --skill review-change \
  --skill security-review
```

## Install For Specific Agents

Codex, Claude Code, and OpenCode:

```bash
npx skills@latest add qorsmond/FeatureKit -a codex -a claude-code -a opencode
```

Codex only:

```bash
npx skills@latest add qorsmond/FeatureKit -a codex
```

Claude Code only:

```bash
npx skills@latest add qorsmond/FeatureKit -a claude-code
```

OpenCode only:

```bash
npx skills@latest add qorsmond/FeatureKit -a opencode
```

## Project vs Global Install

Project install is the default and writes skills into the target repo's agent skill folders. Use this for product repos where the team should share the same skills.

Global install makes skills available across repos:

```bash
npx skills@latest add qorsmond/FeatureKit --global
```

For real product work, prefer project install until the workflow is stable. It makes the active skills visible to the repo.

## Confirm Discovery

List skills without installing:

```bash
npx skills@latest add qorsmond/FeatureKit --list
```

For local development:

```bash
npx skills@latest add . --list
```

You should see the FeatureKit skills from `skills/engineering/`, `skills/productivity/`, and optional `skills/misc/`.

## Session Bootstrap

Run `/setup-featurekit` once after installation. It saves the bootstrap and orchestration policy in the repo's agent instructions, which supporting hosts load in future sessions. FeatureKit does not need a separate bootstrap hook; plugin installs include the optional JEV preflight hook described below.

JEV routing is optional and remains off after skill installation. To connect its one local MCP tool and choose `off` or advisory-only `shadow`, follow [Optional JEV shadow routing](./09-orchestration.md#optional-jev-shadow-routing).

Only if your host does not load repo instruction files, put this instruction in its persistent custom instructions or supply the required context manually:

```text
At the start of FeatureKit sessions and after context compaction, use `using-featurekit` before acting.
```

See [Setup](./02-setup.md) for initialization and [Local LLMs](./05-local-llms.md) for hosts without automatic skill discovery.

## Confirm Installed Version

FeatureKit tracks its source release in `VERSION` and `CHANGELOG.md`. Installed skill copies also include `metadata.featurekit-version` in each `SKILL.md`.

For a project install, check:

```bash
rg "featurekit-version" .agents/skills
```

After `npx skills@latest update`, this value should match the latest FeatureKit release.

## Update Later

For a FeatureKit release, rerun `add` with the agent and skill selections you use, including any newly introduced skills. For example, a repo already using all FeatureKit skills in Codex and Claude Code can refresh the full set with:

```bash
npx skills@latest add qorsmond/FeatureKit -a codex -a claude-code --skill '*' -y
```

This includes optional tooling skills. For a core-only install, reuse the explicit selection above instead. Releases 0.6.0 and later add `orchestrate-work` and `validate-feature`; updating existing entries alone is not a discovery check for new skills.

The CLI can also update previously installed skills across sources:

```bash
npx skills@latest update
```

Confirm the installed `metadata.featurekit-version`, then start a fresh agent session so it loads the updated skills. If upgrading a repo without the persistent orchestration instruction, run `/setup-featurekit` once to refresh its FeatureKit block; existing repo choices remain valid. Future sessions load orchestration from `AGENTS.md` or equivalent without a repeated prompt or model roster. See [Start an orchestrated session](./09-orchestration.md#start-an-orchestrated-session) for the optional smoke test.

## Series Navigation

- Previous: [Overview](./00-overview.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Setup](./02-setup.md)
