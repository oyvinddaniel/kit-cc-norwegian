#!/bin/bash
# Laster prosjekt-kontekst ved sesjonstart for profesjonell pakke
# Viser pakke-status fra PROJECT-STATE.json
#
# Claude Code sender hook-payload som JSON paa stdin:
#   {"session_id":"...","hook_event_name":"SessionStart","source":"...","cwd":"..."}
# Stdout fra SessionStart-hooks injiseres som kontekst til Claude. Exit 0.

# Konsumer stdin saa Claude Code ikke opplever broken pipe
payload=$(cat 2>/dev/null || true)

# Forsok aa hente cwd fra payload (brukes om scriptet kjores med annen PWD)
if command -v jq &>/dev/null && [[ -n "$payload" ]]; then
  hook_cwd=$(echo "$payload" | jq -r '.cwd // empty' 2>/dev/null)
  if [[ -n "$hook_cwd" && -d "$hook_cwd" ]]; then
    cd "$hook_cwd" 2>/dev/null || true
  fi
fi

STATE_FILE="${PROJECT_STATE_PATH:-.ai/PROJECT-STATE.json}"

if [[ -f "$STATE_FILE" ]]; then
  if command -v jq &>/dev/null; then
    INTENSITY=$(jq -r '.classification.intensityLevel // "ukjent"' "$STATE_FILE" 2>/dev/null || echo "ukjent")
    PKG_ENABLED=$(jq -r 'if .professionalPackage and .professionalPackage.enabled then "ja" else "nei" end' "$STATE_FILE" 2>/dev/null || echo "nei")
  elif command -v python3 &>/dev/null; then
    INTENSITY=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d.get('classification',{}).get('intensityLevel','ukjent'))" 2>/dev/null || echo "ukjent")
    PKG_ENABLED=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); pp=d.get('professionalPackage'); print('ja' if pp and pp.get('enabled') else 'nei')" 2>/dev/null || echo "nei")
  else
    INTENSITY="ukjent"
    PKG_ENABLED="nei"
  fi
  echo "[KIT CC] Prosjekt-intensitet: $INTENSITY | Profesjonell pakke: $PKG_ENABLED"
fi
exit 0
