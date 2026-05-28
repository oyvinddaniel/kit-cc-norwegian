#!/bin/bash
# ============================================================================
# DISTRIBUSJON-RENSING FOR KIT CC v1.0
# ============================================================================
#
# Formål: Fjerner all utvikler-only-innhold fra CLAUDE.md og prosjektet
#         før Kit CC distribueres til sluttbrukere.
#
# Bruk:   ./scripts/distribute-clean.sh [prosjektrot]
#         (Standard: kjør fra Kit CC/Agenter/)
#
# Modus:
#   --dry-run   Vis hva som ville blitt endret (standard)
#   --apply     Utfør endringene
#
# ============================================================================

set +e

# Farger
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Modus
MODE="dry-run"
if [[ "$1" == "--apply" ]] || [[ "$2" == "--apply" ]]; then
    MODE="apply"
fi

# Base-path (prosjektrot)
if [[ "$1" != "--"* ]]; then
    PROJECT_ROOT="${1:-.}"
else
    PROJECT_ROOT="."
fi

# Finn CLAUDE.md
CLAUDE_MD=""
if [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
    CLAUDE_MD="$PROJECT_ROOT/CLAUDE.md"
elif [ -f "$PROJECT_ROOT/../CLAUDE.md" ]; then
    CLAUDE_MD="$PROJECT_ROOT/../CLAUDE.md"
elif [ -f "$PROJECT_ROOT/../../CLAUDE.md" ]; then
    CLAUDE_MD="$PROJECT_ROOT/../../CLAUDE.md"
fi

if [ -z "$CLAUDE_MD" ] || [ ! -f "$CLAUDE_MD" ]; then
    echo -e "${RED}✗ Finner ikke CLAUDE.md. Kjør fra prosjektroten eller oppgi sti.${NC}"
    exit 1
fi

PROJECT_ROOT=$(dirname "$CLAUDE_MD")

# Tellervariabler
CHANGES=0
ERRORS=0

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  KIT CC DISTRIBUSJON-RENSING${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "Modus: ${YELLOW}$MODE${NC}"
echo -e "CLAUDE.md: $CLAUDE_MD"
echo -e "Prosjektrot: $PROJECT_ROOT"
echo ""

# ============================================================================
# FUNKSJON: Søk etter utvikler-termer
# ============================================================================
check_term() {
    local file="$1"
    local term="$2"
    local description="$3"

    if [ -f "$file" ]; then
        local count=$(grep -c "$term" "$file" 2>/dev/null || echo "0")
        if [ "$count" -gt 0 ]; then
            echo -e "${YELLOW}⚠${NC} $description: '$term' funnet $count ganger i $(basename $file)"
            ((CHANGES++))
            return 1
        else
            echo -e "${GREEN}✓${NC} $description: '$term' ikke funnet"
            return 0
        fi
    fi
    return 0
}

# ============================================================================
# SJEKK 1: UTVIKLER-ONLY termer i CLAUDE.md
# ============================================================================
echo -e "\n${BLUE}--- SJEKK 1: Utvikler-only termer i CLAUDE.md ---${NC}"

DEV_TERMS=("UTVIKLER-ONLY" "Forbedre Kit CC" "feature-tracker" "FEATURE-TRACKER" "OVERSIKT.md" "BESLUTNINGER.md" "Forbedre-modus" "Forbedre-logikk")

for term in "${DEV_TERMS[@]}"; do
    check_term "$CLAUDE_MD" "$term" "CLAUDE.md"
done

# ============================================================================
# SJEKK 2: Modusvalg — bare Bygge og Spørre
# ============================================================================
echo -e "\n${BLUE}--- SJEKK 2: Modusvalg (skal kun ha Bygge + Spørre) ---${NC}"

if grep -q "Forbedre Kit CC" "$CLAUDE_MD" 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC} MODUSVALG inneholder fortsatt 'Forbedre Kit CC' (steg 3)"
    ((CHANGES++))
else
    echo -e "${GREEN}✓${NC} MODUSVALG har kun Bygge og Spørre"
fi

# ============================================================================
# SJEKK 3: AUTOMATISK FEATURE-TRACKER seksjon
# ============================================================================
echo -e "\n${BLUE}--- SJEKK 3: Feature-tracker seksjon ---${NC}"

if grep -q "## AUTOMATISK FEATURE-TRACKER" "$CLAUDE_MD" 2>/dev/null; then
    local_start=$(grep -n "## AUTOMATISK FEATURE-TRACKER" "$CLAUDE_MD" | head -1 | cut -d: -f1)
    echo -e "${YELLOW}⚠${NC} AUTOMATISK FEATURE-TRACKER-seksjon finnes (linje $local_start)"
    ((CHANGES++))
else
    echo -e "${GREEN}✓${NC} Ingen FEATURE-TRACKER-seksjon funnet"
fi

# ============================================================================
# SJEKK 4: Feature-tracker kommandoer i HURTIGSTART
# ============================================================================
echo -e "\n${BLUE}--- SJEKK 4: Feature-tracker kommandoer ---${NC}"

if grep -q "Vis features" "$CLAUDE_MD" 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC} Feature-tracker kommandoer finnes i filen"
    ((CHANGES++))
