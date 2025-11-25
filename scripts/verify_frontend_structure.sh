#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# 📋 verify_frontend_structure.sh - Vérification Architecture Frontend v14
# ═══════════════════════════════════════════════════════════════════════════
#
# OBJECTIF :
# Valider l'architecture composition-based frontend :
# • Hooks exports organisés (Core, UI, Streaming, Memory)
# • Composants utilisent hooks (pas imports directs état)
# • Architecture unidirectionnelle respectée
#
# USAGE : ./scripts/verify_frontend_structure.sh
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
echo "📋 VÉRIFICATION ARCHITECTURE FRONTEND v14"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/5]${NC} Vérification exports hooks Core..."
# ───────────────────────────────────────────────────────────────────────────

CORE_HOOKS=(
    "usePerformanceMonitor"
    "useSystemMonitor"
    "useVitals"
    "useAnimation"
)

HOOKS_INDEX="src/hooks/index.ts"

if [[ ! -f "$HOOKS_INDEX" ]]; then
    echo -e "${RED}✗ ERREUR: Fichier $HOOKS_INDEX introuvable${NC}"
    ((ERRORS++))
else
    for hook in "${CORE_HOOKS[@]}"; do
        if grep -q "export.*$hook" "$HOOKS_INDEX"; then
            echo -e "${GREEN}✓${NC} Hook '$hook' exporté"
        else
            echo -e "${RED}✗ ERREUR: Hook '$hook' non exporté dans $HOOKS_INDEX${NC}"
            ((ERRORS++))
        fi
    done
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/5]${NC} Vérification usage hooks composants..."
# ───────────────────────────────────────────────────────────────────────────

# Vérifier que composants utilisent hooks (pattern useX)
COMPONENTS_WITH_HOOKS=$(grep -r "const.*= use[A-Z]" src/components src/features 2>/dev/null | wc -l)

if [[ $COMPONENTS_WITH_HOOKS -gt 50 ]]; then
    echo -e "${GREEN}✓${NC} $COMPONENTS_WITH_HOOKS composants utilisent des hooks"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $COMPONENTS_WITH_HOOKS composants utilisent des hooks (attendu >50)${NC}"
    ((WARNINGS++))
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/5]${NC} Vérification absence imports directs état..."
# ───────────────────────────────────────────────────────────────────────────

# Pattern à éviter : imports directs de stores/états (anti-pattern)
DIRECT_STATE_IMPORTS=$(grep -r "import.*from.*stores" src/components src/features 2>/dev/null | grep -v "node_modules" | wc -l || true)

if [[ $DIRECT_STATE_IMPORTS -eq 0 ]]; then
    echo -e "${GREEN}✓${NC} Aucun import direct d'état détecté (composition OK)"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: $DIRECT_STATE_IMPORTS imports directs d'état détectés${NC}"
    ((WARNINGS++))
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/5]${NC} Vérification AnimationContext provider..."
# ───────────────────────────────────────────────────────────────────────────

if [[ -f "src/contexts/AnimationContext.tsx" ]]; then
    echo -e "${GREEN}✓${NC} AnimationContext trouvé"

    # Vérifier usage useAnimation dans composants
    USE_ANIMATION_COUNT=$(grep -r "useAnimation" src/components src/features 2>/dev/null | wc -l)

    if [[ $USE_ANIMATION_COUNT -gt 15 ]]; then
        echo -e "${GREEN}✓${NC} $USE_ANIMATION_COUNT composants utilisent useAnimation"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $USE_ANIMATION_COUNT composants utilisent useAnimation (attendu >15)${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗ ERREUR: AnimationContext.tsx introuvable${NC}"
    ((ERRORS++))
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/5]${NC} Vérification structure dossiers..."
# ───────────────────────────────────────────────────────────────────────────

REQUIRED_DIRS=(
    "src/hooks"
    "src/components"
    "src/features"
    "src/contexts"
    "src/services"
    "src/core"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        FILES_COUNT=$(find "$dir" -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
        echo -e "${GREEN}✓${NC} $dir/ ($FILES_COUNT fichiers)"
    else
        echo -e "${RED}✗ ERREUR: Dossier $dir introuvable${NC}"
        ((ERRORS++))
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ VÉRIFICATION ARCHITECTURE FRONTEND"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ ARCHITECTURE FRONTEND : PASS${NC}"
    echo -e "   • 0 erreurs critiques"
    echo -e "   • $WARNINGS avertissements"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ARCHITECTURE FRONTEND : FAIL${NC}"
    echo -e "   • $ERRORS erreurs critiques"
    echo -e "   • $WARNINGS avertissements"
    echo ""
    exit 1
fi
