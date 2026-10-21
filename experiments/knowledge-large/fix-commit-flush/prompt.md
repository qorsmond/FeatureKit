---
max_turns: 50
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

Bug report: after `session.add(obj)` and `session.commit()`, the new row is missing from the database, and changes to loaded objects are not saved either. Calling `session.flush()` before `commit()` works around it. Fix the bug in the library. `checks/check_commit_flush.py` is the acceptance check; do not edit it.

This is the SQLAlchemy repository. Run Python as `PYTHONPATH=lib:checks/_vendor /opt/homebrew/bin/python3.13`; the default python3 is too old.
