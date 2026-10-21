---
max_turns: 60
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

We are considering changing `ParamType.split_envvar_value` so it no longer splits on whitespace when `envvar_list_splitter` is None. Without modifying files, list every place in the library that calls it (function and file:line), the types that override the splitting behavior, and the test files most likely to need updates. Be precise and complete.

This is the Click repository. Run Python with /opt/homebrew/bin/python3.13; the default python3 is too old for this package.
