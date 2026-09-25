---
name: git-guardrails-claude-code
description: Set up Claude Code hooks that block dangerous git commands such as push, reset --hard, clean, destructive checkout/restore, and branch deletion. Use when a repo needs Claude Code-specific safety guardrails around git operations.
metadata:
  featurekit-version: "0.10.0"
---

# Git Guardrails For Claude Code

Install a Claude Code `PreToolUse` hook that blocks high-risk git commands before Claude runs them.

This is optional tooling. Use it only for repos where Claude Code is part of the workflow.

## What Gets Blocked

- `git push`, including force pushes.
- `git reset --hard`.
- `git clean` with force flags.
- `git branch -D`.
- destructive whole-tree checkout or restore.

## Process

1. Ask whether to install for this repo or globally:
   - repo: `.claude/settings.json`,
   - global: `~/.claude/settings.json`.
2. Copy `scripts/block-dangerous-git.sh` into the matching hooks directory:
   - repo: `.claude/hooks/block-dangerous-git.sh`,
   - global: `~/.claude/hooks/block-dangerous-git.sh`.
3. Make the copied script executable.
4. Merge a `PreToolUse` hook into the existing settings file. Do not overwrite unrelated settings.
5. Ask whether the user wants to add or remove blocked patterns.
6. Verify with:

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

The script should exit non-zero and print a blocked message.

## Settings Shape

Repo-local command:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

Global command:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

## Do Not

- Do not overwrite an existing Claude settings file.
- Do not install globally without explicit confirmation.
- Do not claim this protects Codex, OpenCode, or other agents. It is Claude Code-specific.
