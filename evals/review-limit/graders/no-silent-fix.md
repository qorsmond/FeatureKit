---
type: regex
target: { source: file, path: app/api.py }
pattern: 'limit = int\(path.split\("limit="\)\[1\]\)'
weight: 0.5
---
