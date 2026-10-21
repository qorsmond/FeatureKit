---
type: adr
title: Shell completion may call convert
description: Superseded. Completion called ParamType.convert on candidate values.
status: deprecated
superseded_by: docs/adr/0004-completion-through-shell-complete.md
verified: {by: "human:maintainers", at: "2025-03-11T09:00:00Z"}
---
# ADR 0002: Shell completion may call convert (superseded)

Completion generated candidates by calling `ParamType.convert` on each known value and keeping the ones that converted without error.

Superseded by ADR 0004.
