---
type: adr
title: Custom types adapt existing types with TypeDecorator
description: Types that store values through an existing database type subclass TypeDecorator with impl, set cache_ok, and keep conversion pure.
status: stable
supersedes: docs/adr/0002-custom-types-subclass-userdefinedtype.md
verified: {by: "human:maintainers", at: "2026-04-14T11:00:00Z"}
sources: [{resource: lib/sqlalchemy/sql/type_api.py}, {resource: doc/build/core/custom_types.rst}]
---
# ADR 0007: Custom types adapt existing types with TypeDecorator

A type that stores Python values through an existing database type subclasses `TypeDecorator`, sets `impl` to that type, and converts values in `process_bind_param` and `process_result_value`. It sets `cache_ok = True` whenever its constructor arguments are hashable, so statements using it stay cacheable. Conversion methods are pure: no queries, I/O, or session access.

Tests for types live in `test/sql/test_types.py`.
