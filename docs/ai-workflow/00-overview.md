# Overview

FeatureKit is a portable skill harness for building real full-stack products with AI coding agents.

It is not a framework, app scaffold, or custom runtime. It is a set of small Markdown skills that help you work with agents in a disciplined way: clarify the idea, write the spec, split the work, implement one slice, verify it, review it, and hand off cleanly.

## What FeatureKit Solves

Agents move fast, but speed is dangerous when the goal is fuzzy. The common failures are predictable:

- the agent builds the wrong thing,
- the context gets too messy,
- PRs become too large,
- the implementation drifts from the plan,
- nobody understands the generated diff,
- product language changes every session.

FeatureKit counters this with repeatable workflows and durable project context.

## Mental Model

FeatureKit has three layers:

1. Project context: the target repo's `AGENTS.md`, `CONTEXT.md`, ADRs, and `docs/agents/` files.
2. Skills: small workflows under `skills/` that an agent can follow.
3. Guide: these docs, which teach you when and how to run each skill.

The target product repo owns stack choices. FeatureKit owns the agent workflow.

## The Rule

No production code starts until there is a written plan.

For small work, the plan can be a short note. For larger work, use a PRD and sliced issues. If reality changes during implementation, update the plan before continuing.

Accepted ADRs are also part of the plan. If a change needs to violate or replace an accepted ADR, record the new architectural decision before implementation continues.

## Skill Types

User-invoked skills are commands you intentionally run:

- `ask-featurekit`
- `setup-featurekit`
- `record-adr`
- `grill-with-docs`
- `to-prd`
- `to-issues`
- `implement`
- `prototype`
- `handoff`

Model-invoked skills are reusable disciplines the agent may use when the task fits:

- `grilling`
- `adr-guidance`
- `domain-modeling`
- `tdd`
- `diagnosing-bugs`
- `review-change`
- `codebase-design`

`tdd` is intentionally model-invoked. Implementation and bug-fix workflows should be able to reach for it automatically whenever behavior can be protected with tests.

Optional misc tooling skills:

- `git-guardrails-claude-code`
- `setup-pre-commit`
- `scaffold-exercises`
- `migrate-to-shoehorn`

## Where To Start

If this is a new repo, install FeatureKit and run:

```text
/setup-featurekit
```

If FeatureKit is already set up and you do not know what to run, ask:

```text
/ask-featurekit
```

## Series Navigation

- Index: [FeatureKit Guide](./README.md)
- Next: [Install](./01-install.md)
