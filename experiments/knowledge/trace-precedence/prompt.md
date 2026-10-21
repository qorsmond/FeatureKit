---
max_turns: 60
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

Explain exactly how Click resolves an option's value when it could come from the command line, an environment variable (including one derived from `auto_envvar_prefix`), the context's `default_map`, or the option's default. Give the precedence order and the functions or methods that implement each step, with file paths and line numbers, following the call chain from `Command.main`. Also explain how a subcommand gets its own `default_map` and `auto_envvar_prefix` from its parent. Do not modify any files.

This is the Click repository. Run Python with /opt/homebrew/bin/python3.13; the default python3 is too old for this package.
