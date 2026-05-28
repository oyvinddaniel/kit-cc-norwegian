#!/bin/bash
# Blokkerer direkte skriving til produksjonsdatabase
# Override: ALLOW_PROD_DB_WRITE=1 (kun i nodstilfelle med eksplisitt godkjenning)
#
# Claude Code sender hook-payload som JSON paa stdin.
# Exit-koder: 0=tillat, 2=blokker (melding paa stderr vises til Claude)

if [[ "$ALLOW_PROD_DB_WRITE" == "1" ]]; then
  exit 0
fi

# Les payload fra stdin
payload=$(cat)

if command -v jq &>/dev/null; then
  tool_name=$(echo "$payload" | jq -r '.tool_name // empty' 2>/dev/null)
  command=$(echo "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  tool_name=$(echo "$payload" | grep -oE '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  command=$(echo "$payload" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
fi

if [[ "$tool_name" != "Bash" ]] || [[ -z "$command" ]]; then
  exit 0
fi

# Match prod-database-indikatorer
if echo "$command" | grep -qE "supabase[^[:space:]]*.*prod|DATABASE_URL[^[:space:]]*.*prod|production[^[:space:]]*.*database|prod[^[:space:]]*\.supabase\.co"; then
  echo "BLOKKERT: Direkte skriving til produksjonsdatabase ikke tillatt." >&2
  echo "Kommando: $command" >&2
  echo "Bruk staging-miljoet for testing. Sett ALLOW_PROD_DB_WRITE=1 kun ved godkjent nodssituasjon." >&2
  exit 2
fi
exit 0
