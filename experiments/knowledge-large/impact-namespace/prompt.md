---
max_turns: 50
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

We plan to remove the `default` parameter from `sqlalchemy.sql.base._entity_namespace_key`, so it always raises `InvalidRequestError` when the key is missing. Without modifying files, list every call site in `lib/` (enclosing function and file:line), say which call sites pass `default` and how their behavior would change, and which are unaffected.

This is the SQLAlchemy repository. Run Python as `PYTHONPATH=lib:checks/_vendor /opt/homebrew/bin/python3.13`; the default python3 is too old.
