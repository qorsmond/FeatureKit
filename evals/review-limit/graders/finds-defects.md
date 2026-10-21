---
type: llm
---
The review must report, as blocking problems, both: (1) a non-numeric limit such as `limit=abc` raises an exception instead of returning 400, and (2) zero or negative limits are not rejected with 400 (for example `limit=-1` returns items). Pass only if both are identified.