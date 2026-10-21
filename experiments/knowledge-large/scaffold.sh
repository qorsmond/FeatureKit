#!/usr/bin/env bash
# Builds one workspace: SQLAlchemy at the pinned commit, the project-knowledge overlay, the case's
# change, and (for the kx arms) the derived index. Usage: scaffold.sh <case> <arm>
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
git -C "$here/.cache/sqlalchemy" archive 8301becbe64bb7dd87671c2c5285df9f0e22547f | tar -x
cp -R "$here/fixtures/overlay/." .
if [ "$1" = fix ]; then
  /opt/homebrew/bin/python3.13 - <<'PY'
from pathlib import Path
p = Path("lib/sqlalchemy/orm/session.py"); t = p.read_text()
seed = "                if self.session._is_clean():\n                    break\n                self.session.flush()\n"
assert t.count(seed) == 1
p.write_text(t.replace(seed, "                if not self.session._is_clean():\n                    break\n                self.session.flush()\n"))
PY
fi
git init -q
git add -A
git -c user.name=eval -c user.email=eval@example.com commit -qm "Base state"
case "${2:-}" in trigger)  # the integrated script copied to .kx/, named by an always-on trigger line
  mkdir -p .kx && cp "$here/../../skills/productivity/using-featurekit/scripts/kx.py" .kx/kx.py && echo ".kx/" >> .git/info/exclude
  python3 .kx/kx.py build >/dev/null ;;
indexed | nohooks)  # the integrated script, as setup-featurekit enables it
  echo ".kx/" >> .git/info/exclude
  python3 "$here/../../skills/productivity/using-featurekit/scripts/kx.py" build >/dev/null ;;
kx*)
  mkdir -p .kx && cp "$here/../knowledge/kx.py" .kx/kx.py && echo ".kx/" >> .git/info/exclude
  python3 .kx/kx.py build >/dev/null ;;
esac
