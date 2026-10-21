---
max_turns: 50
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

When application code calls `Session.commit()` with pending and modified objects, trace how those changes reach the database. Name, in order, the methods and functions involved (with file paths and line numbers) from `Session.commit` through the transaction, the flush, the unit of work, and the persistence functions that emit INSERT and UPDATE statements. Do not modify any files.

This is the SQLAlchemy repository. Run Python as `PYTHONPATH=lib:checks/_vendor /opt/homebrew/bin/python3.13`; the default python3 is too old.
