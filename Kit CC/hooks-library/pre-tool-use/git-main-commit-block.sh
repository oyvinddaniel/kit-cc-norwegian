#!/bin/bash
# Blokkerer direkte commit/push til main-branch
# Override: ALLOW_MAIN_COMMIT=1
#
# Claude Code sender hook-payload som JSON paa stdin.
# Exit-koder: 0=tillat, 2=blokker (melding paa stderr vises til Claude)

if [[ "$ALLOW_MAIN_COMMIT" == "1" ]]; then
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

# Fanger:
#   - git push <remote> main
#   - git push <remote> HEAD:main        (refspec-syntax)
#   - git push -u <remote> main
#   - git push --set-upstream <remote> main
#   - git push <remote> <branch>:main    (hvilken som helst kilde mot main)
#   - git push origin +main              (force push varianter)
# Tillater: git commit (lokal commit blokkeres ikke — bare push til main blokkeres)
if echo "$command" | grep -qE "git[[:space:]]+push([[:space:]]+-[^[:space:]]+)*[[:space:]]+(origin|upstream|[[:alnum:]._-]+)[[:space:]]+([+]?main|HEAD:main|[[:alnum:]._/-]+:main)([[:space:]]|$)"; then
  echo "BLOKKERT: Push til main-branch ikke tillatt." >&2
  echo "Kommando: $command" >&2
  echo "Opprett feature-branch og bruk pull request." >&2
  echo "Sett ALLOW_MAIN_COMMIT=1 for aa overstyre." >&2
  exit 2
fi
exit 0
