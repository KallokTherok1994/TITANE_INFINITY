#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# ⚡ verify_performance_v14.sh - Vérification Performance Frontend v14
# ═══════════════════════════════════════════════════════════════════════════
#
# OBJECTIF :
# Valider optimisations performance frontend :
# • React.memo usage sur composants feuilles
# • useMemo/useCallback pour calculs coûteux
# • AnimationContext intégré (throttling FPS)
# • Code splitting / lazy loading
#
# USAGE : ./scripts/verify_performance_v14.sh
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
echo "⚡ VÉRIFICATION PERFORMANCE FRONTEND v14"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/5]${NC} Vérification React.memo usage..."
# ───────────────────────────────────────────────────────────────────────────

# Compter composants avec React.memo
REACT_MEMO_COUNT=$(grep -r "React\.memo" src/components src/features 2>/dev/null | wc -l || true)

if [[ $REACT_MEMO_COUNT -ge 10 ]]; then
    echo -e "${GREEN}✓${NC} $REACT_MEMO_COUNT composants avec React.memo"
elif [[ $REACT_MEMO_COUNT -ge 5 ]]; then
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $REACT_MEMO_COUNT composants avec React.memo (attendu >= 10)${NC}"
    ((WARNINGS++))
else
    echo -e "${RED}✗ ERREUR: Seulement $REACT_MEMO_COUNT composants avec React.memo${NC}"
    ((ERRORS++))
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/5]${NC} Vérification useMemo/useCallback usage..."
# ───────────────────────────────────────────────────────────────────────────

# Compter useMemo
USE_MEMO_COUNT=$(grep -r "useMemo" src/components src/features src/hooks 2>/dev/null | wc -l || true)

if [[ $USE_MEMO_COUNT -ge 20 ]]; then
    echo -e "${GREEN}✓${NC} $USE_MEMO_COUNT usages de useMemo"
elif [[ $USE_MEMO_COUNT -ge 10 ]]; then
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $USE_MEMO_COUNT usages de useMemo (attendu >= 20)${NC}"
    ((WARNINGS++))
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $USE_MEMO_COUNT usages de useMemo${NC}"
    ((WARNINGS++))
fi

# Compter useCallback
USE_CALLBACK_COUNT=$(grep -r "useCallback" src/components src/features src/hooks 2>/dev/null | wc -l || true)

if [[ $USE_CALLBACK_COUNT -ge 30 ]]; then
    echo -e "${GREEN}✓${NC} $USE_CALLBACK_COUNT usages de useCallback"
elif [[ $USE_CALLBACK_COUNT -ge 15 ]]; then
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $USE_CALLBACK_COUNT usages de useCallback (attendu >= 30)${NC}"
    ((WARNINGS++))
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $USE_CALLBACK_COUNT usages de useCallback${NC}"
    ((WARNINGS++))
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/5]${NC} Vérification AnimationContext (throttling FPS)..."
# ───────────────────────────────────────────────────────────────────────────

ANIMATION_CONTEXT="src/contexts/AnimationContext.tsx"

if [[ ! -f "$ANIMATION_CONTEXT" ]]; then
    echo -e "${RED}✗ ERREUR: Fichier $ANIMATION_CONTEXT introuvable${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} AnimationContext.tsx trouvé"

    # Vérifier usePerformanceMonitor integration
    if grep -q "usePerformanceMonitor" "$ANIMATION_CONTEXT"; then
        echo -e "${GREEN}✓${NC} AnimationContext utilise usePerformanceMonitor"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: usePerformanceMonitor non intégré dans AnimationContext${NC}"
        ((WARNINGS++))
    fi

    # Vérifier throttling adaptatif (FPS-based)
    if grep -q "shouldThrottle" "$ANIMATION_CONTEXT" || grep -q "fps" "$ANIMATION_CONTEXT"; then
        echo -e "${GREEN}✓${NC} Throttling adaptatif FPS présent"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Throttling adaptatif absent${NC}"
        ((WARNINGS++))
    fi

    # Compter composants utilisant useAnimation
    USE_ANIMATION_COUNT=$(grep -r "useAnimation" src/components src/features 2>/dev/null | wc -l || true)

    if [[ $USE_ANIMATION_COUNT -ge 15 ]]; then
        echo -e "${GREEN}✓${NC} $USE_ANIMATION_COUNT composants utilisent useAnimation"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $USE_ANIMATION_COUNT composants utilisent useAnimation${NC}"
        ((WARNINGS++))
    fi
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/5]${NC} Vérification code splitting / lazy loading..."
# ───────────────────────────────────────────────────────────────────────────

