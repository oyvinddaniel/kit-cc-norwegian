#!/bin/bash
# ============================================================================
# KONSISTENS-VALIDERING FOR KIT CC AGENT-SYSTEM v1.0
# ============================================================================
#
# Formål: Validerer konsistens på tvers av alle agent-filer
# Kjør: ./scripts/validate-consistency.sh
#
# ============================================================================

# NB: Bruker IKKE set -e fordi ((...)) med verdi 0 gir exit code 1
# Scriptet håndterer feil via egne tellere (ERRORS/WARNINGS/PASSED)
set +e

# Farger for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Tellervariabler
ERRORS=0
WARNINGS=0
PASSED=0

# Base-path (relativ til Agenter-mappen)
BASE_PATH="${1:-.}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  KIT CC KONSISTENS-VALIDERING${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# ============================================================================
# FUNKSJON: Sjekk om fil eksisterer
# ============================================================================
check_file_exists() {
    local file="$1"
    local description="$2"

    if [ -f "$BASE_PATH/$file" ]; then
        echo -e "${GREEN}✓${NC} $description: $file"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} MANGLER: $description: $file"
        ((ERRORS++))
        return 1
    fi
}

# ============================================================================
# FUNKSJON: Sjekk at fil inneholder påkrevd seksjon
# ============================================================================
check_section_exists() {
    local file="$1"
    local section="$2"
    local description="$3"

    if [ -f "$BASE_PATH/$file" ]; then
        if grep -q "$section" "$BASE_PATH/$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $file: Inneholder '$section'"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠${NC} $file: Mangler seksjon '$section'"
            ((WARNINGS++))
            return 1
        fi
    fi
    return 1
}

# ============================================================================
# FUNKSJON: Sjekk versjonsnummer
# ============================================================================
check_version() {
    local file="$1"

    if [ -f "$BASE_PATH/$file" ]; then
        if grep -qE "v[0-9]+\.[0-9]+" "$BASE_PATH/$file" 2>/dev/null; then
            local version=$(grep -oE "v[0-9]+\.[0-9]+(\.[0-9]+)?" "$BASE_PATH/$file" | head -1)
            echo -e "${GREEN}✓${NC} $file: Versjon $version"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠${NC} $file: Mangler versjonsnummer"
            ((WARNINGS++))
            return 1
        fi
    fi
    return 1
}

# ============================================================================
# FUNKSJON: Sjekk at "Kalles av" er standardisert
# ============================================================================
check_kalles_av_format() {
    local file="$1"

    if [ -f "$BASE_PATH/$file" ]; then
        # Sjekk for "UNDERORDNEDE AGENTER" eller "Kalles av" seksjon
        if grep -qE "(UNDERORDNEDE AGENTER|Kalles av|Aktiveres av)" "$BASE_PATH/$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $file: Har agent-referanse-seksjon"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠${NC} $file: Mangler 'Kalles av' eller 'UNDERORDNEDE AGENTER'"
            ((WARNINGS++))
            return 1
        fi
    fi
    return 1
}

# ============================================================================
# FUNKSJON: Sjekk for FUNKSJONS-MATRISE
# ============================================================================
check_funksjons_matrise() {
    local file="$1"

    if [ -f "$BASE_PATH/$file" ]; then
        if grep -q "FUNKSJONS-MATRISE" "$BASE_PATH/$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $file: Har FUNKSJONS-MATRISE"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠${NC} $file: Mangler FUNKSJONS-MATRISE"
            ((WARNINGS++))
            return 1
        fi
    fi
    return 1
}

