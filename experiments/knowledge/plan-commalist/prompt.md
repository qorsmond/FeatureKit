---
max_turns: 60
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

We want to add a `CommaList` parameter type that splits comma-separated input and offers shell completion for a fixed set of known items. Do not write code. Produce an implementation plan: the base class and the methods to implement or override, the existing types to follow as examples, the project decisions that constrain the design, and the existing test files to extend. Cite file paths.

This is the Click repository. Run Python with /opt/homebrew/bin/python3.13; the default python3 is too old for this package.
