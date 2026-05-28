#!/bin/bash
# Blokkerer supabase db push til produksjonsmiljo
# Override: ALLOW_SUPABASE_PROD_PUSH=1
#
# Claude Code sender hook-payload som JSON paa stdin.
# Exit-koder: 0=tillat, 2=blokker (melding paa stderr vises til Claude)

if [[ "$ALLOW_SUPABASE_PROD_PUSH" == "1" ]]; then
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

if echo "$command" | grep -qE "supabase[[:space:]]+db[[:space:]]+push.*--linked|supabase[[:space:]]+.*push.*production|supabase[[:space:]]+db[[:space:]]+push.*--project-ref"; then
  echo "BLOKKERT: supabase db push til produksjon ikke tillatt uten eksplisitt godkjenning." >&2
  echo "Kommando: $command" >&2
  echo "Kjor migrasjonene i staging forst. Sett ALLOW_SUPABASE_PROD_PUSH=1 for produksjonsdeploy." >&2
  exit 2
fi
exit 0
