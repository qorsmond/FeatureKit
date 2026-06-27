#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
command="$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"

if [ -z "$command" ]; then
  exit 0
fi

blocked_reason=""

case "$command" in
  git\ push*|*"; git push"*|*"&& git push"*|*"|| git push"*)
    blocked_reason="git push must be run by the user, not the agent."
    ;;
  git\ reset\ --hard*|*"; git reset --hard"*|*"&& git reset --hard"*)
    blocked_reason="git reset --hard can destroy local work."
    ;;
  git\ clean\ -f*|git\ clean\ -df*|git\ clean\ -fd*|*"; git clean -f"*|*"&& git clean -f"*)
    blocked_reason="git clean with force can delete untracked work."
    ;;
  git\ branch\ -D*|*"; git branch -D"*|*"&& git branch -D"*)
    blocked_reason="force-deleting branches must be confirmed by the user."
    ;;
  git\ checkout\ .|git\ checkout\ --\ .|git\ restore\ .|git\ restore\ :/|git\ restore\ --source*|*"; git checkout ."*|*"; git restore ."*)
    blocked_reason="whole-tree checkout/restore can discard work."
    ;;
esac

if [ -n "$blocked_reason" ]; then
  printf 'BLOCKED: %s\nCommand: %s\n' "$blocked_reason" "$command" >&2
  exit 2
fi

exit 0
