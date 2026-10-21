---
type: adr
title: Completion goes through shell_complete
description: Types offer completions only via ParamType.shell_complete returning CompletionItem objects; completion never calls convert.
status: stable
supersedes: docs/adr/0002-completion-may-call-convert.md
verified: {by: "human:maintainers", at: "2026-05-19T14:00:00Z"}
sources: [{resource: src/click/shell_completion.py}, {resource: src/click/types.py}]
---
# ADR 0004: Completion goes through shell_complete

A parameter type provides completions by overriding `ParamType.shell_complete(ctx, param, incomplete)` and returning a list of `click.shell_completion.CompletionItem`. Completion must not call `convert`, because conversion can be expensive and may fail on partial input. `Choice.shell_complete` is the reference implementation.

Tests for completion behavior live in `tests/test_shell_completion.py` and use its `_get_completions` helper.
