#!/usr/bin/env bash
# Fetches the pinned Click checkout and a verification environment into .cache/ (network needed once).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
commit=2247b35ea1c47c727d7a06e51fa280e12a863ff6
mkdir -p "$here/.cache"
[ -d "$here/.cache/click" ] || git clone -q https://github.com/pallets/click.git "$here/.cache/click"
git -C "$here/.cache/click" cat-file -e "$commit" 2>/dev/null || git -C "$here/.cache/click" fetch -q --unshallow
[ -x "$here/.cache/venv/bin/python" ] || { uv venv -q --python 3.13 "$here/.cache/venv" && uv pip install -q --python "$here/.cache/venv/bin/python" pytest; }
echo "ready: click $commit"
