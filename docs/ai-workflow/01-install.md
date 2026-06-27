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
npx skills@latest add /absolute/path/to/FeatureKit --skill ask-featurekit --skill setup-featurekit
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

You should see the FeatureKit skills from `skills/engineering/` and `skills/productivity/`.

## Update Later

Update installed skills:

```bash
npx skills@latest update
```

If a skill still looks stale, restart the coding agent.

## Series Navigation

- Previous: [Overview](./00-overview.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Setup](./02-setup.md)
