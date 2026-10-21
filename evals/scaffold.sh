#!/usr/bin/env bash
# Builds one eval workspace in the current directory from evals/fixtures.
# Called by each case's scaffold.sh with the case's fixture name.
set -euo pipefail
evals="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fixtures="$evals/fixtures"
if [ "$1" = impact ]; then
  # Click at a pinned commit (run evals/fetch.sh once). Non-bare arms get the knowledge index that
  # setup-featurekit enables, built by the installed script.
  [ -d "$evals/.cache/click" ] || { echo "run evals/fetch.sh first" >&2; exit 1; }
  git -C "$evals/.cache/click" archive 2247b35ea1c47c727d7a06e51fa280e12a863ff6 | tar -x
  printf '.kx/\n' >> .gitignore
  git init -q && git add -A && git -c user.name=eval -c user.email=eval@example.com commit -qm "Base state"
  if [ "${2:-bare}" != bare ]; then python3 "$evals/../skills/productivity/using-featurekit/scripts/kx.py" build >/dev/null; fi
  exit 0
fi
cp -R "$fixtures/items/." .
case "$1" in
  gate) ;;
  implement | stale)
    mkdir -p docs/plans
    cp "$fixtures/plans/delete-item.md" docs/plans/
    cp "$fixtures/acceptance/check_delete.py" checks/
    if [ "$1" = stale ]; then cp "$fixtures/stale/docs/agents/verification.md" docs/agents/; fi ;;
  resume)
    cp -R "$fixtures/resume/." .
    mkdir -p docs/plans
    cp "$fixtures/plans/items-crud.md" docs/plans/ ;;
  review) ;;
  *) echo "unknown case: $1" >&2; exit 1 ;;
esac
git init -q
git add -A
git -c user.name=eval -c user.email=eval@example.com commit -qm "Base state"
if [ "$1" = review ]; then cp -R "$fixtures/review/." .; fi
