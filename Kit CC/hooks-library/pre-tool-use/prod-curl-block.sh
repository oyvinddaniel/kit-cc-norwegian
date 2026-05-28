#!/bin/bash
# Blokkerer direkte curl-kall til produksjons-API-endepunkter
# Override: ALLOW_PROD_CURL=1
#
# Miljovariabel som maa settes for at denne hooken skal gjore noe:
#   PROD_DOMAIN=example.com
# Eksempel: export PROD_DOMAIN="minapp.no"  — da blokkeres curl/wget som inneholder "minapp.no"
# Hvis PROD_DOMAIN er tom: hooken er no-op og tillater alt.
#
# Claude Code sender hook-payload som JSON paa stdin.
# Exit-koder: 0=tillat, 2=blokker (melding paa stderr vises til Claude)

if [[ "$ALLOW_PROD_CURL" == "1" ]]; then
  exit 0
fi

PROD_URL="${PROD_DOMAIN:-}"
# No-op hvis PROD_DOMAIN ikke er satt — dokumentert i header
if [[ -z "$PROD_URL" ]]; then
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

# Fang curl/wget/http/xh mot PROD_URL
if echo "$command" | grep -qE "(curl|wget|http|xh)[[:space:]]" && echo "$command" | grep -qF "$PROD_URL"; then
  echo "BLOKKERT: HTTP-kall til produksjons-URL ($PROD_URL) ikke tillatt under utvikling." >&2
  echo "Kommando: $command" >&2
  echo "Bruk staging-URL. Sett ALLOW_PROD_CURL=1 for eksplisitt produksjonstesting." >&2
  exit 2
fi
exit 0
