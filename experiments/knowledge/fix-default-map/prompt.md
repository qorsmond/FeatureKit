---
max_turns: 60
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

Bug report: an option declared with `nargs=2` gets its value split correctly from its environment variable (`PAIR="a b"`), but the same string supplied through `default_map` fails with "Value must be an iterable". Fix the bug in the library. `checks/check_default_map.py` is the acceptance check; do not edit it.

This is the Click repository. Run Python with /opt/homebrew/bin/python3.13; the default python3 is too old for this package.
