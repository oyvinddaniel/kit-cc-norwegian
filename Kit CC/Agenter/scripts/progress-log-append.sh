#!/bin/bash
# progress-log-append.sh — Atomær append av JSON-event til PROGRESS-LOG.jsonl
#
# Bruk:
#   ./progress-log-append.sh <log-fil> <event-json>
#
# Eksempel:
#   ./progress-log-append.sh ".ai/PROGRESS-LOG.jsonl" \
#     '{"ts":"2026-05-13T17:45:00Z","event":"INTENT","detected":"PLAN","schemaVersion":1}'
#
# Append er atomært på POSIX hvis content er < PIPE_BUF (typisk 4KB).

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Bruk: $0 <log-fil> <event-json>"
  exit 1
fi

LOG_FILE="$1"
EVENT_JSON="$2"

# Valider at event er gyldig JSON (subshell-pattern for robust pipefail-håndtering)
if command -v jq >/dev/null 2>&1; then
  if ! (echo "$EVENT_JSON" | jq . >/dev/null 2>&1); then
    echo "FEIL: ugyldig JSON" >&2
    exit 1
  fi
elif command -v python3 >/dev/null 2>&1; then
  if ! (echo "$EVENT_JSON" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null); then
    echo "FEIL: ugyldig JSON" >&2
    exit 1
  fi
fi

# Sjekk linjelengde (POSIX-atomær append krever < 4KB)
LINE_LENGTH=${#EVENT_JSON}
if [ "$LINE_LENGTH" -gt 4000 ]; then
  echo "WARN: event er $LINE_LENGTH tegn (> 4KB). Atomicitet ikke garantert. Vurder å lagre detaljer i separat fil + referer."
fi

# Sørg for at logfilen finnes
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Append atomært (single write-syscall)
echo "$EVENT_JSON" >> "$LOG_FILE" || { echo "FEIL: Kunne ikke skrive til $LOG_FILE (read-only fs?)"; exit 1; }
