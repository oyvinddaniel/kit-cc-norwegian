#!/bin/bash
# Schema-versjon: Verifisert mot PROJECT-STATE-SCHEMA.json v3.5.2 (2026-04-22)
# ============================================================================
# DEAD FIELD DETECTION FOR PROJECT-STATE.json v1.1
# ============================================================================
#
# Formål: Oppdager felter i PROJECT-STATE-SCHEMA.json som aldri leses
#         av CLAUDE.md eller noen agent-fil (= "dead fields").
#
# Prinsipp: "Alle felter i PROJECT-STATE.json MÅ ha minst én leser"
#           (CLAUDE.md, PROJECT-STATE.json felt-etikk)
#
# Bruk:   ./scripts/validate-dead-fields.sh [sti-til-Agenter-mappe]
#         (Standard: kjør fra Kit CC/Agenter/)
#
# ============================================================================

set +e

# Farger
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Tellervariabler
DEAD=0
ALIVE=0
WARNINGS=0

# Base-path
BASE_PATH="${1:-.}"

# Finn prosjektrot (der CLAUDE.md er)
PROJECT_ROOT=""
if [ -f "$BASE_PATH/../../CLAUDE.md" ]; then
    PROJECT_ROOT="$BASE_PATH/../.."
elif [ -f "$BASE_PATH/../CLAUDE.md" ]; then
    PROJECT_ROOT="$BASE_PATH/.."
elif [ -f "$BASE_PATH/CLAUDE.md" ]; then
    PROJECT_ROOT="$BASE_PATH"
fi

if [ -z "$PROJECT_ROOT" ] || [ ! -f "$PROJECT_ROOT/CLAUDE.md" ]; then
    echo -e "${RED}✗ Finner ikke CLAUDE.md. Kjør fra Kit CC/Agenter/ eller oppgi sti.${NC}"
    exit 1
fi

CLAUDE_MD="$PROJECT_ROOT/CLAUDE.md"
SCHEMA_FILE="$BASE_PATH/klassifisering/PROJECT-STATE-SCHEMA.json"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}✗ Finner ikke PROJECT-STATE-SCHEMA.json${NC}"
    echo -e "  Forventet: $SCHEMA_FILE"
    exit 1
