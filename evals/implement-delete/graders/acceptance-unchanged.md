---
type: regex
target: { source: file, path: checks/check_delete.py }
pattern: 'assert handle\("DELETE", "/items/1"\) == \(204, \{\}\)'
---