else
    echo -e "${GREEN}✓${NC} Ingen feature-tracker kommandoer"
fi

# ============================================================================
# SJEKK 5: Nye funksjoner-mappe
# ============================================================================
echo -e "\n${BLUE}--- SJEKK 5: Utvikler-mapper ---${NC}"

FEATURE_DIR="$PROJECT_ROOT/Nye funksjoner i Kit CC"
if [ -d "$FEATURE_DIR" ]; then
    local_count=$(find "$FEATURE_DIR" -type f | wc -l | tr -d ' ')
    echo -e "${YELLOW}⚠${NC} Mappen 'Nye funksjoner i Kit CC/' finnes ($local_count filer)"
    ((CHANGES++))

    if [ "$MODE" == "apply" ]; then
        echo -e "${RED}  → Sletter mappen...${NC}"
        rm -rf "$FEATURE_DIR"
        echo -e "${GREEN}  ✓ Slettet${NC}"
    fi
else
    echo -e "${GREEN}✓${NC} Ingen 'Nye funksjoner i Kit CC/'-mappe"
fi

# ============================================================================
# SJEKK 6: [UTVIKLER-ONLY] tags i overskrifter
# ============================================================================
echo -e "\n${BLUE}--- SJEKK 6: [UTVIKLER-ONLY] tags ---${NC}"

UTVIKLER_TAGS=$(grep -c "\[UTVIKLER-ONLY\]" "$CLAUDE_MD" 2>/dev/null || echo "0")
if [ "$UTVIKLER_TAGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC} $UTVIKLER_TAGS [UTVIKLER-ONLY]-tags gjenstår i CLAUDE.md"
    ((CHANGES++))

    if [ "$MODE" == "apply" ]; then
        TMPFILE=$(mktemp)
        if sed 's/\[UTVIKLER-ONLY\] //g; s/ \[UTVIKLER-ONLY\]//g; s/\[UTVIKLER-ONLY — fjernes før distribusjon\]//g' "$CLAUDE_MD" > "$TMPFILE" && [ -s "$TMPFILE" ]; then
            cp "$CLAUDE_MD" "${CLAUDE_MD}.bak"
            mv "$TMPFILE" "$CLAUDE_MD"
            echo -e "${GREEN}  ✓ Tags fjernet (backup: ${CLAUDE_MD}.bak)${NC}"
        else
            rm -f "$TMPFILE"
            echo -e "${RED}  ✗ Transformasjon feilet — original uendret${NC}"
            ((ERRORS++))
        fi
    fi
else
    echo -e "${GREEN}✓${NC} Ingen [UTVIKLER-ONLY]-tags"
fi

# ============================================================================
# OPPSUMMERING
# ============================================================================
echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}  OPPSUMMERING${NC}"
echo -e "${BLUE}============================================${NC}"

if [ $CHANGES -eq 0 ]; then
    echo -e "${GREEN}✅ KLAR FOR DISTRIBUSJON${NC}"
    echo -e "   Ingen utvikler-only-innhold funnet."
    exit 0
else
    echo -e "${YELLOW}⚠️  $CHANGES ENDRINGER NØDVENDIG${NC}"
    if [ "$MODE" == "dry-run" ]; then
        echo ""
        echo -e "Følgende må fjernes manuelt eller med --apply:"
        echo -e "  1. Fjern 'Forbedre Kit CC' fra MODUSVALG (steg 0)"
        echo -e "  2. Fjern hele AUTOMATISK FEATURE-TRACKER seksjonen"
        echo -e "  3. Fjern feature-tracker kommandoer fra HURTIGSTART og FOR AI steg 7"
        echo -e "  4. Fjern Forbedre-logikk fra FOR AI steg 0"
        echo -e "  5. Fjern [UTVIKLER-ONLY]-tags (kan gjøres med --apply)"
        echo -e "  6. Fjern 'Nye funksjoner i Kit CC/'-mappen (kan gjøres med --apply)"
        echo -e ""
        echo -e "  Kjør med ${YELLOW}--apply${NC} for å utføre automatiske endringer."
        echo -e "  ${RED}NB:${NC} Seksjonsfjering i CLAUDE.md krever manuell redigering"
        echo -e "  for å sikre at riktig innhold fjernes."
    else
        echo -e "  Automatiske endringer utført."
        echo -e "  ${RED}NB:${NC} Fjern seksjoner i CLAUDE.md manuelt (feature-tracker, modusvalg)."
    fi
    exit 1
fi
