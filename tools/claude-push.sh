#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Runs natively on Josh's Mac. Watches the repo for a push request written by
# Claude (which can write files into this folder but has no network and no
# credentials), then commits and pushes as you.
#
#   ./tools/claude-push.sh
#
# Pushes to a WORK BRANCH, never straight to main. CI runs the browser suite on
# that branch, and .github/workflows/promote.yml fast-forwards main only when it
# passes — so a broken build can't reach Abbie, who reads main via Pages.
# ---------------------------------------------------------------------------
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${CLAUDE_PUSH_BRANCH:-claude/work}"
REQUEST="$REPO/.claude-push-request"
RESULT="$REPO/.claude-push-result"
LOG="$REPO/.claude-push.log"
INTERVAL="${CLAUDE_PUSH_INTERVAL:-5}"

cd "$REPO" || exit 1

say() { printf '%s  %s\n' "$(date '+%H:%M:%S')" "$*" | tee -a "$LOG"; }

result() {   # status, detail
  printf '%s\n%s\n%s\n' "$1" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$2" > "$RESULT"
}

say "watching $REPO — pushing to '$BRANCH' every ${INTERVAL}s when asked. Ctrl-C to stop."

while true; do
  if [ -f "$REQUEST" ]; then
    MSG="$(cat "$REQUEST")"
    rm -f "$REQUEST"
    [ -z "$MSG" ] && MSG="Update from Claude"
    say "push requested: $(printf '%s' "$MSG" | head -1)"

    if [ -z "$(git status --porcelain)" ]; then
      say "  nothing to commit"
      result "noop" "working tree was clean"
      sleep "$INTERVAL"; continue
    fi

    git add -A
    if ! git commit -q -F - <<< "$MSG"; then
      say "  commit failed"
      result "error" "git commit failed - see .claude-push.log"
      sleep "$INTERVAL"; continue
    fi

    SHA="$(git rev-parse --short HEAD)"

    if ! git push -q origin "HEAD:$BRANCH" 2>>"$LOG"; then
      say "  push failed (see .claude-push.log). Commit $SHA is safe locally."
      result "push-failed" "commit $SHA made locally but push failed"
      sleep "$INTERVAL"; continue
    fi

    say "  pushed $SHA to $BRANCH"
    result "ok" "commit $SHA pushed to $BRANCH"
  fi
  sleep "$INTERVAL"
done
