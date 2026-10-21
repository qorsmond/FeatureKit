---
max_turns: 50
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

We plan to change `sqlalchemy.util.get_callable_argspec` so it returns `None` instead of raising `TypeError` for callables it cannot inspect. Without modifying files, list every caller in `lib/` (enclosing function and file:line), explain how each caller currently relies on the `TypeError` and what would break, and name the test file that covers the function directly. Be precise and complete.

This is the SQLAlchemy repository. Run Python as `PYTHONPATH=lib:checks/_vendor /opt/homebrew/bin/python3.13`; the default python3 is too old.
