#!/usr/bin/env bash
# Fetches SQLAlchemy at the pinned commit and a verification venv into .cache/ (network needed once).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
commit=8301becbe64bb7dd87671c2c5285df9f0e22547f
mkdir -p "$here/.cache"
if [ ! -d "$here/.cache/sqlalchemy" ]; then
  git init -q "$here/.cache/sqlalchemy"
  git -C "$here/.cache/sqlalchemy" fetch -q --depth 1 https://github.com/sqlalchemy/sqlalchemy.git "$commit"
fi
[ -x "$here/.cache/venv/bin/python" ] || { uv venv -q --python 3.13 "$here/.cache/venv" && uv pip install -q --python "$here/.cache/venv/bin/python" typing_extensions; }
echo "ready: sqlalchemy $commit"
