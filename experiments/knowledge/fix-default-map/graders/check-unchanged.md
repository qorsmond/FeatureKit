---
type: regex
target: { source: file, path: checks/check_default_map.py }
pattern: "from_map = runner.invoke\\(cli, \\[\\], default_map=\\{\"pair\": \"a b\"\\}\\)"
---
