---
type: adr
title: Custom column types subclass UserDefinedType
description: Superseded. New column types subclassed UserDefinedType and left cache_ok unset.
status: deprecated
superseded_by: docs/adr/0007-custom-types-use-typedecorator.md
verified: {by: "human:maintainers", at: "2024-02-08T09:00:00Z"}
---
# ADR 0002: Custom column types subclass UserDefinedType (superseded)

Application column types subclassed `UserDefinedType` and implemented `get_col_spec`. `cache_ok` was left unset.

Superseded by ADR 0007.
