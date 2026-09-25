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

FeatureKit does not use a bootstrap hook. Its optional plugin hook is only a JEV route preflight and does not replace `using-featurekit`. Add this sentence to your agent's session-start prompt, saved custom instructions, or first message:

```text
At the start of FeatureKit sessions and after context compaction, use `using-featurekit` before acting.
```

If your harness cannot auto-run skills, invoke `using-featurekit` manually at the start of the session.

## JEV Is Calling Unexpectedly Or Not Calling

Return to the baseline first:

```sh
export FEATUREKIT_JEV_ROUTING=off
```

Restart the host so its MCP process and hooks inherit the change. `off` makes no TypeSafe route call; `shadow` is advisory only and never changes execution in v0.7.0. On macOS, Codex Desktop may not inherit `.zshrc` variables unless the documented shell-backed MCP/hook command is used. Check `codex mcp get featurekit-jev` or Claude Code `/mcp`, but never print the key or add it to the repository.

A missing key, provider/network error, malformed answer, weak signal, untrusted hook, absent capsule, or multiple ready capsules preserves the baseline. Do not loosen the sandbox or retry the same call. Follow [Optional JEV shadow routing](./09-orchestration.md#optional-jev-shadow-routing) for the exact setup and switch.

## Compaction Did Not Restore FeatureKit State

Codex still uses native compaction. In `/hooks`, review the `SessionStart` entry ending in `compaction-hook.mjs`, trust only that entry, and restart Codex after configuration changes. The hook is silent unless exactly one non-complete capsule is valid; resume manually with `using-featurekit` and the approved artifact when state is missing or ambiguous.

Claude Code uses native compaction unless a separately pinned `fast-jev-compaction` plugin is supplied for that session. Start Claude without `--plugin-dir` to switch the pilot off. Missing keys, provider errors, oversized state, or insufficient reduction must fall back to native compaction. See the installed [compaction reference](../../skills/productivity/orchestrate-work/references/compaction.md).

## Setup Picked The Wrong File

If setup updated the wrong instruction file, edit the short `Agent skills` block manually.

The rule is:

- keep stable project rules in `AGENTS.md`,
- keep `CLAUDE.md` as a pointer when possible,
- keep FeatureKit setup details in `docs/agents/*.md`.

## The Interview Feels Noisy

Tell it:

```text
Read the repo first. Ask only user decisions that cannot be answered from local context. Use simple language and one decision per question.
```

FeatureKit should discover facts before asking preferences. Each round should fit the native question UI, prioritize decisions that unlock other branches, and keep other ready decisions for later.

## A Question Is Hard To Answer

Tell it:

```text
Keep this decision open. Explain the current situation and why the answer matters in plain language, give one concrete example, then re-ask only this question. Preserve my other answers.
```

Every question should include its own short context rather than depend on earlier commentary. Option descriptions should say what happens when chosen. Choices with material scope, security, migration, cost, reversibility, or rollout effects should state those consequences before the user answers.

## The Question UI Is Missing

If the harness has a native question tool, switch to the mode or permission setting that enables it. The agent should show a provisional ledger, explain the exact remedy, and pause before reading the repo, searching for facts, or loading secondary task skills. If the tool cannot be enabled, explicitly tell the agent to continue with numbered text. Text rounds contain at most three questions.

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
Stop implementation. We need an approved written plan first. Use `/grill-with-docs` or `/to-prd`, then wait for approval before coding.
```

If this happened after you accepted an interview recommendation, clarify that the answer was only one planning decision:

```text
That answer settles one interview decision. It does not approve the plan. Finish the design tree, show the complete plan, and ask the final approval question.
```

After approval, focused implementation continues in the current task without a session-choice question. FeatureKit offers a fresh implementation task only when the artifact is implementation-ready and the work is substantial; that task must use the same checkout and branch. Product-depth work continues to the required PRD or slices.

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

Use `/execute-slices` only after the PRD and ordered slices are approved and you explicitly want autonomous execution.

## Implementation Is Consuming Too Many Tokens

Tell the agent:

```text
Use the FeatureKit context budget. Start from the approved artifact, use semantic symbol lookup before full-file reads, keep searches and command output bounded, run narrow verification first, and expand only the failing target. Prefer direct tools for deterministic routine work; use a bounded worker when it adds useful progress and the packet has clear ownership.
```

When available, enable Serena or an equivalent semantic code tool for symbol-level discovery and RTK or an equivalent output filter for noisy shell commands. If neither is available, the implementation skills fall back to targeted `rg`, narrow file ranges, quiet test modes, and compact handoffs. Do not trade away acceptance criteria, security constraints, or necessary failure diagnostics merely to reduce tokens.

Do not enable JEV pruning, a semantic cache, or lossy compression to fix an ordinary context problem. The v0.7.0 experiment spent more JEV tokens than its small candidate packet and an aggressive threshold lost required context. Use deterministic pruning and host-native compaction first.

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
