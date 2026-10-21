"""Existing behavior: create, list, get, validation errors, unknown routes."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import store
from app.api import handle


def check():
    store.reset()
    assert handle("POST", "/items", {"name": "bolt", "quantity": 5}) == (201, {"id": 1, "name": "bolt", "quantity": 5})
    assert handle("POST", "/items", {"name": " nut ", "quantity": 0})[0] == 201
    assert handle("POST", "/items", {"name": "", "quantity": 1})[0] == 400
    assert handle("POST", "/items", {"name": "x", "quantity": -1})[0] == 400
    assert handle("POST", "/items", {"name": "x", "quantity": True})[0] == 400
    assert handle("GET", "/items") == (200, {"items": [{"id": 1, "name": "bolt", "quantity": 5}, {"id": 2, "name": "nut", "quantity": 0}]})
    assert handle("GET", "/items/1") == (200, {"id": 1, "name": "bolt", "quantity": 5})
    assert handle("GET", "/items/9")[0] == 404
    assert handle("GET", "/nope")[0] == 404
    print("PASS: check_items")


if __name__ == "__main__":
    check()
