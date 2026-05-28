#!/bin/bash
# Blokkerer skriving til .env-filer som kan inneholde secrets
# Override: ALLOW_ENV_WRITE=1
#
# Claude Code sender hook-payload som JSON paa stdin:
#   {"tool_name":"Write","tool_input":{"file_path":".env"}}
# Exit-koder: 0=tillat, 2=blokker (melding paa stderr vises til Claude)

if [[ "$ALLOW_ENV_WRITE" == "1" ]]; then
  exit 0
fi

# Les payload fra stdin
payload=$(cat)

if command -v jq &>/dev/null; then
  tool_name=$(echo "$payload" | jq -r '.tool_name // empty' 2>/dev/null)
  file_path=$(echo "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
  command=$(echo "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  tool_name=$(echo "$payload" | grep -oE '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  file_path=$(echo "$payload" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  command=$(echo "$payload" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
fi

# Kun relevant for filskrivende verktoy
case "$tool_name" in
  Write|Edit|NotebookEdit|MultiEdit)
    target="$file_path"
    ;;
  Bash)
    target="$command"
    ;;
  *)
    exit 0
    ;;
esac

if [[ -z "$target" ]]; then
  exit 0
fi

# Matcher:
#   - filnavn som slutter paa .env
#   - .env.local, .env.production, .env.staging, .env.prod, .env.test, .env.development
# Unngaar ord som "editor", "environment" ved aa kreve start-grense og kjente suffix.
basename_target=$(basename "$target" 2>/dev/null || echo "$target")

if echo "$basename_target" | grep -qE '(^|/)\.env$|(^|/)\.env\.(local|production|staging|prod|test|development)$'; then
  is_env=1
elif [[ "$tool_name" == "Bash" ]]; then
  # For Bash-kommandoer: se etter eksplisitt .env-filoperasjon
  if echo "$target" | grep -qE '(^|[[:space:]>])\.env(\.(local|production|staging|prod|test|development))?([[:space:]]|$)'; then
    is_env=1
  else
    is_env=0
  fi
else
  is_env=0
fi

if [[ "$is_env" == "1" ]]; then
  echo "BLOKKERT: Skriving til .env-fil ikke tillatt." >&2
  echo "Maal: $target" >&2
  echo "Bruk Vercel Environment Variables eller Supabase Vault for secrets i produksjon." >&2
  echo "Sett ALLOW_ENV_WRITE=1 for aa overstyre." >&2
  exit 2
fi
exit 0
