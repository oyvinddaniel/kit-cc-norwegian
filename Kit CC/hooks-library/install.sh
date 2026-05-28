#!/bin/bash
# Kit CC hooks-library install.sh
# Kopierer hooks til aktivt prosjekt sin .claude/hooks/-mappe
#
# Bruk: ./install.sh [SUPABASE_REF] [PROD_DOMAIN]
# Eksempel: ./install.sh abcdef123 min-app.vercel.app

set -e

SUPABASE_REF="${1:-}"
PROD_DOMAIN="${2:-}"
HOOKS_DIR=".claude/hooks"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Kit CC hooks-library install ==="
echo "Supabase ref: ${SUPABASE_REF:-ikke satt}"
echo "Prod domain:  ${PROD_DOMAIN:-ikke satt}"

# Opprett .claude/hooks-struktur
mkdir -p "$HOOKS_DIR/pre-tool-use"
mkdir -p "$HOOKS_DIR/post-tool-use"
mkdir -p "$HOOKS_DIR/session-start"

# Kopier hooks
cp "$SCRIPT_DIR/pre-tool-use/"*.sh "$HOOKS_DIR/pre-tool-use/" 2>/dev/null || true
cp "$SCRIPT_DIR/post-tool-use/"*.sh "$HOOKS_DIR/post-tool-use/" 2>/dev/null || true
cp "$SCRIPT_DIR/session-start/"*.sh "$HOOKS_DIR/session-start/" 2>/dev/null || true

# Gjør dem kjørbare
chmod +x "$HOOKS_DIR/pre-tool-use/"*.sh 2>/dev/null || true
chmod +x "$HOOKS_DIR/post-tool-use/"*.sh 2>/dev/null || true
chmod +x "$HOOKS_DIR/session-start/"*.sh 2>/dev/null || true

# Injiser Supabase-ref og prod-domain hvis gitt
mkdir -p ".claude"
if [[ -n "$SUPABASE_REF" ]]; then
  echo "SUPABASE_REF=$SUPABASE_REF" >> .claude/.hooks-config
fi
if [[ -n "$PROD_DOMAIN" ]]; then
  echo "PROD_DOMAIN=$PROD_DOMAIN" >> .claude/.hooks-config
fi

# Oppdater .claude/settings.json med hooks-konfigurasjon
SETTINGS_FILE=".claude/settings.json"
mkdir -p ".claude"

if [[ ! -f "$SETTINGS_FILE" ]]; then
  cat > "$SETTINGS_FILE" << 'JSON'
{
  "hooks": {
    "PreToolUse": [
      { "matcher": ".*", "hooks": [
        { "type": "command", "command": ".claude/hooks/pre-tool-use/prod-db-write-block.sh" },
        { "type": "command", "command": ".claude/hooks/pre-tool-use/git-main-commit-block.sh" },
        { "type": "command", "command": ".claude/hooks/pre-tool-use/supabase-prod-push-block.sh" },
        { "type": "command", "command": ".claude/hooks/pre-tool-use/env-file-write-block.sh" },
        { "type": "command", "command": ".claude/hooks/pre-tool-use/service-role-key-leak-block.sh" },
        { "type": "command", "command": ".claude/hooks/pre-tool-use/rm-rf-guard.sh" },
        { "type": "command", "command": ".claude/hooks/pre-tool-use/prod-curl-block.sh" }
      ]}
    ],
    "PostToolUse": [
      { "matcher": ".*", "hooks": [
        { "type": "command", "command": ".claude/hooks/post-tool-use/audit-logger.sh" }
      ]}
    ],
    "SessionStart": [
      { "hooks": [
        { "type": "command", "command": ".claude/hooks/session-start/context-loader.sh" }
      ]}
    ]
  }
}
JSON
  echo "✓ .claude/settings.json opprettet med hooks-konfigurasjon"
else
  # Sjekk om hooks allerede er konfigurert
  if grep -q "prod-db-write-block" "$SETTINGS_FILE" 2>/dev/null; then
    echo "✓ .claude/settings.json finnes allerede med Kit CC hooks"
  else
    echo ""
    echo "⚠️  .claude/settings.json finnes, men mangler Kit CC hooks."
    echo "   Legg til følgende i 'hooks'-seksjonen i $SETTINGS_FILE:"
    echo ""
    echo '   "PreToolUse": [{ "matcher": ".*", "hooks": ['
    echo '     { "type": "command", "command": ".claude/hooks/pre-tool-use/prod-db-write-block.sh" },'
    echo '     { "type": "command", "command": ".claude/hooks/pre-tool-use/git-main-commit-block.sh" },'
    echo '     { "type": "command", "command": ".claude/hooks/pre-tool-use/supabase-prod-push-block.sh" },'
    echo '     { "type": "command", "command": ".claude/hooks/pre-tool-use/env-file-write-block.sh" },'
    echo '     { "type": "command", "command": ".claude/hooks/pre-tool-use/service-role-key-leak-block.sh" },'
    echo '     { "type": "command", "command": ".claude/hooks/pre-tool-use/rm-rf-guard.sh" },'
    echo '     { "type": "command", "command": ".claude/hooks/pre-tool-use/prod-curl-block.sh" }'
    echo '   ]}],'
    echo '   "PostToolUse": [{ "matcher": ".*", "hooks": ['
    echo '     { "type": "command", "command": ".claude/hooks/post-tool-use/audit-logger.sh" }'
    echo '   ]}],'
    echo '   "SessionStart": [{ "hooks": ['
    echo '     { "type": "command", "command": ".claude/hooks/session-start/context-loader.sh" }'
    echo '   ]}]'
    echo ""
    echo "   Eller bruk settings-template.json som utgangspunkt."
  fi
fi

HOOK_COUNT=$(find "$HOOKS_DIR" -name "*.sh" | wc -l | tr -d ' ')
echo ""
echo "Hooks installert: $HOOK_COUNT hooks i $HOOKS_DIR"
echo "Neste steg: verifiser at hooks er registrert i .claude/settings.json"
