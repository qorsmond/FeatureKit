# Local LLMs

Local LLMs usually do not auto-discover skills. Use the compiled prompt bundle instead.

Open:

```text
prompts/local-llm-featurekit.md
```

Paste it into your local model, then paste the selected context and skill.

For a manual bootstrap, paste the `using-featurekit` skill first. For a raw feature, also paste `grilling` so the model can begin the design-tree interview without another prompt. For other work, paste the narrower workflow skill selected by the bootstrap.

## Minimum Context

For a local model, keep context tight:

1. Product repo `AGENTS.md`.
2. Relevant `docs/agents/*.md`.
3. Relevant `CONTEXT.md`, accepted ADRs, PRD, or slice.
4. `using-featurekit` plus `grilling` for a raw feature, or one focused FeatureKit `SKILL.md`; paste `orchestrate-work` or `validate-feature` when the task needs them, and paste `secure-design`, `secure-code`, `secure-api`, or `secure-deploy` when the focused skill tells the model to use one.
5. Your exact task.

Do not paste the whole repo unless the local model has enough context and you really need it.

Local models do not need JEV. Use the deterministic FeatureKit route, exact fact receipts, capsule projections, and metadata pruning when the host cannot run the optional MCP server or hooks. Never paste an API key, route cache, transcript, or unrelated source into the model prompt. If an external reviewer or compactor is enabled separately, follow its source/transcript permission instead of assuming metadata-routing consent covers it.

## Example: Planning

```text
Use FeatureKit with the grill-with-docs skill.

Project context:
<paste AGENTS.md>
<paste docs/agents/domain.md>
<paste relevant ADRs, if any>
<paste CONTEXT.md>

Skill:
<paste skills/engineering/grill-with-docs/SKILL.md>

Task:
I want to add saved dashboards to this product. Build a design tree and interview me until its selected planning depth has no material decision left open.
```

## Example: Implementation

```text
Use FeatureKit with the implement skill.

Project context:
<paste AGENTS.md>
<paste docs/agents/verification.md>
<paste docs/agents/security.md if relevant>
<paste relevant accepted ADRs>

Spec:
<paste PRD>

Slice:
<paste one approved slice only>

Skill:
<paste skills/engineering/implement/SKILL.md>

Task:
Implement only this approved slice. Ask for any file contents you need before editing.
```

## Example: Test Verification

```text
Use FeatureKit with the verify-tests skill.

Project context:
<paste AGENTS.md>
<paste docs/agents/verification.md>
<paste relevant PRD or slice>

Skill:
<paste skills/engineering/verify-tests/SKILL.md>

Task:
Check whether these generated tests actually protect the intended behavior. Do not run mutation testing unless the skill's gate is met.
```

## Example: Security Review

```text
Use FeatureKit with the security-review skill.

Project context:
<paste AGENTS.md>
<paste docs/agents/security.md>
<paste relevant PRD, slice, ADRs, or diff>

Skill:
<paste skills/engineering/security-review/SKILL.md>

Task:
Review this change for exploitable security risk. Lead with findings.
```

## Limitations

With local LLMs:

- expect more manual file pasting,
- use numbered text with at most three simple questions per interview round when the model has no structured question tool,
- keep tasks smaller,
- use `implement` one approved slice at a time unless the model can hold the full approved PRD, slice queue, relevant files, and verification output for `execute-slices`,
- ask for plans before code, and approve the written plan or slice before implementation,
- paste or restate the Agent Operating Principles before coding, refactoring, or verification work,
- verify outputs more aggressively,
- use the [orchestration guide](./09-orchestration.md) for capability routing and runtime evidence, and consult the provider reference linked there for CLI mechanics,
- keep optional JEV routing `off` unless the local harness can enforce the documented bounded schema and fail-open behavior,
- use fresh sessions only for substantial work or when the current session is context-constrained, and reopen the same checkout and branch.

The workflow still works because the skills are plain Markdown.

## Series Navigation

- Previous: [Working With Agents](./04-working-with-agents.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [End-to-End Example](./06-end-to-end-example.md)
