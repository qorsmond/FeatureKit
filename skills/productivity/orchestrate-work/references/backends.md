# Worker Backends

Read only the section for the selected route. The live tool schema and installed CLI help take precedence over these examples. Model identifiers and supported reasoning settings come from the product repo's `docs/agents/orchestration.md` or verified native configuration.

## Common Contract

- Check availability, authentication mode and relevant permissions without reading credential files or printing secrets. Do not install tools, log in, change global settings or switch to API billing as an implicit fallback.
- Respect provider/data restrictions in the user request and repo guidance. Only send the assigned context. A new backend is not a way around a permission denial.
- Use a fresh bounded packet from `orchestrate-work`. Set a deadline or turn limit appropriate to the job; supervise with the host's process/agent controls. On timeout, stop and confirm exit before reassignment. A CLI exit code or a worker's success sentence alone does not establish correctness.
- Capture worker/run identifiers, lifecycle status, model/effort metadata with its source, the result, diagnostics and relevant diff. Relay these through `orchestrate-work`'s live human feedback. Label a CLI startup header as client-reported configuration, not provider-confirmed model identity; a result file alone does not confirm a model. Keep secrets out of logs; retain concise evidence rather than copying transcripts into the parent. Missing/invalid result or nonzero exit is not success.
- Account for automatically loaded skills, hooks, tools and configuration when choosing a CLI worker: startup context can outweigh a tiny assignment. Prefer direct tools/native workers when that avoids unnecessary context; do not discard governing instructions or permission controls to save tokens.
- Use the existing checkout and explicit file ownership. Do not create a branch/worktree or a user-facing task to obtain an ordinary worker.

## Native Workers (Codex, Claude Code, Other Harnesses)

Discover the worker tool and its actual schema. Set a model/effort override only when supported and authorized. Prefer a fresh context with the packet rather than inheriting the full conversation. In Codex tools exposing `fork_turns`, use `none` for a self-contained packet; a full-history fork can inherit the parent's model and prevent overrides. Other harnesses may expose roles, profiles or session settings instead.

Native worker selection and a new user task are different operations. Use worker/subagent controls to dispatch, await, steer, and stop work. Keep `handoff` and explicit fresh-task selection for transferring the overall task. Do not simulate worker scheduling through repeated task creation.

Workers inherit host permission boundaries; a role called “read-only” is not proof of an enforced filesystem sandbox. Use available restrictions and inspect results. If tools cannot support the requested restriction, choose a safer route or report the limitation. Existing native custom agents may be reused; FeatureKit does not need to install an agent family.

Codex can use explicit model settings, native defaults, and custom-agent settings; the effective configuration may override a requested selection. Record what the host reports, otherwise `unknown`. A worker using the same account does not establish separate subscription capacity. See [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Codex CLI

Inspect `codex --help`, `codex exec --help`, and `codex login status`. Confirm the intended subscription mode and model route before launch; do not extract authentication material. Preserve existing configuration and sandbox restrictions.

For a bounded read-only investigation, set `FK_REPO`, `FK_PACKET` and `FK_RESULT` to the intended paths, and `FK_MODEL` and `FK_EFFORT` to the configured model and its verified supported reasoning effort. Pass both explicitly so the worker does not inherit an expensive parent/default effort:

```sh
codex -a never exec -C "$FK_REPO" --model "$FK_MODEL" \
  -c "model_reasoning_effort=\"$FK_EFFORT\"" \
  --sandbox read-only -c agents.enabled=false \
  --output-last-message "$FK_RESULT" - < "$FK_PACKET"
```

Use a host-supervised deadline. `--json` can capture events when needed; do not treat estimated output fields as subscription billing. The output file should live in the work/scratch area, outside the assigned source files. If an approved implementation needs writes, use `workspace-write` only within the parent's allowed scope, with the packet naming owned files. `-a never` makes new approval needs fail for the primary to resolve; never replace failure with an approval/sandbox bypass.

Check the reported model and effort against the route. If the CLI or host cannot apply the requested settings, record the failure and reroute explicitly. Keep existing repo rules/skills available and name the required skill paths in the packet if discovery fails. See [Codex authentication](https://learn.chatgpt.com/docs/auth). Another Codex process may share the same usage pool as native workers.

## Claude Code CLI

Inspect installed `claude --help` and `claude auth status` (or the installed version's documented status command). Confirm subscription authentication, model selection, tool controls and limits. Environment/API/profile settings can take precedence over a saved login; report conflicting authentication rather than changing it silently. Do not use `--bare` for subscription workers: it excludes subscription OAuth. See [authentication](https://code.claude.com/docs/en/authentication) and [programmatic execution](https://code.claude.com/docs/en/headless).

Run only in a trusted checkout whose loaded hooks, MCP configuration and project instructions are appropriate for this task. Noninteractive startup can load those even before model tools run. A packet is not a sandbox.

For read-only file investigation, use the installed version's supported equivalents of this pattern, with working directory set to `FK_REPO` by the host:

```sh
claude -p --model "$FK_MODEL" --output-format json --max-turns 8 \
  --permission-mode dontAsk --tools "Read,Glob,Grep" \
  --disallowedTools "mcp__*" < "$FK_PACKET" > "$FK_RESULT"
```

This example deliberately exposes only file-reading tools; the packet supplies skill paths to read. `--allowedTools` alone is an auto-approval list, not the tool inventory. For implementation, derive a narrow inventory and permission allowlist from the approved packet, preserving host restrictions; do not add blanket shell or permission bypasses. Permission failures return to the primary. CLI permission controls are not a replacement for the parent filesystem sandbox. Verify required flags against [CLI reference](https://code.claude.com/docs/en/cli-reference).

Inspect both exit status and the JSON result/error state, including turn-limit exhaustion. Log actual model metadata if present; aliases can resolve differently over time. Do not enable an automatic fallback model or paid API route to conceal exhaustion. No Claude installation means this route is unavailable, not a failed feature workflow.

## Other Backends And Manual Use

Reuse an existing authenticated native/CLI interface only when its model selection, result capture and permission behavior are known. No provider SDK is required. Where programmatic workers are unavailable, run the existing workflow directly or provide the same compact packet for a user-selected agent. Report unavailable automation honestly; do not claim a dispatch happened.
