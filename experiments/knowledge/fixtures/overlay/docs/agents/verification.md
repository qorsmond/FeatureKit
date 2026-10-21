---
type: guide
title: Verification
description: How to run checks in this repo's agent environment.
status: stable
verified: {by: "human:maintainers", at: "2026-10-01T08:00:00Z"}
---
# Verification

The package needs Python 3.10 or newer: use `/opt/homebrew/bin/python3.13`. `pytest` is not installed in the agent environment, so the test suite under `tests/` runs in CI only. Acceptance checks for agent tasks live in `checks/` and run directly:

```sh
/opt/homebrew/bin/python3.13 checks/<check>.py
```
