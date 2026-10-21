"""In-memory item store."""

_items = {}
_next_id = 1


def reset():
    global _next_id
    _items.clear()
    _next_id = 1


def add(name, quantity):
    global _next_id
    item = {"id": _next_id, "name": name, "quantity": quantity}
    _items[_next_id] = item
    _next_id += 1
    return dict(item)


def get(item_id):
    item = _items.get(item_id)
    return dict(item) if item else None


def all_items():
    return [dict(item) for item in _items.values()]