# ============================================================================
# FUNKSJON: Sjekk for broken links (interne referanser)
# ============================================================================
check_internal_links() {
    local file="$1"

    if [ -f "$BASE_PATH/$file" ]; then
        # Finn alle interne referanser som starter med ./  eller ../
        local links=$(grep -oE "\]\([\.\/][^\)]+\)" "$BASE_PATH/$file" 2>/dev/null | sed 's/\](\(.*\))/\1/' || true)

        if [ -n "$links" ]; then
            local file_dir=$(dirname "$BASE_PATH/$file")
            while IFS= read -r link; do
                # Fjern ankre (#...)
                local clean_link=$(echo "$link" | sed 's/#.*//')
                local full_path="$file_dir/$clean_link"

                if [ -f "$full_path" ]; then
                    ((PASSED++))
                else
                    echo -e "${RED}✗${NC} BROKEN LINK i $file: $link"
                    ((ERRORS++))
                fi
            done <<< "$links"
        fi
    fi
}

# ============================================================================
# VALIDERING: SYSTEM-AGENTER
# ============================================================================
echo -e "\n${BLUE}--- SYSTEM-AGENTER (6 stk) ---${NC}"
check_file_exists "agenter/system/agent-ORCHESTRATOR.md" "ORCHESTRATOR"
check_file_exists "agenter/system/agent-AUTO-CLASSIFIER.md" "AUTO-CLASSIFIER"
check_file_exists "agenter/system/agent-CONTEXT-LOADER.md" "CONTEXT-LOADER"
check_file_exists "agenter/system/agent-PHASE-GATES.md" "PHASE-GATES"
check_file_exists "agenter/system/agent-AGENT-PROTOCOL.md" "AGENT-PROTOCOL"
check_file_exists "agenter/system/agent-BROWNFIELD-SCANNER.md" "BROWNFIELD-SCANNER"
check_file_exists "agenter/system/protocol-SYSTEM-COMMUNICATION.md" "SYSTEM-COMMUNICATION"

# ============================================================================
# VALIDERING: EKSPERT-AGENTER (alle 37)
# ============================================================================
echo -e "\n${BLUE}--- EKSPERT-AGENTER (37 stk) ---${NC}"
EKSPERT_AGENTS=(
  "AI-GOVERNANCE" "API-DESIGN" "BACKUP" "BRUKERTEST" "CICD"
  "CODE-QUALITY-GATE" "CROSS-BROWSER" "DATAMODELL" "DESIGN-TIL-KODE"
  "FEATURE-FLAGS" "GDPR" "GORGEOUS-UI" "HALLUSINASJON-DETEKTOR"
  "HEMMELIGHETSSJEKK" "INCIDENT-RESPONSE" "INFRASTRUKTUR"
  "KONKURRANSEANALYSE" "LASTTEST" "LEAN-CANVAS" "MIGRASJON"
  "MONITORING" "OWASP" "PERSONA" "PROMPT-INGENIØR" "REFAKTORING"
  "RLS-TESTER" "SCHEMA-MIGRASJON" "SELF-HEALING-TEST" "SRE"
  "SUPPLY-CHAIN" "TEST-GENERATOR" "TESTSKRIVER" "TILGJENGELIGHETS"
  "TRUSSELMODELLERINGS" "UIUX" "WIREFRAME" "YTELSE"
)
for agent in "${EKSPERT_AGENTS[@]}"; do
    check_file_exists "agenter/ekspert/${agent}-ekspert.md" "$agent"
done

# ============================================================================
# VALIDERING: BASIS-AGENTER
# ============================================================================
echo -e "\n${BLUE}--- BASIS-AGENTER ---${NC}"
for agent in BYGGER DEBUGGER DOKUMENTERER PLANLEGGER REVIEWER SIKKERHETS VEILEDER; do
    check_file_exists "agenter/basis/${agent}-agent.md" "$agent"
done

# ============================================================================
# VALIDERING: PROSESS-AGENTER
# ============================================================================
echo -e "\n${BLUE}--- PROSESS-AGENTER ---${NC}"
for i in {1..7}; do
    case $i in
        1) name="OPPSTART" ;;
        2) name="KRAV" ;;
        3) name="ARKITEKTUR" ;;
        4) name="MVP" ;;
        5) name="ITERASJONS" ;;
        6) name="KVALITETSSIKRINGS" ;;
        7) name="PUBLISERINGS" ;;
    esac
    check_file_exists "agenter/prosess/${i}-${name}-agent.md" "Fase $i: $name"
