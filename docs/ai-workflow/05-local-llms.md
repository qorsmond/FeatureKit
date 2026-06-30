# Local LLMs

Local LLMs usually do not auto-discover skills. Use the compiled prompt bundle instead.

Open:

```text
prompts/local-llm-featurekit.md
```

Paste it into your local model, then paste the selected context and skill.

## Minimum Context

For a local model, keep context tight:

1. Product repo `AGENTS.md`.
2. Relevant `docs/agents/*.md`.
3. Relevant `CONTEXT.md`, accepted ADRs, PRD, or slice.
4. One FeatureKit `SKILL.md`.
5. Your exact task.

Do not paste the whole repo unless the local model has enough context and you really need it.

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
I want to add saved dashboards to this product. Interview me until the scope is clear.
```

## Example: Implementation

```text
Use FeatureKit with the implement skill.

Project context:
<paste AGENTS.md>
<paste docs/agents/verification.md>
<paste relevant accepted ADRs>

Spec:
<paste PRD>

Slice:
<paste one slice only>

Skill:
<paste skills/engineering/implement/SKILL.md>

Task:
Implement only this slice. Ask for any file contents you need before editing.
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

## Limitations

With local LLMs:

- expect more manual file pasting,
- keep tasks smaller,
- ask for plans before code,
- paste or restate the Agent Operating Principles before coding, refactoring, or verification work,
- verify outputs more aggressively,
- use fresh sessions often.

The workflow still works because the skills are plain Markdown.

## Series Navigation

- Previous: [Working With Agents](./04-working-with-agents.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [End-to-End Example](./06-end-to-end-example.md)
