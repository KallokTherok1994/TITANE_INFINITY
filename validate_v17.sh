#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v17 — SCRIPT DE VALIDATION AUTOMATIQUE
# ═══════════════════════════════════════════════════════════════════════════
# Vérifie que tous les correctifs v17 sont bien en place
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v17 — VALIDATION AUTOMATIQUE"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# ─────────────────────────────────────────────────────────────────────────────
# Test 1: Vérifier absence de std::sync::Mutex dans modules async critiques
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}[TEST 1]${NC} Vérification absence std::sync::Mutex dans modules async..."

ASYNC_MODULES=(
    "src-tauri/src/commands/meta_mode.rs"
    "src-tauri/src/commands/exp_fusion.rs"
    "src-tauri/src/commands/evolution.rs"
    "src-tauri/src/overdrive/chat_orchestrator.rs"
    "src-tauri/src/overdrive/semantic_kernel.rs"
)

for module in "${ASYNC_MODULES[@]}"; do
    if [ -f "$module" ]; then
        if grep -q "use std::sync::Mutex" "$module" 2>/dev/null; then
            echo -e "${RED}  ✗ ERREUR: std::sync::Mutex trouvé dans $module${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}  ✓ OK: $module${NC}"
        fi
    else
        echo -e "${YELLOW}  ⚠ WARNING: $module non trouvé${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Test 2: Vérifier présence de tokio::sync::RwLock
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[TEST 2]${NC} Vérification présence tokio::sync::RwLock..."

for module in "${ASYNC_MODULES[@]}"; do
    if [ -f "$module" ]; then
        if grep -q "tokio::sync::RwLock" "$module" 2>/dev/null; then
            echo -e "${GREEN}  ✓ OK: RwLock trouvé dans $module${NC}"
        else
            echo -e "${RED}  ✗ ERREUR: RwLock manquant dans $module${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Test 3: Vérifier absence de #[async_recursion]
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[TEST 3]${NC} Vérification absence #[async_recursion]..."

RECURSION_COUNT=$(grep -r "#\[async_recursion\]" src-tauri/src/ 2>/dev/null | \
                  grep -v "tauri_v2_guard.rs" | \
                  grep -v "//" | \
                  wc -l || echo "0")

if [ "$RECURSION_COUNT" -eq 0 ]; then
    echo -e "${GREEN}  ✓ OK: Aucun async_recursion trouvé${NC}"
else
    echo -e "${RED}  ✗ ERREUR: $RECURSION_COUNT occurrence(s) de async_recursion trouvée(s)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# Test 4: Vérifier présence des fichiers de documentation
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[TEST 4]${NC} Vérification documentation..."

DOCS=(
    "ARCHITECTURE_RULES_v17.md"
    "CHANGELOG_v17.0.0_FIX_MASTER.md"
    "RAPPORT_INTERVENTION_v17.md"
    "VERIFICATION_COMPLETE_v17.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}  ✓ OK: $doc présent${NC}"
    else
        echo -e "${RED}  ✗ ERREUR: $doc manquant${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Test 5: Vérifier présence du module de tests
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[TEST 5]${NC} Vérification module de tests..."

if [ -f "src-tauri/src/tauri_v2_guard.rs" ]; then
    echo -e "${GREEN}  ✓ OK: tauri_v2_guard.rs présent${NC}"
else
    echo -e "${RED}  ✗ ERREUR: tauri_v2_guard.rs manquant${NC}"
    ERRORS=$((ERRORS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# Test 6: Vérifier que les commandes async utilisent State<'_, ...>
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[TEST 6]${NC} Vérification signature commandes async..."

ASYNC_PATTERN_COUNT=0
for module in "${ASYNC_MODULES[@]}"; do
    if [ -f "$module" ]; then
        COUNT=$(grep -c "State<'_, " "$module" 2>/dev/null || echo "0")
        ASYNC_PATTERN_COUNT=$((ASYNC_PATTERN_COUNT + COUNT))
    fi
done

if [ "$ASYNC_PATTERN_COUNT" -gt 0 ]; then
    echo -e "${GREEN}  ✓ OK: $ASYNC_PATTERN_COUNT commandes async avec State<'_, ...> trouvées${NC}"
else
    echo -e "${YELLOW}  ⚠ WARNING: Aucune commande async trouvée${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# Test 7: Compilation Rust (optionnel si cargo disponible)
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[TEST 7]${NC} Test de compilation Rust (optionnel)..."

if command -v cargo &> /dev/null; then
    echo "  Lancement cargo check..."
    if cargo check --manifest-path src-tauri/Cargo.toml --quiet 2>&1 | grep -q "error"; then
        echo -e "${RED}  ✗ ERREUR: Erreurs de compilation détectées${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}  ✓ OK: Compilation réussie (ou warnings seulement)${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠ SKIP: cargo non disponible${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# Test 8: Vérifier structure App.tsx frontend
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[TEST 8]${NC} Vérification frontend App.tsx..."

if [ -f "src/App.tsx" ]; then
    if grep -q "BrowserRouter" "src/App.tsx" 2>/dev/null && \
       grep -q "AutoHealErrorBoundary" "src/App.tsx" 2>/dev/null; then
        echo -e "${GREEN}  ✓ OK: App.tsx structuré correctement${NC}"
    else
        echo -e "${YELLOW}  ⚠ WARNING: App.tsx pourrait nécessiter vérification${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}  ✗ ERREUR: src/App.tsx non trouvé${NC}"
    ERRORS=$((ERRORS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# RAPPORT FINAL
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  RAPPORT FINAL"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCÈS: Tous les tests critiques passés${NC}"
    echo ""
    echo "  TITANE∞ v17 est prêt pour production !"
    echo ""
else
    echo -e "${RED}❌ ÉCHEC: $ERRORS erreur(s) détectée(s)${NC}"
    echo ""
    echo "  Veuillez corriger les erreurs ci-dessus avant de continuer."
    echo ""
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
    echo ""
fi

echo "Statistiques:"
echo "  - Tests exécutés: 8"
echo "  - Erreurs: $ERRORS"
echo "  - Avertissements: $WARNINGS"
echo ""

# Exit code
if [ $ERRORS -eq 0 ]; then
    exit 0
else
    exit 1
fi
