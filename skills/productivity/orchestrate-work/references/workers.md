# Workers

Load this only when work is delegated or a delegated attempt failed.

## Packet

Give one worker one outcome:

```text
Objective and active skill
Approved artifact, owned scope, exclusions
Repository snapshot and relevant paths/symbols (from the slice's Notes)
Governing ADR/security/interface constraints
Acceptance and expected proof
Attempt/time bound and stop conditions
Return: complete | blocked | uncertain | needs-stronger-reasoning; changed paths or findings; checks and results; gaps
```

Reference shared artifacts by path. Workers retrieve source locally and receive no transcript, whole-repo dump, or unrelated procedure. `complete` covers only the assignment. Use one stable label across attempts (`[W1 planned]`, `[W1 dispatched]`, `[W1 checking]`, `[W1 accepted|rejected|blocked]`) and stop a writer before reassigning its files.

## Fresh-session workers

A fresh CLI session runs a whole slice on the routed model and can take the routed effort, which in-session worker tools often cannot. Check `--help` and the login status first; never read credential files, log in, install tools, or switch to API billing as a fallback. Use the existing checkout and named file ownership; create no branch, worktree, or user task. Set a deadline, capture the run ID, exit status, reported model/effort, result, and diff. An exit code or a worker's success sentence is not acceptance.

Codex, with `FK_*` set to the repo, packet, result path, routed model, and its supported effort:

```sh
codex -a never exec -C "$FK_REPO" --ignore-user-config --model "$FK_MODEL" \
  -c "model_reasoning_effort=\"$FK_EFFORT\"" --sandbox workspace-write \
  -c agents.enabled=false --output-last-message "$FK_RESULT" - < "$FK_PACKET"
```

`--ignore-user-config` keeps user MCP servers and defaults out of the worker (measured: median input 170k to 74k tokens with equal results). Never add `--ignore-rules`. Use `--sandbox read-only` for investigations.

Claude Code, from the repo directory:

```sh
claude -p --model "$FK_MODEL" --effort "$FK_EFFORT" --output-format json --max-turns 30 \
  --permission-mode dontAsk --tools "Read,Glob,Grep,Edit,Write,Bash" \
  --disallowedTools "mcp__*" < "$FK_PACKET" > "$FK_RESULT"
```

Narrow `--tools` and the permission allowlist to the packet; do not add blanket permission bypasses or `--bare` (it drops subscription login). Check both the exit status and the JSON error state, including turn-limit exhaustion. An in-session Claude worker accepts a model but not an effort; record its effort as `null`.

## Recover

- Concrete mistake or missing fact: give the evidence and allow one focused retry.
- Insufficient reasoning or conflicting evidence: escalate once to a stronger level with a failure packet instead of restarting discovery: the route tried, a one-line failure summary, the changed paths, the evidence location, and `continue from the failed tree`. The stronger attempt fixes the recorded failure and may discard the attempt's changes when the evidence shows they are wrong. (Measured: one file read instead of five, 35% less input, 29% lower cost per escalation.)
- Missing environment, permission, authentication, quota, runtime, or device: use another authorized route or report the prerequisite. Stronger reasoning cannot create access.
- Ambiguous scope or ADR conflict: return to the governing workflow or the user; no worker guesses.

For high-risk, surprising, or hard-to-reverse changes, use a fresh-context `review-change` or `security-review` with the requirements, constraints, stable diff, and current checks, but not the implementer's rationale. The reviewer reports findings; the primary decides.
