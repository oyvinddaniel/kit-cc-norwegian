#!/bin/bash
# safe-state-write.sh — Atomic write med optimistic locking
#
# Bruk:
#   ./safe-state-write.sh <fil-path> <expected-version> <new-content-fil>
#
# Returnerer:
#   0 = OK, fil oppdatert (versjon inkrementert)
#   1 = Versjon-mismatch (en annen skrev mellom les og skriv)
#   2 = Filsystem-feil

set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Bruk: $0 <fil-path> <expected-version> <new-content-fil>"
  exit 2
fi

TARGET_FILE="$1"
EXPECTED_VERSION="$2"
NEW_CONTENT_FILE="$3"

# Sjekk at fil eksisterer
[ -f "$TARGET_FILE" ] || { echo "FEIL: $TARGET_FILE finnes ikke"; exit 2; }
[ -f "$NEW_CONTENT_FILE" ] || { echo "FEIL: $NEW_CONTENT_FILE finnes ikke"; exit 2; }

# Hent gjeldende version fra fil (jq foretrukket, Python som fallback)
if command -v jq >/dev/null 2>&1; then
  CURRENT_VERSION=$(jq -r '.stateVersion // 0' "$TARGET_FILE")
elif command -v python3 >/dev/null 2>&1; then
  CURRENT_VERSION=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1])).get('stateVersion', 0))" "$TARGET_FILE")
else
  echo "FEIL: Hverken jq eller python3 funnet. Installer en av dem."
  exit 2
fi

# Optimistic check
if [ "$CURRENT_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "FEIL: Versjon-mismatch. Forventet $EXPECTED_VERSION, fant $CURRENT_VERSION"
  echo "En annen prosess skrev til $TARGET_FILE. Re-les og prøv igjen."
  exit 1
fi

# Bumped version
NEW_VERSION=$((CURRENT_VERSION + 1))

# Inkrementer i ny content (jq eller Python)
TEMP_OUT=$(mktemp)
if command -v jq >/dev/null 2>&1; then
  # Bruk --argjson for sikker numerisk håndtering (forhindrer injection)
  jq --argjson v "$NEW_VERSION" '.stateVersion = $v' "$NEW_CONTENT_FILE" > "$TEMP_OUT"
else
  python3 - "$NEW_CONTENT_FILE" "$TEMP_OUT" "$NEW_VERSION" <<'PYEOF'
import json, sys
src, dst, newver = sys.argv[1], sys.argv[2], int(sys.argv[3])
data = json.load(open(src))
data['stateVersion'] = newver
with open(dst, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
fi

# Atomic write: temp → fsync → rename
TEMP_TARGET="${TARGET_FILE}.tmp.$$"
cp "$TEMP_OUT" "$TEMP_TARGET"
sync  # fsync best-effort
mv "$TEMP_TARGET" "$TARGET_FILE"  # atomært på POSIX

rm -f "$TEMP_OUT"

echo "OK: $TARGET_FILE oppdatert til stateVersion=$NEW_VERSION"
exit 0
