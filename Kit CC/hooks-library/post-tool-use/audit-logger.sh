#!/bin/bash
# Logger alle verktoy-kall til audit-logg for sporbarhet
# Alltid aktiv — ingen override
#
# Claude Code sender hook-payload som JSON paa stdin:
#   {"tool_name":"Bash","tool_input":{...},"hook_event_name":"PostToolUse",...}
# Exit-kode 0 = ok (post-tool-hooks kan ikke blokkere verktoyet).

# Les payload fra stdin
payload=$(cat)

if command -v jq &>/dev/null; then
  TOOL_NAME=$(echo "$payload" | jq -r '.tool_name // "ukjent"' 2>/dev/null)
else
  TOOL_NAME=$(echo "$payload" | grep -oE '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  [[ -z "$TOOL_NAME" ]] && TOOL_NAME="ukjent"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE="${AUDIT_LOG_PATH:-.claude/audit.log}"

mkdir -p "$(dirname "$LOG_FILE")"
echo "[$TIMESTAMP] TOOL: $TOOL_NAME" >> "$LOG_FILE"
exit 0
