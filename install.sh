#!/usr/bin/env bash
#
# Kit CC — installer
#
# Henter Kit CC og legger det inn i prosjektet ditt — inkludert skjulte filer
# (.ai/, .gitignore), slik at du aldri trenger å dra-og-slippe eller tenke på
# skjulte mapper selv.
#
# Bruk:
#   Ny app (oppretter mappa):      bash install.sh min-nye-app
#   Eksisterende app (stå i den):  cd min-app && bash install.sh
#   Her (gjeldende mappe):         bash install.sh .
#

# Kjør alltid i bash — re-exec hvis scriptet ble startet med sh/dash
[ -n "${BASH_VERSION:-}" ] || exec bash "$0" "$@"
set -euo pipefail

REPO_TARBALL="https://github.com/oyvinddaniel/kit-cc-norwegian/archive/refs/heads/main.tar.gz"
TARGET="${1:-.}"

# --- Sjekk forutsetninger ---
for cmd in curl tar rsync; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Mangler '$cmd'. Installer det og prøv igjen."; exit 1; }
done

# --- Opprett mappa hvis den ikke finnes (ny app) ---
if [ ! -d "$TARGET" ]; then
  echo "Oppretter ny prosjektmappe: $TARGET"
  mkdir -p "$TARGET"
fi
TARGET="$(cd "$TARGET" && pwd)"

# --- Hindre at vi overskriver en eksisterende Kit CC-installasjon ---
if [ -f "$TARGET/CLAUDE.md" ] && grep -q "Kit CC" "$TARGET/CLAUDE.md" 2>/dev/null; then
  echo "⚠️  Kit CC ser ut til å være installert her allerede ($TARGET/CLAUDE.md finnes)."
  echo "    Avbryter for å ikke overskrive noe. Slett CLAUDE.md først hvis du vil installere på nytt."
  exit 1
fi

# --- Oppdag om dette er en eksisterende app (brownfield) — for backup-advarsel ---
BROWNFIELD=0
[ "$(find "$TARGET" -mindepth 1 -maxdepth 1 2>/dev/null | wc -l | tr -d ' ')" -gt 0 ] && BROWNFIELD=1

# --- Last ned Kit CC til en midlertidig mappe ---
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
echo "Henter Kit CC..."
curl -fsSL "$REPO_TARBALL" -o "$TMP/kitcc.tar.gz" || { echo "Kunne ikke laste ned Kit CC (sjekk internett)."; exit 1; }
tar -xzf "$TMP/kitcc.tar.gz" -C "$TMP" || { echo "Kunne ikke pakke ut Kit CC (korrupt nedlasting?)."; exit 1; }
SRC="$TMP/kit-cc-norwegian-main"

# Ikke kopier installeren selv inn i prosjektet
rm -f "$SRC/install.sh"

# --- Kopier inn (inkl. skjulte filer). --ignore-existing rører ALDRI dine egne filer. ---
echo "Installerer Kit CC i: $TARGET"
rsync -a --ignore-existing "$SRC/" "$TARGET/"

# --- Sørg for at secret-regler finnes i prosjektets .gitignore (idempotent) ---
# Viktig: --ignore-existing over hopper over Kit CCs .gitignore hvis brukeren alt har en.
# Da fletter vi Kit CCs sikkerhets-mønstre inn, så hemmeligheter ikke kan committes.
GI="$TARGET/.gitignore"
if [ ! -f "$GI" ] || ! grep -qxF "# Kit CC — sikkerhet (ikke commit hemmeligheter)" "$GI" 2>/dev/null; then
  printf '\n# Kit CC — sikkerhet (ikke commit hemmeligheter)\n' >> "$GI"
fi
for pattern in ".env" ".env.local" "*.key" "*.pem" ".claude/" "credentials.json" "secrets/" "node_modules/"; do
  grep -qxF "$pattern" "$GI" 2>/dev/null || printf '%s\n' "$pattern" >> "$GI"
done

echo ""
echo "✅ Kit CC er installert i: $TARGET"
echo ""
echo "Neste steg:"
echo "  1. Åpne Claude Code i mappa:   cd \"$TARGET\" && claude"
echo "  2. Velg «Bygge» når Kit CC spør."
echo "     Har du eksisterende kode her fra før? Kit CC oppdager den automatisk."

if [ "$BROWNFIELD" = "1" ]; then
  echo ""
  echo "⚠️  VIKTIG — du installerte i en mappe som allerede har filer."
  echo "    TA BACKUP FØR DU BYGGER, så du kan gå tilbake hvis noe breaker:"
  echo "      git init && git add -A && git commit -m \"før Kit CC\""
  echo "    (eller kopier hele mappa et trygt sted)."
fi
