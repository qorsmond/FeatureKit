---
type: lessons
title: Verified lessons
description: Facts agents verified while working here, each with its evidence.
status: stable
---
# Verified lessons

- An in-memory SQLite engine (`sqlite://`) gives each pooled connection its own empty database; tests that need shared state across sessions use `poolclass=StaticPool`. Verified 2026-08-12 while fixing a flaky check.
- A `TypeDecorator` subclass without `cache_ok` makes statements uncacheable and emits a warning on first compile; see `TypeDecorator.cache_ok` in `lib/sqlalchemy/sql/type_api.py`. Verified 2026-09-03.
- The order of INSERTs and UPDATEs within a flush comes from `UOWTransaction.execute` in `lib/sqlalchemy/orm/unitofwork.py`, which runs the sorted post-sort actions; row statements are emitted by `persistence._save_obj`. Verified 2026-09-21 while debugging a cascade order issue.
- `Pool._should_wrap_creator` in `lib/sqlalchemy/pool/base.py` decides whether a `creator` callable receives the connection record. Verified 2026-07-30.
