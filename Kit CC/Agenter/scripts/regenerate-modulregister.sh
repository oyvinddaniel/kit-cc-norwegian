#!/bin/bash
# regenerate-modulregister.sh — Regenerer MODULREGISTER.md fra modul-spec-filer
#
# Bruk:
#   ./regenerate-modulregister.sh <prosjekt-rot>

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Bruk: $0 <prosjekt-rot>"
  exit 1
fi

PROJECT_ROOT="$1"
MODULER_DIR="$PROJECT_ROOT/docs/moduler"
REGISTER="$PROJECT_ROOT/docs/FASE-2/MODULREGISTER.md"

[ -d "$MODULER_DIR" ] || { echo "FEIL: $MODULER_DIR finnes ikke"; exit 1; }

# Sørg for at output-mappen finnes
mkdir -p "$(dirname "$REGISTER")"

# Skriv header (date evalueres her, ved regenerings-tidspunkt)
GENERATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$REGISTER.new" <<EOF
# MODULREGISTER

> **AUTO-GENERERT** fra docs/moduler/M-*.md ved ${GENERATED_AT}.
> Ikke rediger direkte — endre M-spec-filene i stedet, så regenererer dette.

| ID | Modul | Beskrivelse | Underfunksjoner | MVP | Status | Prioritet | Avhenger av | Estimat |
|---|---|---|---|---|---|---|---|---|
EOF

# Helper: ekstraher YAML-felt fra frontmatter (Mac/Linux-kompatibel)
# Bruker awk fordi BSD sed (Mac) håndterer ikke [[:space:]] konsistent
extract_yaml_field() {
  local fil="$1"
  local felt="$2"
  awk -v key="^${felt}:" '$0 ~ key {sub(/^[^:]*:[ \t]*/, ""); print; exit}' "$fil"
}

# For hver modul-fil, ekstraher metadata
modul_count=0
for fil in "$MODULER_DIR"/M-*.md; do
  [ -f "$fil" ] || continue

  ID=$(extract_yaml_field "$fil" "id")
  NAVN=$(extract_yaml_field "$fil" "navn")
  BESKRIVELSE=$(extract_yaml_field "$fil" "beskrivelse")
  # grep -c kan returne "0\n0" på Mac ved no-match — bruk wc -l for sikkerhet
  UNDERFUNK=$(grep "^### U" "$fil" 2>/dev/null | wc -l | tr -d ' ' || echo "0")
  MVP=$(extract_yaml_field "$fil" "mvp")
  STATUS=$(extract_yaml_field "$fil" "status")
  PRIORITET=$(extract_yaml_field "$fil" "prioritet")
  AVHENGER=$(extract_yaml_field "$fil" "avhenger")
  ESTIMAT=$(extract_yaml_field "$fil" "estimat")

  # Valider at kritiske felt finnes
  if [ -z "$ID" ]; then
    echo "WARN: $fil mangler 'id:' i frontmatter — hopper over"
    continue
  fi

  # Ukjente felt (opprettet, sist_oppdatert, brukerord_kilder) leses for kompletthet
  # men ikke nødvendigvis vises i kompakt MODULREGISTER-tabell

  echo "| ${ID} | ${NAVN:-?} | ${BESKRIVELSE:-?} | ${UNDERFUNK} | ${MVP:-Nei} | ${STATUS:-Pending} | ${PRIORITET:-?} | ${AVHENGER:-} | ${ESTIMAT:-?} |" >> "$REGISTER.new"
  modul_count=$((modul_count + 1))
done

# Atomic move
mv "$REGISTER.new" "$REGISTER"

echo "OK: MODULREGISTER.md regenerert fra ${modul_count} moduler"
