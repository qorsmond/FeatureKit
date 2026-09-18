"""Acceptance check: fails on the baseline; run only against a scratch copy."""

from http.server import ThreadingHTTPServer
import json
from threading import Thread
from urllib.error import HTTPError
from urllib.request import urlopen

from server import Handler


def check():
    with ThreadingHTTPServer(("127.0.0.1", 0), Handler) as server:
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f"http://127.0.0.1:{server.server_port}"
        try:
            with urlopen(base + "/health", timeout=3) as response:
                assert response.status == 200
                assert response.headers.get_content_type() == "application/json"
                assert json.load(response) == {"status": "ok", "version": 1}
            try:
                urlopen(base + "/missing", timeout=3)
            except HTTPError as error:
                assert error.code == 404
                error.close()
            else:
                raise AssertionError("unknown path must return 404")
        finally:
            server.shutdown()
            thread.join()
    print("PASS: live HTTP health response and unknown-route behavior")


if __name__ == "__main__":
    check()
