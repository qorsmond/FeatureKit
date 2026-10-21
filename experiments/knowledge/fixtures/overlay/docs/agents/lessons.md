---
type: lessons
title: Verified lessons
description: Facts agents verified while working here, each with its evidence.
status: stable
---
# Verified lessons

- Value precedence for a parameter is decided in one place, `Parameter.consume_value` in `src/click/core.py`: command line, then environment variable, then `default_map`, then the default. Use `Context.get_parameter_source` to see which one won. Evidence: `tests/test_defaults.py` and `tests/test_options.py`, verified 2026-09-30.
- Environment variables for options without an explicit `envvar` come from `Option.resolve_envvar_value`, which builds `{auto_envvar_prefix}_{NAME}`; a subcommand's prefix is its parent's prefix plus its own name. Verified 2026-09-30.
