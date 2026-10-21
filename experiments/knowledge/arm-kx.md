## Project knowledge index

This repository has a derived local knowledge index. Use it before searching or reading files:

1. `python3 .kx/kx.py map` for the central modules and the project's decisions and lessons, with their status.
2. `python3 .kx/kx.py find <terms>` for ranked symbols, docs, decisions and lessons with file and line locations.
3. `python3 .kx/kx.py node <Symbol>` for one symbol's location, callers, callees, tests and the knowledge that mentions it.

Then read only the line ranges you need. Source files stay authoritative: results marked STALE changed after indexing, and SUPERSEDED or DEPRECATED knowledge is not current.
