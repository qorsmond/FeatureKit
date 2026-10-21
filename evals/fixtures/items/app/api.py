"""Request handling without a network: handle(method, path, body) -> (status, payload)."""

from app import store
from app.validation import validate_item


def handle(method, path, body=None):
    parts = [part for part in path.split("?")[0].split("/") if part]
    if parts == ["items"]:
        if method == "GET":
            return 200, {"items": store.all_items()}
        if method == "POST":
            error = validate_item(body)
            if error:
                return 400, {"error": error}
            return 201, store.add(body["name"].strip(), body["quantity"])
    if len(parts) == 2 and parts[0] == "items" and parts[1].isdigit():
        item = store.get(int(parts[1]))
        if method == "GET":
            return (200, item) if item else (404, {"error": "not found"})
    return 404, {"error": "not found"}
