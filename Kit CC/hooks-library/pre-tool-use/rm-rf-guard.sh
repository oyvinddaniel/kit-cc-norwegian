#!/bin/bash
# Varsler ved potensielt destruktiv rm -rf
# Override: ALLOW_RM_RF=1
#
# Claude Code sender hook-payload som JSON paa stdin:
#   {"tool_name":"Bash","tool_input":{"command":"..."}}
# Exit-koder: 0=tillat, 2=blokker (melding paa stderr vises til Claude)

if [[ "$ALLOW_RM_RF" == "1" ]]; then
  exit 0
fi

# Les payload fra stdin
payload=$(cat)

# Hent tool_name og command/file_path — bruk jq hvis mulig, ellers grep-fallback
if command -v jq &>/dev/null; then
  tool_name=$(echo "$payload" | jq -r '.tool_name // empty' 2>/dev/null)
  command=$(echo "$payload" | jq -r '.tool_input.command // .tool_input.file_path // empty' 2>/dev/null)
else
  # Fallback uten jq: enkelt grep-basert uttrekk
  tool_name=$(echo "$payload" | grep -oE '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  command=$(echo "$payload" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  if [[ -z "$command" ]]; then
    command=$(echo "$payload" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  fi
fi

# Bare relevant for Bash-kall
if [[ "$tool_name" != "Bash" ]]; then
  exit 0
fi

if [[ -z "$command" ]]; then
  exit 0
fi

# Hviteliste for trygge rm -rf maalmapper (relative stier)
SAFE_TARGETS="node_modules|\.next|dist|build|\.turbo|coverage|\.cache|tmp|temp|out|\.parcel-cache|\.svelte-kit|\.nuxt"

# Regex som fanger rm -rf, rm -fr, rm -r -f, rm -f -r, rm --recursive --force (og omvendt)
RM_FLAGS_RE="(-[rR][fF]|-[fF][rR]|-[rR][[:space:]]+-[fF]|-[fF][[:space:]]+-[rR]|--recursive[[:space:]]+--force|--force[[:space:]]+--recursive)"

# Er dette i det hele tatt en rm -rf-kommando?
if ! echo "$command" | grep -qE "(^|[[:space:]&;|\`])rm[[:space:]]+${RM_FLAGS_RE}"; then
  exit 0
fi

# ALLTID-BLOKKERT: kritiske paths som ikke skal slettes rekursivt uansett
# Fanger: rm -rf /, rm -rf /*, rm -rf ~, rm -rf ~/, rm -rf $HOME, rm -rf /etc, /usr, /var, /System, /Users
if echo "$command" | grep -qE "rm[[:space:]]+${RM_FLAGS_RE}[[:space:]]+(/|/\*|~|~/|\\\$HOME|\"?/\"?|/etc|/usr|/var|/bin|/sbin|/System|/Users|/Library|/opt|/root|/home)([[:space:]]|/|\*|$)"; then
  echo "BLOKKERT: rm -rf mot kritisk systempath oppdaget." >&2
  echo "Kommando: $command" >&2
  echo "Dette vil aldri tillates. Sett ALLOW_RM_RF=1 KUN hvis du er helt sikker." >&2
  exit 2
fi

# Er maalet en hvitelistet trygg mappe?
# Aksepterer: rm -rf node_modules, rm -rf ./node_modules, rm -rf node_modules/, rm -rf ./dist/*
if echo "$command" | grep -qE "rm[[:space:]]+${RM_FLAGS_RE}[[:space:]]+(\./)?($SAFE_TARGETS)(/(\*)?|[[:space:]]|$)"; then
  exit 0
fi

# Ingen hviteliste-match og ingen kritisk path — advar
echo "BLOKKERT: rm -rf oppdaget utenfor trygge mapper." >&2
echo "Kommando: $command" >&2
echo "Trygge maalmapper: $SAFE_TARGETS" >&2
echo "Sett ALLOW_RM_RF=1 hvis dette er tilsiktet." >&2
exit 2
