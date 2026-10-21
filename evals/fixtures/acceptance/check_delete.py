"""Acceptance for DELETE /items/<id>."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import store
from app.api import handle


def check():
    store.reset()
    handle("POST", "/items", {"name": "bolt", "quantity": 5})
    handle("POST", "/items", {"name": "nut", "quantity": 2})
    assert handle("DELETE", "/items/1") == (204, {}), "delete returns 204 with an empty payload"
    assert handle("GET", "/items/1")[0] == 404, "deleted item is gone"
    assert handle("GET", "/items") == (200, {"items": [{"id": 2, "name": "nut", "quantity": 2}]})
    assert handle("DELETE", "/items/1")[0] == 404, "second delete is 404"
    assert handle("DELETE", "/items/99")[0] == 404
    assert handle("DELETE", "/items")[0] == 404, "collection delete is not supported"
    print("PASS: check_delete")


if __name__ == "__main__":
    check()
