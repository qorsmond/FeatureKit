#!/usr/bin/env bash
# Fetches the pinned Click checkout used by the impact case into evals/.cache/ (network needed once).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
commit=2247b35ea1c47c727d7a06e51fa280e12a863ff6
if [ ! -d "$here/.cache/click" ]; then
  git init -q "$here/.cache/click"
  git -C "$here/.cache/click" fetch -q --depth 1 https://github.com/pallets/click.git "$commit"
fi
echo "ready: click $commit"
