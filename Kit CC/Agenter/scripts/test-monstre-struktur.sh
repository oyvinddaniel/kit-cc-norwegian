#!/bin/bash
# test-monstre-struktur.sh — Validerer at alle mønstre i MONSTRE/ følger malen
#
# Bruk:
#   bash test-monstre-struktur.sh
#
# Returnerer 0 hvis alle OK, 1 hvis noen feiler.

set -uo pipefail

# Stien fra Kit CC's prosjektrot
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONSTRE_DIR="$(cd "$SCRIPT_DIR/../MONSTRE" 2>/dev/null && pwd || echo "$SCRIPT_DIR/../MONSTRE")"

if [ ! -d "$MONSTRE_DIR" ]; then
  echo "❌ FEIL: MONSTRE-mappa finnes ikke på $MONSTRE_DIR"
  exit 1
fi

REQUIRED_SECTIONS=(
  "## Når brukes dette mønsteret"
  "## Når brukes det IKKE"
  "## Skip-regel"
  "## Sjekkliste"
  "## Tilstander"
  "## Tilgjengelighet"
  "## Kanttilfeller"
  "## Anti-mønster"
  "## Eksempler"
  "## Versjon"
)

REQUIRED_FRONTMATTER=(
  "^name:"
  "^version:"
  "^applies_to:"
  "^last_reviewed:"
  "^skip_if:"
  "^ekspert_trigger:"
)

ERRORS=0
WARNINGS=0
PASSED=0

for fil in "$MONSTRE_DIR"/monster-*.md; do
  [ -f "$fil" ] || continue
  navn=$(basename "$fil")

  file_errors=0
  file_warnings=0

  # Sjekk YAML frontmatter start/slutt
  first_line=$(head -1 "$fil")
  if [ "$first_line" != "---" ]; then
    echo "❌ $navn: mangler YAML frontmatter (første linje ikke '---')"
    file_errors=$((file_errors + 1))
  fi

  # Sjekk påkrevde frontmatter-felter
  for felt in "${REQUIRED_FRONTMATTER[@]}"; do
    if ! head -20 "$fil" | grep -q "$felt"; then
      echo "❌ $navn: mangler frontmatter-felt $felt"
      file_errors=$((file_errors + 1))
    fi
  done

  # Sjekk påkrevde seksjoner
  for seksjon in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "^$seksjon" "$fil"; then
      echo "⚠️  $navn: mangler seksjon '$seksjon'"
      file_warnings=$((file_warnings + 1))
    fi
  done

  # Sjekk linje-grense (max 150)
  lines=$(wc -l < "$fil")
  if [ "$lines" -gt 150 ]; then
    echo "⚠️  $navn: $lines linjer (max 150, overskytende: $((lines - 150)))"
    file_warnings=$((file_warnings + 1))
  fi

  # Sjekk for VERIFISER WCAG-flagg (informasjons-warning)
  verifiser_count=$(grep -c "VERIFISER WCAG" "$fil" 2>/dev/null || true)
  verifiser_count="${verifiser_count:-0}"
  if [ "$verifiser_count" -gt 0 ] 2>/dev/null; then
    echo "ℹ️  $navn: $verifiser_count WCAG-referanser markert til verifisering"
  fi

  if [ "$file_errors" -eq 0 ] && [ "$file_warnings" -eq 0 ]; then
    echo "✅ $navn"
    PASSED=$((PASSED + 1))
  fi

  ERRORS=$((ERRORS + file_errors))
  WARNINGS=$((WARNINGS + file_warnings))
done

echo ""
echo "=========================================="
echo "Mønstre validert: $(ls "$MONSTRE_DIR"/monster-*.md 2>/dev/null | wc -l)"
echo "Fullstendig OK:   $PASSED"
echo "Feil:             $ERRORS"
echo "Advarsler:        $WARNINGS"
echo "=========================================="

if [ "$ERRORS" -gt 0 ]; then
  echo "❌ TEST FEILET — fiks feil før commit"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo "⚠️  TEST PASSERT MED ADVARSLER"
  exit 0
else
  echo "✅ ALLE TESTER PASSERT"
  exit 0
fi
