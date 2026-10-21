"""Acceptance for PATCH /items/<id> quantity updates."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import store
from app.api import handle


def check():
    store.reset()
    handle("POST", "/items", {"name": "bolt", "quantity": 5})
    assert handle("PATCH", "/items/1", {"quantity": 7}) == (200, {"id": 1, "name": "bolt", "quantity": 7})
    assert handle("GET", "/items/1") == (200, {"id": 1, "name": "bolt", "quantity": 7})
    for bad in ({"quantity": -1}, {"quantity": "3"}, {"quantity": True}, {}, None, {"quantity": 1, "name": "x"}):
        assert handle("PATCH", "/items/1", bad)[0] == 400, f"rejects {bad!r}"
    assert handle("GET", "/items/1")[1]["quantity"] == 7, "rejected patches change nothing"
    assert handle("PATCH", "/items/99", {"quantity": 1})[0] == 404
    print("PASS: check_patch")


if __name__ == "__main__":
    check()
