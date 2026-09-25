# Host optimization

Load this only when the selected route needs host-specific execution or measurement.

## Codex

- Give native workers a self-contained capsule projection. Use fresh context (`fork_turns: "none"` when exposed) and pass an explicit supported model/effort only when the host allows overrides.
- Keep Codex native compaction. Do not replace or parse its transcript; use [compaction.md](compaction.md) to restore a capsule pointer afterward.
- For a launched `codex exec` worker, add `--ignore-user-config` with an explicit `--model`, reasoning effort, `--sandbox`, and `-a never`, when the user config holds no restriction the worker needs. It keeps user MCP servers and defaults out of the worker. On a bounded fix it cut median input from 170k to 74k tokens with equal results, and it stopped a user MCP server from writing files into the repo. Do not add `--ignore-rules`, because execpolicy rules are a safety control.
- Record requested and runtime-reported model/effort separately. Per-task tokens, cached tokens, reasoning, cost, and tool-schema size stay `unknown` unless the host reports them for that run.
- Do not assume Responses API tool-search, cache, or compaction settings are configurable in the Codex app. Measure the surface the active host exposes.

## Claude Code

- Use isolated subagents with an explicit model, effort, turn limit, minimal tools/MCP, and a capsule projection. Use `omitClaudeMd` only when the packet contains every governing rule.
- Check `/mcp` and `/context all` before changing tool loading. MCP schemas are normally deferred; use `ENABLE_TOOL_SEARCH=auto` only when the active environment is preloading a material catalogue.
- For a launched `claude -p` worker, an explicit `--tools` list already keeps startup lean. Adding `--strict-mcp-config`, `--setting-sources project,local`, `--disable-slash-commands`, and `--exclude-dynamic-system-prompt-sections` was cost-neutral in paired trials. Use them for isolation, not savings.
- Set `TASK_MAX_OUTPUT_LENGTH` or `MAX_MCP_OUTPUT_TOKENS` only after observed oversized output; retain enough room for required evidence.
- Use `/usage` or content-free OpenTelemetry metrics for tokens, cache, retries, compactions, and subagents. Keep prompt/tool-content logging disabled.

## Evidence

Record each enforced-route attempt through the optimizer `attempt` ledger. Requested settings are what was passed; runtime settings are only what the host reported for that run.

For a paired trial, record host/version, exposed settings, packet and schema characters, requested/reported model and effort, token/cache fields the host actually reports, compactions, retries, checks, and final verdict in the content-free task trace. Label unavailable readings `null` and simulated conditions as simulated. Stable instruction/tool prefixes help provider caches; avoid timestamps or regenerated prose in those prefixes.

References: [Codex hooks](https://learn.chatgpt.com/docs/hooks), [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [Claude Code features](https://code.claude.com/docs/en/features-overview), [Claude Code environment variables](https://code.claude.com/docs/en/env-vars), and [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage).