fi

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  DEAD FIELD DETECTION — PROJECT-STATE.json${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "Schema:   $SCHEMA_FILE"
echo -e "CLAUDE:   $CLAUDE_MD"
echo -e "Agenter:  $BASE_PATH/agenter/"
echo ""

# ============================================================================
# DEFINISJON: Alle toppnivå-felter og viktige sub-felter
# Formatet er: "søketerm|feltbeskrivelse|forventet-leser"
# ============================================================================

FIELDS=(
    # Toppnivå-felter
    "projectName|projectName (prosjektnavn)|CLAUDE.md boot, Monitor"
    "currentPhase|currentPhase (aktiv fase)|CLAUDE.md steg 3B/4"

    # classification sub-felter
    "intensityLevel|classification.intensityLevel|AUTO-CLASSIFIER, alle agenter"
    "Score|classification.score|AUTO-CLASSIFIER"
    "confidenceScore|classification.confidenceScore|AUTO-CLASSIFIER"
    "userLevel|classification.userLevel|SYSTEM-COMMUNICATION, 'Bytt til'"

    # builderMode
    "builderMode|builderMode (byggemodus)|CLAUDE.md 'Bytt byggemodus', fase-agenter"

    # imageStrategy
    "imageStrategy|imageStrategy (bildestrategi)|BYGGER-agent, MVP-agent"

    # integrations
    "integrations|integrations (integrasjonsbehov)|KRAV-agent, ARKITEKTUR, MVP"

    # devServer
    "devServer|devServer (utviklingsserver)|MVP-agent, 'Vis status'"

    # session sub-felter
    "session.status|session.status (sesjon-status)|CLAUDE.md krasj-deteksjon"
    "session.startedAt|session.startedAt|CLAUDE.md 'Vis status', sesjonstart"
    "sessionId|session.sessionId|Session-sporing"
    "lastSignificantAction|session.lastSignificantAction|CLAUDE.md steg 1B krasj"
    "crashRecovery|session.crashRecovery|ORCHESTRATOR krasj-håndtering"

    # phaseProgress
    "phaseProgress|phaseProgress (fase-fremdrift)|Fase-agenter, 'Vis status'"
    "completedSteps|phaseProgress.completedSteps|CLAUDE.md steg 1B, fase-agenter"
    "skippedSteps|phaseProgress.skippedSteps|PHASE-GATES, fase-agenter"
    "gatesPassed|phaseProgress.gatesPassed|PHASE-GATES"

    # Arrays
    "pendingTasks|pendingTasks (ventende oppgaver)|CLAUDE.md steg 1B, ORCHESTRATOR"
    "completedTasks|completedTasks (fullførte)|CLAUDE.md steg 1B, 'Vis status'"
    "gateOverrides|gateOverrides (gate-unntak)|'Vis status', PHASE-GATES"
    "pendingDecisions|pendingDecisions (ventende valg)|ORCHESTRATOR fase-overgang"
    "reclassifications|reclassifications (reklassifiseringer)|'Vis status'"

    # history
    "history|history (hendelseslogg)|Audit-trail, ORCHESTRATOR"
    "latestByType|history.latestByType|Hurtigoppslag"

    # checkpoints
    "lastCheckpoint|lastCheckpoint (siste checkpoint)|ORCHESTRATOR"
    "checkpoints|checkpoints (lagringspunkter)|'Vis alle checkpoints', rollback"

    # overlay / Monitor
    "overlay|overlay (Kit CC Monitor)|CLAUDE.md steg 3C, Monitor"
    "overlay.port|overlay.port (Monitor-port)|CLAUDE.md steg 3C"

    # v3.5.0: brownfield-støtte
    "brownfield|brownfield (eksisterende kodebase-metadata)|AUTO-CLASSIFIER, BROWNFIELD-SCANNER"

    # v3.5.0: design system
    "designSystem|designSystem (design-system-metadata)|GORGEOUS-UI-ekspert, MVP-agent MVP-00"

    # v3.5.0: professionell pakke
    "professionalPackage|professionalPackage (valgt pakke-nivå)|protocol-PROFESJONELL-PAKKE, AUTO-CLASSIFIER"

    # v3.5.0: data-typer (GDPR/compliance)
    "dataTypes|dataTypes (PII/compliance-metadata)|AUTO-CLASSIFIER, GDPR-ekspert"

    # v3.5.0: meta (agentSystemVersion etc.)
    "metadata|metadata (prosjektmeta: agentSystemVersion, schemaVersion)|AUTO-CLASSIFIER bootstrap"
    "agentSystemVersion|metadata.agentSystemVersion|CLAUDE.md steg 4, AUTO-CLASSIFIER"

    # v3.5.0: deferred tasks
    "deferredTasks|deferredTasks (utsatt arbeid)|ORCHESTRATOR, fase-agenter"
)

# ============================================================================
# PRE-BYGG SAMLE-FILER (én gang, brukes for alle søk)
# ============================================================================

TMP_CLAUDE=$(mktemp)
TMP_AGENTS=$(mktemp)
TMP_MONITOR=$(mktemp)

# CLAUDE.md — allerede én fil
cp "$CLAUDE_MD" "$TMP_CLAUDE"

# Alle agent-filer + klassifisering → én samlet fil
> "$TMP_AGENTS"
if [ -d "$BASE_PATH/agenter" ]; then
    find "$BASE_PATH/agenter/" -name "*.md" -exec cat {} + >> "$TMP_AGENTS" 2>/dev/null
fi
if [ -d "$BASE_PATH/klassifisering" ]; then
    find "$BASE_PATH/klassifisering/" -type f -exec cat {} + >> "$TMP_AGENTS" 2>/dev/null
fi

# Monitor-filer → én samlet fil
> "$TMP_MONITOR"
OVERLAY_DIR="$PROJECT_ROOT/kit-cc-overlay"
if [ -d "$OVERLAY_DIR" ]; then
    find "$OVERLAY_DIR/" \( -name "*.js" -o -name "*.json" -o -name "*.html" \) -exec cat {} + >> "$TMP_MONITOR" 2>/dev/null
fi

# ============================================================================
# Søk-funksjoner (raske: grep mot pre-bygde filer)
# ============================================================================

search_claude() {
    local result
    result=$(grep -c "$1" "$TMP_CLAUDE" 2>/dev/null) || true
    echo "${result:-0}"
}

search_agents() {
    local result
    result=$(grep -c "$1" "$TMP_AGENTS" 2>/dev/null) || true
    echo "${result:-0}"
}

search_monitor() {
    local result
    result=$(grep -c "$1" "$TMP_MONITOR" 2>/dev/null) || true
    echo "${result:-0}"
}

# ============================================================================
# HOVEDVALIDERING
# ============================================================================
echo -e "${BLUE}--- FELTSØK ---${NC}"
echo ""

for field_entry in "${FIELDS[@]}"; do
    IFS='|' read -r search_term description expected_reader <<< "$field_entry"

    # Søk
    claude_hits=$(search_claude "$search_term")
    agent_hits=$(search_agents "$search_term")
    monitor_hits=$(search_monitor "$search_term")

    total_hits=$((claude_hits + agent_hits + monitor_hits))

    if [ "$total_hits" -gt 0 ]; then
        # Vis kompakt info
        locations=""
        if [ "$claude_hits" -gt 0 ]; then locations="${locations}CLAUDE($claude_hits) "; fi
        if [ "$agent_hits" -gt 0 ]; then locations="${locations}agenter($agent_hits) "; fi
        if [ "$monitor_hits" -gt 0 ]; then locations="${locations}monitor($monitor_hits) "; fi

        echo -e "${GREEN}✓${NC} $description — ${CYAN}$locations${NC}"
        ((ALIVE++))
    else
        echo -e "${RED}✗ DEAD FIELD:${NC} $description"
        echo -e "  Forventet leser: $expected_reader"
        echo -e "  Søketerm: '$search_term'"
        ((DEAD++))
    fi
done

# ============================================================================
# EKSTRA SJEKK: Felter i schema som ikke er i vår liste
# ============================================================================
echo -e "\n${BLUE}--- EKSTRA: Schema-felter utenfor sjekklisten ---${NC}"

# Trekk ut alle "property"-nøkler fra schema
SCHEMA_KEYS=$(grep -oE '"[a-zA-Z]+":' "$SCHEMA_FILE" | sed 's/"//g; s/://g' | sort -u)

UNCHECKED=0
FIELDS_JOINED=$(printf '%s\n' "${FIELDS[@]}")

# Kombiner alle kilder for rask batch-sjekk
TMP_ALL=$(mktemp)
cat "$TMP_CLAUDE" "$TMP_AGENTS" > "$TMP_ALL"

for key in $SCHEMA_KEYS; do
    # Hopp over JSON Schema meta-nøkler
    case "$key" in
        schema|id|version|title|description|type|required|properties|items|enum|minimum|maximum|default|minLength|maxLength|format|pattern|additionalProperties|oneOf)
            continue
            ;;
    esac

    # Sjekk om denne nøkkelen finnes i vår FIELDS-liste
    if echo "$FIELDS_JOINED" | grep -q "$key"; then
        continue
    fi

    # Rask sjekk mot samlet fil
    if ! grep -q "$key" "$TMP_ALL" 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC} Schema-felt '$key' — ikke i sjekklisten og ikke funnet i kodebasen"
        ((UNCHECKED++))
    fi
