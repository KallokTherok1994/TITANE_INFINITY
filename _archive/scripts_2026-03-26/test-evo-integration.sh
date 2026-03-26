#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v25.0 — EVO MODULE - TEST DE VALIDATION
# Vérifie que la fusion EVO est correctement intégrée
# ═══════════════════════════════════════════════════════════════════════════

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║     🧬 TITANE∞ v25.0 — EVO MODULE VALIDATION                     ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Function to test
test_file() {
    local file=$1
    local desc=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $desc"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $desc"
        ((FAIL++))
    fi
}

test_content() {
    local file=$1
    local pattern=$2
    local desc=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $desc"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $desc"
        ((FAIL++))
    fi
}

echo "🔍 Vérification des fichiers créés/modifiés..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test fichiers créés
test_file "src/pages/EvoPage.tsx" "Fichier EvoPage.tsx créé"
test_file "FUSION_EVO_v25.0_COMPLETE.md" "Documentation fusion EVO créée"

echo ""
echo "🔍 Vérification du contenu des fichiers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test exports
test_content "src/pages/index.ts" "EvoPage" "Export EvoPage dans index.ts"

# Test Menu
test_content "src/ui/Menu.tsx" "EVO" "Entrée EVO dans le menu"
test_content "src/ui/Menu.tsx" "Centre d'Évolution Totale" "Description EVO dans le menu"
test_content "src/ui/Menu.tsx" "/evo" "Route /evo dans le menu"

# Test Routes
test_content "src/App.tsx" "EvoPage" "Import EvoPage dans App.tsx"
test_content "src/App.tsx" 'path="/evo"' "Route /evo dans App.tsx"
test_content "src/App.tsx" 'Navigate to="/evo"' "Redirections vers /evo dans App.tsx"

# Test composant EVO
test_content "src/pages/EvoPage.tsx" "Vue d'Ensemble" "Section Vue d'Ensemble"
test_content "src/pages/EvoPage.tsx" "Identité & ADN" "Section Identité"
test_content "src/pages/EvoPage.tsx" "Mémoire Triple" "Section Mémoire"
test_content "src/pages/EvoPage.tsx" "Évolution Mémoire" "Section Évolution Mémoire"
test_content "src/pages/EvoPage.tsx" "Progression & XP" "Section Progression"
test_content "src/pages/EvoPage.tsx" "Transformation" "Section Transformation"

echo ""
echo "🔍 Vérification des redirections..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test redirections
test_content "src/App.tsx" 'path="/" element={<Navigate to="/evo"' "Redirection / vers /evo"
test_content "src/App.tsx" 'path="/dashboard"' "Redirection /dashboard vers /evo"
test_content "src/App.tsx" 'path="/evolution-center"' "Redirection /evolution-center vers /evo"
test_content "src/App.tsx" 'path="/identity-memory-evolution"' "Redirection /identity-memory-evolution vers /evo"
test_content "src/App.tsx" 'path="/progression"' "Redirection /progression vers /evo"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
TOTAL=$((PASS + FAIL))
PERCENT=$((PASS * 100 / TOTAL))

echo "📊 RÉSULTATS:"
echo "   Total tests: $TOTAL"
echo -e "   Réussis:     ${GREEN}$PASS${NC}"
if [ $FAIL -gt 0 ]; then
    echo -e "   Échoués:     ${RED}$FAIL${NC}"
else
    echo -e "   Échoués:     $FAIL"
fi
echo "   Taux succès: $PERCENT%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES TESTS SONT PASSÉS!${NC}"
    echo ""
    echo "🚀 Le module EVO est correctement intégré et prêt à l'emploi!"
    echo ""
    echo "Pour tester l'application:"
    echo "  pnpm run dev        # Lancer en mode développement"
    echo "  pnpm run build      # Build production"
    echo ""
    exit 0
else
    echo -e "${RED}❌ CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo ""
    echo "Veuillez vérifier les erreurs ci-dessus."
    echo ""
    exit 1
fi
