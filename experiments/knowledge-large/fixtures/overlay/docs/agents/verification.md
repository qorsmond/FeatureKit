---
type: guide
title: Verification
description: How to run checks in this repo's agent environment.
status: stable
verified: {by: "human:maintainers", at: "2026-10-01T08:00:00Z"}
---
# Verification

The library needs Python 3.11 or newer and `typing_extensions`. In the agent environment run Python as `PYTHONPATH=lib:checks/_vendor /opt/homebrew/bin/python3.13`. `pytest` is not installed here, so the suite under `test/` runs in CI only. Acceptance checks for agent tasks live in `checks/` and run directly.
