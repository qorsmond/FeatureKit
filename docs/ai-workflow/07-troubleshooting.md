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

## Bootstrap Does Not Run Automatically

FeatureKit v1 does not install hook scripts. Add this sentence to your agent's session-start prompt, saved custom instructions, or first message:

```text
At the start of FeatureKit sessions and after context compaction, use `using-featurekit` before acting.
```

If your harness cannot auto-run skills, invoke `using-featurekit` manually at the start of the session.

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

If the work touches auth, authorization, sensitive data, APIs, deployment, integrations, generated code, or untrusted input, the plan also needs security requirements, abuse cases, and security verification.

## The Agent Started Coding Too Early

Stop it and return to the plan:

```text
Stop implementation. We need a written plan first. Use `/grill-with-docs` or `/to-prd`.
```

## The Diff Drifted From The Plan

Ask for a review against the PRD and slice:

```text
Use review-change. Check this diff against the PRD and the single slice. Flag scope drift first.
```

Pull unrelated changes into a separate slice or remove them.

## Security Context Is Missing

Stop and read or create the repo security setup:

```text
Use /setup-featurekit to record docs/agents/security.md, or update that file before continuing.
```

For an existing diff, use `security-review` when the risk is exploitable or the repo security posture is unclear.

## Execute Slices Is Moving Too Broadly

Stop it and narrow the queue:

```text
Stop `/execute-slices`. Continue with `/implement` for one approved slice only.
```

Use `/execute-slices` only after the PRD and ordered slices are approved.

## The Work Conflicts With An ADR

Stop implementation and resolve the decision:

```text
Use /record-adr to supersede the accepted ADR, or update the PRD/slice so the work follows it.
```

Accepted ADRs are governing context. Do not treat an ADR conflict as an implementation detail.

## A Decision Was Made But Not Recorded

Record it before the next implementation session:

```text
/record-adr
```

Include the context, decision, consequences, alternatives considered, and related PRD or slice.

## Local LLM Context Is Too Small

Use less context:

- one skill,
- one slice,
- one or two relevant files,
- the verification command,
- no full conversation transcript.

Use `/handoff` to compress context before moving to a local model.

## Series Navigation

- Previous: [Security Workflow](./08-security.md)
- Index: [FeatureKit Guide](./README.md)
