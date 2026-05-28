#!/bin/bash
# state-lock.sh — Acquire/release lock på .ai/
#
# Bruk:
#   ./state-lock.sh acquire <agent-navn>  # returnerer 0 hvis fikk lock, 1 hvis blokkert
#   ./state-lock.sh release <agent-navn>  # frigir lock hvis du eier den
#   ./state-lock.sh status                # viser hvem som har lock

set -euo pipefail

PROJECT_ROOT="${KIT_CC_PROJECT_ROOT:-$(pwd)}"
LOCK_FILE="$PROJECT_ROOT/.ai/.lock"
MAX_LOCK_AGE_SEC=300  # 5 minutter — stale locks slippes automatisk

if [ $# -lt 1 ]; then
  echo "Bruk: $0 {acquire|release|status} [agent-navn]"
  exit 1
fi

action="$1"
agent="${2:-unknown}"

case "$action" in
  acquire)
    if [ -f "$LOCK_FILE" ]; then
      # Sjekk om lock er stale (stat -f på Mac/BSD, stat -c på Linux, fallback til 0)
      lock_mtime=$(stat -f %m "$LOCK_FILE" 2>/dev/null || stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0)
      [ -z "$lock_mtime" ] && lock_mtime=0
      lock_age=$(($(date +%s) - lock_mtime))
      if [ "$lock_age" -gt "$MAX_LOCK_AGE_SEC" ]; then
        echo "WARN: Stale lock fra $(cat "$LOCK_FILE") — overtar"
        rm -f "$LOCK_FILE"
      else
        echo "BLOKKERT: $LOCK_FILE eies av $(cat "$LOCK_FILE")"
        exit 1
      fi
    fi
    mkdir -p "$(dirname "$LOCK_FILE")"
    echo "$agent pid=$$ ts=$(date -u +%FT%TZ)" > "$LOCK_FILE"
    echo "OK: Lock ervervet av $agent"
    ;;
  release)
    if [ -f "$LOCK_FILE" ]; then
      # awk er sikrere enn cut for whitespace-håndtering
      owner=$(head -1 "$LOCK_FILE" | awk '{print $1}')
      if [ "$owner" = "$agent" ]; then
        rm "$LOCK_FILE"
        echo "OK: Lock frigjort"
      else
        echo "FEIL: Lock eies av $owner, ikke $agent"
        exit 1
      fi
    else
      echo "OK: Ingen lock å frigi"
    fi
    ;;
  status)
    if [ -f "$LOCK_FILE" ]; then
      cat "$LOCK_FILE"
    else
      echo "Ingen lock"
    fi
    ;;
  *)
    echo "Bruk: $0 {acquire|release|status} [agent-navn]"
    exit 1
    ;;
esac