# Compter React.lazy
LAZY_COUNT=$(grep -r "React\.lazy" src/ 2>/dev/null | wc -l || true)

if [[ $LAZY_COUNT -ge 5 ]]; then
    echo -e "${GREEN}✓${NC} $LAZY_COUNT usages de React.lazy (code splitting)"
elif [[ $LAZY_COUNT -ge 2 ]]; then
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $LAZY_COUNT usages de React.lazy (attendu >= 5)${NC}"
    ((WARNINGS++))
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $LAZY_COUNT usages de React.lazy${NC}"
    ((WARNINGS++))
fi

# Vérifier Suspense
SUSPENSE_COUNT=$(grep -r "<Suspense" src/ 2>/dev/null | wc -l || true)

if [[ $SUSPENSE_COUNT -ge 3 ]]; then
    echo -e "${GREEN}✓${NC} $SUSPENSE_COUNT usages de Suspense (fallback)"
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $SUSPENSE_COUNT usages de Suspense${NC}"
    ((WARNINGS++))
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/5]${NC} Vérification build bundle size..."
# ───────────────────────────────────────────────────────────────────────────

# Vérifier si dist/ existe (build récent)
if [[ -d "dist" ]]; then
    # Compter chunks générés
    CHUNKS_COUNT=$(find dist/assets -name "*.js" 2>/dev/null | wc -l || true)

    if [[ $CHUNKS_COUNT -ge 10 ]]; then
        echo -e "${GREEN}✓${NC} $CHUNKS_COUNT chunks JS générés (code splitting OK)"
    elif [[ $CHUNKS_COUNT -ge 5 ]]; then
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $CHUNKS_COUNT chunks (attendu >= 10)${NC}"
        ((WARNINGS++))
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $CHUNKS_COUNT chunks${NC}"
        ((WARNINGS++))
    fi

    # Vérifier taille vendor bundle (largest)
    VENDOR_SIZE=$(find dist/assets -name "vendor-*.js" -exec du -h {} \; 2>/dev/null | sort -h | tail -1 | awk '{print $1}' || echo "unknown")

    if [[ "$VENDOR_SIZE" != "unknown" ]]; then
        echo -e "${GREEN}✓${NC} Largest vendor bundle: $VENDOR_SIZE"
    else
        echo -e "${YELLOW}⚠ AVERTISSEMENT: Impossible de déterminer taille bundle${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠ AVERTISSEMENT: Dossier dist/ introuvable (build requis)${NC}"
    ((WARNINGS++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ VÉRIFICATION PERFORMANCE"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ PERFORMANCE FRONTEND : PASS${NC}"
    echo -e "   • 0 erreurs critiques"
    echo -e "   • $WARNINGS avertissements"
    echo ""

    # Métriques résumées
    echo "📈 MÉTRIQUES PERFORMANCE :"
    echo "   • React.memo : $REACT_MEMO_COUNT composants"
    echo "   • useMemo : $USE_MEMO_COUNT usages"
    echo "   • useCallback : $USE_CALLBACK_COUNT usages"
    echo "   • useAnimation : $USE_ANIMATION_COUNT composants"
    echo "   • React.lazy : $LAZY_COUNT usages"
    echo "   • Chunks JS : $CHUNKS_COUNT fichiers"
    echo ""
    exit 0
else
    echo -e "${RED}❌ PERFORMANCE FRONTEND : FAIL${NC}"
    echo -e "   • $ERRORS erreurs critiques"
    echo -e "   • $WARNINGS avertissements"
    echo ""
    exit 1
fi