done

# Rydd opp midlertidige filer
rm -f "$TMP_CLAUDE" "$TMP_AGENTS" "$TMP_MONITOR" "$TMP_ALL"

if [ "$UNCHECKED" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Alle schema-felter er dekket av sjekklisten"
fi

# ============================================================================
# OPPSUMMERING
# ============================================================================
echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}  OPPSUMMERING${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Levende felter:${NC}  $ALIVE"
echo -e "${RED}Døde felter:${NC}     $DEAD"
echo -e "${YELLOW}Usjekket:${NC}        $UNCHECKED"
echo ""

if [ $DEAD -gt 0 ]; then
    echo -e "${RED}❌ DEAD FIELDS FUNNET${NC}"
    echo -e "   $DEAD felter skrives men leses aldri."
    echo -e "   Fjern feltene fra PROJECT-STATE-SCHEMA.json eller legg til lesere."
    exit 1
elif [ $UNCHECKED -gt 0 ]; then
    echo -e "${YELLOW}⚠️  BESTÅTT MED ADVARSLER${NC}"
    echo -e "   $UNCHECKED felter er ikke i sjekklisten."
    exit 0
else
    echo -e "${GREEN}✅ INGEN DEAD FIELDS${NC}"
    echo -e "   Alle $ALIVE felter har minst én leser."
    exit 0
fi
