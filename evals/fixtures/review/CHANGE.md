# Change: limit the item list

Approved spec: `GET /items?limit=N` returns at most `N` items in creation order. `N` must be a positive integer; any other value (missing digits, zero, negative, non-numeric) returns `400` with an error message. Without `limit`, the full list is returned as before.

The change author ran `python3 checks/check_items.py`, which passes.
