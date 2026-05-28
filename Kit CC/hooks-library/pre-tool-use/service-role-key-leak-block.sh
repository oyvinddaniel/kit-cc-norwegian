#!/bin/bash
# Blokkerer eksponering av Supabase service_role-nokler i kode
# Override: ALLOW_SERVICE_ROLE_IN_CODE=1
#
# Claude Code sender hook-payload som JSON paa stdin.
# Exit-koder: 0=tillat, 2=blokker (melding paa stderr vises til Claude)

if [[ "$ALLOW_SERVICE_ROLE_IN_CODE" == "1" ]]; then
  exit 0
fi

# Les payload fra stdin
payload=$(cat)

if command -v jq &>/dev/null; then
  tool_name=$(echo "$payload" | jq -r '.tool_name // empty' 2>/dev/null)
  # Sjekk alle relevante felter: command, content, new_string, file_path
  content=$(echo "$payload" | jq -r '[.tool_input.command, .tool_input.content, .tool_input.new_string, .tool_input.file_path] | map(select(. != null)) | join(" ")' 2>/dev/null)
else
  tool_name=$(echo "$payload" | grep -oE '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  content="$payload"
fi

if [[ -z "$content" ]]; then
  exit 0
fi

# Sjekk for service_role-nokkel-monster (JWT som starter med eyJ og er lang)
if echo "$content" | grep -qE "service_role.{0,50}eyJ[A-Za-z0-9_-]{50,}|SUPABASE_SERVICE_ROLE[A-Z_]*.{0,10}=.{0,10}eyJ[A-Za-z0-9_-]{50,}"; then
  echo "BLOKKERT: service_role-nokkel ikke tillatt i kode eller konfigurasjonsfiler." >&2
  echo "Bruk SUPABASE_SERVICE_ROLE_KEY som miljovariabel i Vercel — aldri hardkod." >&2
  echo "Sett ALLOW_SERVICE_ROLE_IN_CODE=1 for aa overstyre." >&2
  exit 2
fi
exit 0