done

# ============================================================================
# VALIDERING: KLASSIFISERING-FILER
# ============================================================================
echo -e "\n${BLUE}--- KLASSIFISERING-FILER ---${NC}"
check_file_exists "klassifisering/KLASSIFISERING-METADATA-SYSTEM.md" "Metadata-system"
check_file_exists "klassifisering/FUNKSJONSOVERSIKT-KOMPLETT.md" "Funksjonsoversikt"
check_file_exists "klassifisering/CALLING-REGISTRY.md" "Calling-registry"
check_file_exists "klassifisering/ERROR-CODE-REGISTRY.md" "Feilkode-register"
check_file_exists "klassifisering/ARCHITECTURE-DIAGRAM.md" "Arkitektur-diagram"

# ============================================================================
# VALIDERING: AGENT-SEKSJONER
# ============================================================================
echo -e "\n${BLUE}--- AGENT-SEKSJONER (stikkprøver) ---${NC}"

# Sjekk PROSESS-agenter for påkrevde seksjoner
for file in agenter/prosess/*.md; do
    if [ -f "$BASE_PATH/$file" ]; then
        check_section_exists "$file" "## IDENTITET" "Identitet"
        check_section_exists "$file" "## FORMÅL" "Formål"
        check_section_exists "$file" "## AKTIVERING" "Aktivering"
        check_section_exists "$file" "## UNDERORDNEDE AGENTER" "Underordnede"
        check_section_exists "$file" "## HANDOFF" "Handoff"
    fi
done

# ============================================================================
# VALIDERING: FUNKSJONS-MATRISE
# ============================================================================
echo -e "\n${BLUE}--- FUNKSJONS-MATRISE SJEKK ---${NC}"

# Sjekk BASIS-agenter
for file in agenter/basis/*.md; do
    if [ -f "$BASE_PATH/$file" ]; then
        check_funksjons_matrise "$file"
    fi
done

# Sjekk PROSESS-agenter
for file in agenter/prosess/*.md; do
    if [ -f "$BASE_PATH/$file" ]; then
        check_funksjons_matrise "$file"
    fi
done

# ============================================================================
# VALIDERING: VERSJONER
# ============================================================================
echo -e "\n${BLUE}--- VERSJONSKONTROLL ---${NC}"
for file in agenter/system/*.md agenter/basis/*.md agenter/prosess/*.md; do
    if [ -f "$BASE_PATH/$file" ]; then
        check_version "$file"
    fi
done

# ============================================================================
# VALIDERING: SSOT - Klassifiseringsdata skal kun finnes i KLASSIFISERING-METADATA-SYSTEM.md
# ============================================================================
echo -e "\n${BLUE}--- SSOT KLASSIFISERINGS-SJEKK ---${NC}"
echo -e "Sjekker at doc-INTENSITY-MATRIX.md ikke inneholder dupliserte MÅ/BØR/KAN-klassifiseringer..."

SSOT_FILE="$BASE_PATH/klassifisering/KLASSIFISERING-METADATA-SYSTEM.md"
MATRIX_FILE="$BASE_PATH/agenter/system/doc-INTENSITY-MATRIX.md"

if [ -f "$MATRIX_FILE" ]; then
    # Sjekk om matrisen inneholder eksplisitte MÅ/BØR/KAN-verdier i tabeller
    # som ser ut som aktiveringsmatriser (ekspert-agent + MÅ/BØR/KAN-kolonner)
    # Mønsteret vi leter etter er tabellrader med ekspert-navn og MÅ/BØR/KAN-verdier
    DUPLICATED_CLASSIFICATIONS=$(grep -nE "^\|.*ekspert.*\|.*(MÅ|BØR|KAN|IKKE).*\|" "$MATRIX_FILE" 2>/dev/null | grep -vE "(SSOT|referanse|Forklaring)" || true)

    if [ -n "$DUPLICATED_CLASSIFICATIONS" ]; then
        echo -e "${RED}✗${NC} SSOT-BRUDD: doc-INTENSITY-MATRIX.md inneholder eksplisitte MÅ/BØR/KAN-klassifiseringer for ekspert-agenter."
        echo -e "   Disse verdiene skal kun finnes i KLASSIFISERING-METADATA-SYSTEM.md."
        echo -e "   Funnet på følgende linjer:"
        echo "$DUPLICATED_CLASSIFICATIONS" | while IFS= read -r line; do
            echo -e "   ${YELLOW}$line${NC}"
        done
        ((ERRORS++))
    else
        echo -e "${GREEN}✓${NC} doc-INTENSITY-MATRIX.md: Ingen dupliserte ekspert-klassifiseringer funnet"
        ((PASSED++))
    fi

    # Ekstra sjekk: Se etter tabeller med ✅ MÅ / ✅ BØR / ⚠️ KAN mønster
    EMOJI_CLASSIFICATIONS=$(grep -nE "^\|.*(✅ MÅ|✅ BØR|⚠️ KAN).*\|" "$MATRIX_FILE" 2>/dev/null | grep -vE "(Forklaring|SSOT|referanse)" || true)

    if [ -n "$EMOJI_CLASSIFICATIONS" ]; then
        echo -e "${RED}✗${NC} SSOT-BRUDD: doc-INTENSITY-MATRIX.md inneholder emoji-klassifiseringer (✅ MÅ/✅ BØR/⚠️ KAN)."
        echo -e "   Disse verdiene skal kun finnes i KLASSIFISERING-METADATA-SYSTEM.md."
        ((ERRORS++))
    else
        echo -e "${GREEN}✓${NC} doc-INTENSITY-MATRIX.md: Ingen emoji-klassifiseringer funnet"
        ((PASSED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} doc-INTENSITY-MATRIX.md ikke funnet, hopper over SSOT-sjekk"
    ((WARNINGS++))
fi

# Sjekk at SSOT-filen faktisk eksisterer
if [ -f "$SSOT_FILE" ]; then
    # Verifiser at den inneholder fase-oppgaver registeret
    if grep -q "KOMPLETT FASE-OPPGAVER REGISTER" "$SSOT_FILE" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} KLASSIFISERING-METADATA-SYSTEM.md: Inneholder KOMPLETT FASE-OPPGAVER REGISTER (SSOT)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} KLASSIFISERING-METADATA-SYSTEM.md: Mangler KOMPLETT FASE-OPPGAVER REGISTER"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} SSOT-fil mangler: KLASSIFISERING-METADATA-SYSTEM.md"
    ((ERRORS++))
fi

# ============================================================================
# VALIDERING: BROKEN LINKS
# ============================================================================
echo -e "\n${BLUE}--- BROKEN LINKS SJEKK ---${NC}"
for file in klassifisering/*.md agenter/system/*.md; do
    if [ -f "$BASE_PATH/$file" ]; then
        check_internal_links "$file"
    fi
done

# ============================================================================
# OPPSUMMERING
# ============================================================================
echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}  OPPSUMMERING${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Bestått:${NC}   $PASSED"
echo -e "${YELLOW}Advarsler:${NC} $WARNINGS"
echo -e "${RED}Feil:${NC}      $ERRORS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ VALIDERING FEILET${NC}"
    echo -e "   Fix $ERRORS feil før fortsettelse."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  VALIDERING BESTÅTT MED ADVARSLER${NC}"
    echo -e "   Vurder å fikse $WARNINGS advarsler."
    exit 0
else
    echo -e "${GREEN}✅ VALIDERING FULLSTENDIG BESTÅTT${NC}"
    exit 0
fi
