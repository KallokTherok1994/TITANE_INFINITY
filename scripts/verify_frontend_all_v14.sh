#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# 🚀 verify_frontend_all_v14.sh - Master Verification Script Frontend v14
# ═══════════════════════════════════════════════════════════════════════════
#
# OBJECTIF :
# Orchestrer toutes vérifications frontend v14 :
# • Architecture Frontend (hooks, composition)
# • Design System Tokens (CSS centralisé)
# • Conformité Tauri-Only (sécurité HTTP)
# • UI Moteurs Sync (useSystemMonitor, VitalsPanel)
# • Performance Frontend (React.memo, AnimationContext, code splitting)
#
# USAGE : ./scripts/verify_frontend_all_v14.sh
# EXIT CODE : 0 si 100% OK, 1 si erreurs
#
# ═══════════════════════════════════════════════════════════════════════════

# Removed set -e to continue through all scripts

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${BOLD}🚀 MASTER VERIFICATION FRONTEND v14.0.0${NC}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Super-Prompt Frontend v14 - 9/9 Phases"
echo "Exécution 5 scripts de vérification..."
echo ""

# Vérifier que les scripts existent
SCRIPTS_DIR="$(dirname "$0")"
REQUIRED_SCRIPTS=(
    "verify_frontend_structure.sh"
    "verify_ds_tokens.sh"
    "verify_tauri_local_only.sh"
    "verify_ui_engines_sync_v14.sh"
    "verify_performance_v14.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [[ ! -f "$SCRIPTS_DIR/$script" ]]; then
        echo -e "${RED}✗ ERREUR: Script $script introuvable dans $SCRIPTS_DIR${NC}"
        exit 1
    fi
done

# Rendre les scripts exécutables
chmod +x "$SCRIPTS_DIR"/*.sh

# Variables résultats
TOTAL_SCRIPTS=5
PASSED_SCRIPTS=0
FAILED_SCRIPTS=0
TOTAL_ERRORS=0
TOTAL_WARNINGS=0

# Tableau résultats
declare -a RESULTS

echo "───────────────────────────────────────────────────────────────────────────"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT 1 : Architecture Frontend
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/5]${NC} Vérification Architecture Frontend..."
echo ""

if "$SCRIPTS_DIR/verify_frontend_structure.sh"; then
    RESULTS[0]="${GREEN}✅ PASS${NC}"
    ((PASSED_SCRIPTS++))
else
    RESULTS[0]="${RED}❌ FAIL${NC}"
    ((FAILED_SCRIPTS++))
fi

echo ""
echo "───────────────────────────────────────────────────────────────────────────"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT 2 : Design System Tokens
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[2/5]${NC} Vérification Design System Tokens..."
echo ""

if "$SCRIPTS_DIR/verify_ds_tokens.sh"; then
    RESULTS[1]="${GREEN}✅ PASS${NC}"
    ((PASSED_SCRIPTS++))
else
    RESULTS[1]="${RED}❌ FAIL${NC}"
    ((FAILED_SCRIPTS++))
fi

echo ""
echo "───────────────────────────────────────────────────────────────────────────"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT 3 : Conformité Tauri-Only
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[3/5]${NC} Vérification Conformité Tauri-Only..."
echo ""

if "$SCRIPTS_DIR/verify_tauri_local_only.sh"; then
    RESULTS[2]="${GREEN}✅ PASS${NC}"
    ((PASSED_SCRIPTS++))
else
    RESULTS[2]="${RED}❌ FAIL${NC}"
    ((FAILED_SCRIPTS++))
fi

echo ""
echo "───────────────────────────────────────────────────────────────────────────"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT 4 : UI Moteurs Sync
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[4/5]${NC} Vérification UI Moteurs Sync..."
echo ""

if "$SCRIPTS_DIR/verify_ui_engines_sync_v14.sh"; then
    RESULTS[3]="${GREEN}✅ PASS${NC}"
    ((PASSED_SCRIPTS++))
else
    RESULTS[3]="${RED}❌ FAIL${NC}"
    ((FAILED_SCRIPTS++))
fi

echo ""
echo "───────────────────────────────────────────────────────────────────────────"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT 5 : Performance Frontend
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[5/5]${NC} Vérification Performance Frontend..."
echo ""

if "$SCRIPTS_DIR/verify_performance_v14.sh"; then
    RESULTS[4]="${GREEN}✅ PASS${NC}"
    ((PASSED_SCRIPTS++))
else
    RESULTS[4]="${RED}❌ FAIL${NC}"
    ((FAILED_SCRIPTS++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"

# ═══════════════════════════════════════════════════════════════════════════
# RÉSUMÉ GLOBAL FINAL
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BOLD}📊 RÉSUMÉ GLOBAL VÉRIFICATIONS FRONTEND v14${NC}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo -e "${BOLD}RÉSULTATS PAR SCRIPT :${NC}"
echo ""
echo -e "  1. Architecture Frontend          ${RESULTS[0]}"
echo -e "  2. Design System Tokens           ${RESULTS[1]}"
echo -e "  3. Conformité Tauri-Only          ${RESULTS[2]}"
echo -e "  4. UI Moteurs Sync                ${RESULTS[3]}"
echo -e "  5. Performance Frontend           ${RESULTS[4]}"
echo ""

echo "───────────────────────────────────────────────────────────────────────────"
echo ""

# Calcul pourcentage réussite
SUCCESS_PERCENT=$((PASSED_SCRIPTS * 100 / TOTAL_SCRIPTS))

echo -e "${BOLD}STATISTIQUES :${NC}"
echo -e "  • Scripts exécutés : ${BOLD}$TOTAL_SCRIPTS${NC}"
echo -e "  • Scripts PASS     : ${GREEN}${BOLD}$PASSED_SCRIPTS${NC}"
echo -e "  • Scripts FAIL     : ${RED}${BOLD}$FAILED_SCRIPTS${NC}"
echo -e "  • Taux de réussite : ${BOLD}$SUCCESS_PERCENT%${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# CONCLUSION FINALE
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

if [[ $FAILED_SCRIPTS -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}✅✅✅ FRONTEND v14 : 100% VALIDÉ ✅✅✅${NC}"
    echo ""
    echo -e "${GREEN}Toutes les vérifications sont passées avec succès !${NC}"
    echo ""
    echo -e "${BOLD}🎉 SUPER-PROMPT FRONTEND v14 : 9/9 PHASES COMPLÉTÉES${NC}"
    echo ""
    echo "🚀 READY FOR BUILD v14.0.0"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    exit 0
else
    echo -e "${RED}${BOLD}❌ FRONTEND v14 : ÉCHEC VALIDATION${NC}"
    echo ""
    echo -e "${RED}$FAILED_SCRIPTS/$TOTAL_SCRIPTS scripts ont échoué.${NC}"
    echo ""
    echo "Veuillez corriger les erreurs signalées ci-dessus."
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    exit 1
fi
