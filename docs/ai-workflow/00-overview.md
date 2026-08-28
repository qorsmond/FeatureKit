# Overview

FeatureKit is a portable skill harness for building real full-stack products with AI coding agents.

It is not a framework, app scaffold, or custom runtime. It is a set of small Markdown skills that help you work with agents in a disciplined way: clarify the idea, capture security requirements, write the spec, split the work, implement slices, verify them, review them, and hand off cleanly.

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

No production code starts until there is a written plan that has been shown to the user and approved.

For small work, the plan can be a short note. For larger work, use a PRD and implementation slices. The feature interview ends by showing the complete plan and asking a clear final approval question. Earlier answers and accepted recommendations are not approval. If reality changes during implementation, update and approve the plan before continuing.

Accepted ADRs are also part of the plan. If a change needs to violate or replace an accepted ADR, record the new architectural decision before implementation continues.

Every new session should also follow the Agent Operating Principles before coding, refactoring, or verification work: think before coding, keep the solution simple, and make surgical changes only.

## Skill Types

User-invoked skills are commands you intentionally run:

- `ask-featurekit`
- `setup-featurekit`
- `record-adr`
- `grill-with-docs`
- `to-prd`
- `to-slices`
- `implement`
- `execute-slices`
- `security-review`
- `prototype`
- `handoff`

Model-invoked skills are reusable disciplines the agent may use when the task fits:

- `grilling`
- `using-featurekit`
- `adr-guidance`
- `domain-modeling`
- `secure-design`
- `secure-code`
- `secure-api`
- `secure-deploy`
- `tdd`
- `verify-tests`
- `diagnosing-bugs`
- `review-change`
- `codebase-design`

`using-featurekit` is the lightweight model-invoked bootstrap. Put it in session-start instructions, use it after context compaction, or let capable agents invoke it automatically. A raw feature request begins the design-tree interview without making you repeat the idea. `/grill-with-docs` starts the same interview explicitly, and `/ask-featurekit` begins it for a raw feature or routes other work.

`tdd` is intentionally model-invoked. Implementation and bug-fix workflows should be able to reach for it automatically whenever behavior can be protected with tests.

The security suite is model-invoked except for `security-review`. Planning, implementation, and review workflows should reach for `secure-design`, `secure-code`, `secure-api`, and `secure-deploy` when work touches auth, authorization, sensitive data, APIs, deployment, integrations, generated code, or untrusted input.

`verify-tests` is also model-invoked. Agents should use it when generated or changed tests look weak, high-risk, or explicitly need mutation testing. It does not run expensive mutation tests by default.

Optional misc tooling skills:

- `git-guardrails-claude-code`
- `setup-pre-commit`
- `scaffold-exercises`
- `migrate-to-shoehorn`

## Where To Start

For a fast path from a prepared product repo to the first implemented feature slice, see the [Quick Start](./quick-start.md).

If this is a new repo, install FeatureKit and run:

```text
/setup-featurekit
```

If FeatureKit is already set up, put `using-featurekit` in your session-start instructions or let the agent invoke it automatically. A raw feature prompt should begin interviewing immediately. You can also start explicitly with:

```text
/grill-with-docs
```

If you do not know what to run, ask:

```text
/ask-featurekit
```

## Series Navigation

- Previous: [Quick Start](./quick-start.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Install](./01-install.md)
