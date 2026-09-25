# Compaction

Load this only for a long session approaching host compaction. Keep the task capsule current at phase boundaries and before manual compaction. Capsules contain bounded state and references, never a transcript.

## Codex: native compaction

Use Codex native compaction. Current `PreCompact` and `PostCompact` hooks may observe or stop the event but cannot replace the message list. The optional FeatureKit `SessionStart` hook runs after native compaction and injects only the path, task ID, and revision of exactly one active capsule; it ignores the transcript. Missing, corrupt, completed, or ambiguous capsules produce no output.

For a skills-only install, merge this group into `hooks.SessionStart` in `~/.codex/hooks.json`, replacing the checkout path and preserving existing groups:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "^compact$",
        "hooks": [
          {
            "type": "command",
            "command": "/bin/zsh -ic 'exec node \"/absolute/path/to/FeatureKit/skills/productivity/orchestrate-work/scripts/compaction-hook.mjs\"'",
            "timeout": 3,
            "statusMessage": "Restoring FeatureKit task state"
          }
        ]
      }
    ]
  }
}
```

Review and trust only that hook in `/hooks`, then start a new task. Turning it off removes this group or disables the exact hook; native compaction continues either way. After compaction, revalidate the capsule snapshot before reusing evidence.

## Claude Code: optional pinned JEV pilot

Claude native compaction remains the default. The upstream [`fast-jev-compaction`](https://github.com/tamaratran/fast-jev-compaction) function hook is an optional transcript-sharing pilot, not a FeatureKit dependency. It sends conversation text and tool-call metadata to TypeSafe while omitting tool-result bodies, so use it only with explicit `transcript_compaction` permission and no secrets or prohibited source in the session.

Pin the reviewed v0.7.0 pilot revision and enable it for one session:

```sh
git clone https://github.com/tamaratran/fast-jev-compaction.git /absolute/path/to/fast-jev-compaction
git -C /absolute/path/to/fast-jev-compaction checkout e3f262a7f4d42bd8dd32ced30d26176f7cb545b0
export CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1
claude --plugin-dir /absolute/path/to/fast-jev-compaction
```

Keep `TYPESAFE_API_KEY` in the launching environment. The pinned hook was built against Claude Code 2.1.274; verify the installed version and re-review the generated hook types after upgrades. Starting Claude normally without `--plugin-dir` switches the pilot off.

The upstream defaults preserve the newest six messages, require at least 25% estimated reduction, and compact at 60% context. Missing keys, provider/malformed-response errors, oversized state, and insufficient reduction delegate to Claude's built-in compaction. User/assistant text kept in the output remains verbatim; paired tool calls/results stay interpretable. Do not install the plugin permanently or tune thresholds until a session-scoped paired trial shows a complete-task saving with equivalent quality.
