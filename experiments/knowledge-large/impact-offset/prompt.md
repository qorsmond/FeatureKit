---
max_turns: 50
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

We plan to make `sqlalchemy.sql.util._offset_or_limit_clause` reject negative integers. Without modifying files, list every place in `lib/` that calls this function, directly or through another helper (enclosing function and file:line). `GenerativeSelect` has a method with the same name: say which call sites reach that method instead, so we do not change the wrong code path. Name the test files that cover LIMIT/OFFSET behavior for ORM queries and Core selects.

This is the SQLAlchemy repository. Run Python as `PYTHONPATH=lib:checks/_vendor /opt/homebrew/bin/python3.13`; the default python3 is too old.
