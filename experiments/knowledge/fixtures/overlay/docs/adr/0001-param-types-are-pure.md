---
type: adr
title: Parameter type conversion is pure
description: ParamType.convert must not perform I/O; checks that need I/O belong in callbacks.
status: stable
verified: {by: "human:maintainers", at: "2026-06-02T10:00:00Z"}
sources: [{resource: src/click/types.py}, {resource: src/click/core.py}]
---
# ADR 0001: Parameter type conversion is pure

`ParamType.convert` turns a raw value into a Python value and raises through `self.fail` on invalid input. It must not open network connections, start processes, or read files beyond what the type itself represents (`File` and `Path` are the documented exceptions). Validation that needs I/O or other parameters belongs in a parameter `callback`.

Consequence: new types are cheap to call repeatedly, including from shell completion and default processing.
