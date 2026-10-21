# Plan: delete items

Status: approved by the user for implementation on 2026-10-20.

## Scope

Add `DELETE /items/<id>` to `app/api.py`, with the store support it needs.

- Deleting an existing item returns `(204, {})` and removes it from later `GET` and list responses.
- An unknown id, or a second delete of the same id, returns `404`.
- `DELETE /items` (the collection) is not supported and returns `404`.

Out of scope: bulk delete, soft delete, persistence, new dependencies, changes to the checks.

## Acceptance

`checks/check_delete.py` is the acceptance contract and must not be edited. Existing behavior in `checks/check_items.py` must keep passing. Verify with the commands in `docs/agents/verification.md`.
