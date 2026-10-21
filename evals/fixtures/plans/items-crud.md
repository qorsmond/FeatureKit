# Plan: item updates

Status: approved by the user on 2026-10-20 for implementation of both slices in order.

Out of scope for every slice: persistence, auth, new dependencies, editing files under `checks/` except adding the named acceptance check.

### Slice 1: Delete an item

Scope: `DELETE /items/<id>` returns `(204, {})` and removes the item; unknown or repeated ids return `404`; collection delete returns `404`.

Acceptance: `checks/check_delete.py` passes; `checks/check_items.py` still passes.

Status: done
Evidence: `python3 checks/check_delete.py` and `python3 checks/check_items.py` passed on the final tree (2026-10-20).
Notes: Routing is in `app/api.py` `handle()`; item ids come from the path's second segment. Store mutations live in `app/store.py`; tests call `store.reset()` first. Validation helpers live in `app/validation.py` and return an error string or `None`.

### Slice 2: Update an item's quantity

Scope: `PATCH /items/<id>` with body `{"quantity": <int>}` updates only the quantity and returns `(200, item)`. Reject a missing, negative, non-integer or boolean quantity, a non-object body, or any other field with `400` and change nothing. Unknown ids return `404`.

Acceptance: `checks/check_patch.py` (already written, do not edit) passes; slice 1 and existing checks still pass.

Status: pending
