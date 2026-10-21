"""Payload validation. Returns an error message or None."""


def validate_item(body):
    if not isinstance(body, dict):
        return "body must be an object"
    name = body.get("name")
    if not isinstance(name, str) or not name.strip():
        return "name must be a non-empty string"
    quantity = body.get("quantity")
    if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 0:
        return "quantity must be a non-negative integer"
    return None
