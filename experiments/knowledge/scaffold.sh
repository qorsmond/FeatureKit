#!/usr/bin/env bash
# Builds one workspace: Click at the pinned commit, the project-knowledge overlay, the case's
# change, and (for the kx arm) the derived index. Usage: scaffold.sh <case> <arm>
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
git -C "$here/.cache/click" archive 2247b35ea1c47c727d7a06e51fa280e12a863ff6 | tar -x
cp -R "$here/fixtures/overlay/." .
if [ "$1" = fix ]; then
  /opt/homebrew/bin/python3.13 - <<'PY'
from pathlib import Path
p = Path("src/click/core.py"); t = p.read_text()
seed = """
                # A string from default_map must be split for multi-value
                # parameters, matching value_from_envvar behavior.
                if isinstance(value, str) and self.nargs != 1:
                    value = self.type.split_envvar_value(value)
"""
assert t.count(seed) == 1
p.write_text(t.replace(seed, "\n"))
PY
fi
git init -q
git add -A
git -c user.name=eval -c user.email=eval@example.com commit -qm "Base state"
if [ "${2:-}" = trigger ]; then
  mkdir -p .kx && cp "$here/../../skills/productivity/using-featurekit/scripts/kx.py" .kx/kx.py && echo ".kx/" >> .git/info/exclude
  python3 .kx/kx.py build >/dev/null
fi
if [ "${2:-}" = kx ]; then
  mkdir -p .kx && cp "$here/kx.py" .kx/kx.py && echo ".kx/" >> .git/info/exclude
  python3 .kx/kx.py build >/dev/null
fi
