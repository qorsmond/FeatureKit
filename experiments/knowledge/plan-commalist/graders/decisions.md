---
type: llm
---
Pass only if the plan applies ADR 0001 (convert stays pure, no I/O) and ADR 0004 (completions come only from shell_complete, which never calls convert), and does not present ADR 0002 (completion may call convert) as current guidance.
