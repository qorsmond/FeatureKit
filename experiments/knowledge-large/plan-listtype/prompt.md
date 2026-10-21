---
max_turns: 50
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

We need a `CommaSeparatedList` column type that stores a Python list of strings in a VARCHAR column as comma-separated text. Do not write code. Produce an implementation plan: the base class and the attributes and methods to implement, the existing code or documentation to follow, the project decisions that constrain the design, and the existing test file to extend. Cite file paths.

This is the SQLAlchemy repository. Run Python as `PYTHONPATH=lib:checks/_vendor /opt/homebrew/bin/python3.13`; the default python3 is too old.
