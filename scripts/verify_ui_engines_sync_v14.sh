#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# ⚙️  verify_ui_engines_sync.sh - Vérification UI Moteurs Sync v14
# ═══════════════════════════════════════════════════════════════════════════
#
# OBJECTIF :
# Valider synchronisation UI moteurs cognitifs :
# • useSystemMonitor intégré et fonctionnel
# • VitalsPanel affiche données temps réel
# • EngineStatusPage complet (3 moteurs)
#
# USAGE : ./scripts/verify_ui_engines_sync.sh
# EXIT CODE : 0 si 100% conforme, 1 sinon
#
# ═══════════════════════════════════════════════════════════════════════════

# Removed set -e to continue on warnings

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "⚙️  VÉRIFICATION UI MOTEURS SYNC v14"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/4]${NC} Vérification useSystemMonitor hook..."
# ───────────────────────────────────────────────────────────────────────────

USE_SYSTEM_MONITOR="src/hooks/useSystemMonitor.ts"

if [[ ! -f "$USE_SYSTEM_MONITOR" ]]; then
    echo -e "${RED}✗ ERREUR: Fichier $USE_SYSTEM_MONITOR introuvable${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} useSystemMonitor.ts trouvé"

    # Vérifier export dans hooks/index.ts
    if grep -q "useSystemMonitor" "src/hooks/index.ts" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} useSystemMonitor exporté dans hooks/index.ts"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: useSystemMonitor non exporté dans hooks/index.ts${NC}"
        ((WARNINGS++))
    fi

    # Vérifier structure hook (state engines)
    if grep -q "engineVitals" "$USE_SYSTEM_MONITOR" || grep -q "engines:" "$USE_SYSTEM_MONITOR"; then
        echo -e "${GREEN}✓${NC} Structure 'engineVitals' présente dans hook"
    else
        echo -e "${RED}✗ ERREUR: Structure 'engineVitals' manquante${NC}"
        ((ERRORS++))
    fi
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/4]${NC} Vérification VitalsPanel composant..."
# ───────────────────────────────────────────────────────────────────────────

VITALS_PANEL="src/components/VitalsPanel.tsx"

if [[ ! -f "$VITALS_PANEL" ]]; then
    echo -e "${RED}✗ ERREUR: Fichier $VITALS_PANEL introuvable${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} VitalsPanel.tsx trouvé"

    # Vérifier usage useSystemMonitor
    if grep -q "useSystemMonitor" "$VITALS_PANEL"; then
        echo -e "${GREEN}✓${NC} VitalsPanel utilise useSystemMonitor"
    else
        echo -e "${RED}✗ ERREUR: VitalsPanel n'utilise pas useSystemMonitor${NC}"
        ((ERRORS++))
    fi

    # Vérifier affichage engines (Helios, Nexus, Harmonia)
    ENGINES_DISPLAY=0
    for engine in "Helios" "Nexus" "Harmonia"; do
        if grep -q "$engine" "$VITALS_PANEL"; then
            ((ENGINES_DISPLAY++))
        fi
    done

    if [[ $ENGINES_DISPLAY -ge 3 ]]; then
        echo -e "${GREEN}✓${NC} VitalsPanel affiche 3 moteurs (Helios, Nexus, Harmonia)"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $ENGINES_DISPLAY/3 moteurs affichés${NC}"
        ((WARNINGS++))
    fi
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/4]${NC} Vérification EngineStatusPage..."
# ───────────────────────────────────────────────────────────────────────────

ENGINE_STATUS_PAGE="src/pages/EngineStatusPage.tsx"

if [[ ! -f "$ENGINE_STATUS_PAGE" ]]; then
    echo -e "${RED}✗ ERREUR: Fichier $ENGINE_STATUS_PAGE introuvable${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} EngineStatusPage.tsx trouvé"

    # Vérifier usage useSystemMonitor
    if grep -q "useSystemMonitor" "$ENGINE_STATUS_PAGE"; then
        echo -e "${GREEN}✓${NC} EngineStatusPage utilise useSystemMonitor"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: EngineStatusPage n'utilise pas useSystemMonitor${NC}"
        ((WARNINGS++))
    fi

    # Vérifier composants visualizations
    VISUALIZATIONS=0
    for viz in "HeliosVisualization" "NexusGraph" "HarmoniaPatterns"; do
        if grep -q "$viz" "$ENGINE_STATUS_PAGE"; then
            ((VISUALIZATIONS++))
        fi
    done

    if [[ $VISUALIZATIONS -ge 2 ]]; then
        echo -e "${GREEN}✓${NC} EngineStatusPage utilise $VISUALIZATIONS visualizations"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $VISUALIZATIONS visualizations utilisées${NC}"
        ((WARNINGS++))
    fi
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/4]${NC} Vérification composants visualizations cognitives..."
# ───────────────────────────────────────────────────────────────────────────

VISUALIZATIONS_FILES=(
    "src/features/cognitive/HeliosVisualization.tsx"
    "src/features/cognitive/NexusGraph.tsx"
    "src/features/cognitive/HarmoniaPatterns.tsx"
)

VIZ_FOUND=0
for viz_file in "${VISUALIZATIONS_FILES[@]}"; do
    if [[ -f "$viz_file" ]]; then
        ((VIZ_FOUND++))
    fi
done

if [[ $VIZ_FOUND -eq 3 ]]; then
    echo -e "${GREEN}✓${NC} 3/3 composants visualizations trouvés"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $VIZ_FOUND/3 visualizations trouvées${NC}"
    ((WARNINGS++))
fi

# Vérifier usage useAnimation dans visualizations
USE_ANIMATION_VIZ=$(grep -l "useAnimation" "${VISUALIZATIONS_FILES[@]}" 2>/dev/null | wc -l || true)

if [[ $USE_ANIMATION_VIZ -ge 2 ]]; then
    echo -e "${GREEN}✓${NC} $USE_ANIMATION_VIZ visualizations utilisent useAnimation"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $USE_ANIMATION_VIZ visualizations utilisent useAnimation${NC}"
    ((WARNINGS++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ VÉRIFICATION UI MOTEURS SYNC"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ UI MOTEURS SYNC : PASS${NC}"
    echo -e "   • 0 erreurs critiques"
    echo -e "   • $WARNINGS avertissements"
    echo ""
    exit 0
else
    echo -e "${RED}❌ UI MOTEURS SYNC : FAIL${NC}"
    echo -e "   • $ERRORS erreurs critiques"
    echo -e "   • $WARNINGS avertissements"
    echo ""
    exit 1
fi
