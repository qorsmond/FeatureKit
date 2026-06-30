# Troubleshooting

## Skills Do Not Show Up

Run:

```bash
npx skills@latest add . --list
```

If local discovery works but the agent cannot see the skill:

- confirm you installed to the right agent,
- restart the agent,
- check whether you installed project or global skills,
- confirm the skill has a valid `SKILL.md` frontmatter.

## Installed Skill Looks Stale

Run:

```bash
npx skills@latest update
```

Then restart the agent. Some agents load skills only at session start.

## Setup Picked The Wrong File

If setup updated the wrong instruction file, edit the short `Agent skills` block manually.

The rule is:

- keep stable project rules in `AGENTS.md`,
- keep `CLAUDE.md` as a pointer when possible,
- keep FeatureKit setup details in `docs/agents/*.md`.

## The Agent Is Asking Too Many Questions

Tell it:

```text
Read the repo first and ask only questions that cannot be answered from local context.
```

FeatureKit skills should discover facts before asking preferences.

## The Plan Is Too Vague

Continue grilling. A plan is not ready if it lacks:

- goal,
- scope,
- out of scope,
- acceptance criteria,
- data/API behavior,
- UI or workflow behavior,
- error states,
- verification plan.

## The Agent Started Coding Too Early

Stop it and return to the plan:

```text
Stop implementation. We need a written plan first. Use `/grill-with-docs` or `/to-prd`.
```

## The Diff Drifted From The Plan

Ask for a review against the PRD and issue:

```text
Use review-change. Check this diff against the PRD and the single issue. Flag scope drift first.
```

Pull unrelated changes into a separate issue or remove them.

## The Work Conflicts With An ADR

Stop implementation and resolve the decision:

```text
Use /record-adr to supersede the accepted ADR, or update the PRD/issue so the work follows it.
```

Accepted ADRs are governing context. Do not treat an ADR conflict as an implementation detail.

## A Decision Was Made But Not Recorded

Record it before the next implementation session:

```text
/record-adr
```

Include the context, decision, consequences, alternatives considered, and related PRD or issue.

## Local LLM Context Is Too Small

Use less context:

- one skill,
- one issue,
- one or two relevant files,
- the verification command,
- no full conversation transcript.

Use `/handoff` to compress context before moving to a local model.

## Series Navigation

- Previous: [End-to-End Example](./06-end-to-end-example.md)
- Index: [FeatureKit Guide](./README.md)
