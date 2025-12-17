#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║           🕐 VALIDATION FUSION TIME v25.1 🕐                              ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Compteur de tests
TESTS_PASSED=0
TESTS_TOTAL=0

# Fonction de test
test_item() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "❌ $2"
    fi
}

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃  📋 VÉRIFICATION FICHIERS                                              ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"

# Vérifier fichiers créés
test -f "src/pages/TimePage.tsx"
test_item $? "TimePage.tsx existe"

test -f "src/pages/TimePage.css"
test_item $? "TimePage.css existe"

# Vérifier fichiers modifiés
test -f "src/pages/index.ts"
test_item $? "src/pages/index.ts existe"

test -f "src/ui/Menu.tsx"
test_item $? "src/ui/Menu.tsx existe"

test -f "src/App.tsx"
test_item $? "src/App.tsx existe"

echo ""
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃  🔧 VÉRIFICATION INTÉGRATION                                           ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"

# Vérifier export dans index.ts
grep -q "export { TimePage } from './TimePage'" "src/pages/index.ts"
test_item $? "Export TimePage dans index.ts"

# Vérifier entrée menu TIME
grep -q "id: 'time'" "src/ui/Menu.tsx"
test_item $? "Section TIME dans Menu.tsx"

# Vérifier version cache
grep -q "v25.1-time-fusion" "src/ui/Menu.tsx"
test_item $? "Version cache v25.1-time-fusion"

# Vérifier route /time dans App.tsx
grep -q "path=\"/time\"" "src/App.tsx"
test_item $? "Route /time dans App.tsx"

# Vérifier import TimePage
grep -q "TimePage" "src/App.tsx"
test_item $? "Import TimePage dans App.tsx"

# Vérifier redirection /temporal-center
grep -q "/temporal-center.*Navigate to=\"/time\"" "src/App.tsx"
test_item $? "Redirection /temporal-center → /time"

# Vérifier redirection /agenda
grep -q "/agenda.*Navigate to=\"/time\"" "src/App.tsx"
test_item $? "Redirection /agenda → /time"

# Vérifier redirection /time-navigator
grep -q "/time-navigator.*Navigate to=\"/time\"" "src/App.tsx"
test_item $? "Redirection /time-navigator → /time"

# Vérifier sidebar TIME
grep -q "id: '/time'.*label: 'TIME'" "src/App.tsx"
test_item $? "Entrée TIME dans sidebar"

# Vérifier suppression ancien temporal-center de sidebar
! grep -q "id: '/temporal-center'" "src/App.tsx" || grep -q "Navigate to=\"/time\"" "src/App.tsx"
test_item $? "Ancien temporal-center retiré/redirigé sidebar"

echo ""
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃  📊 RÉSULTAT FINAL                                                     ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo ""
echo "   Tests réussis: $TESTS_PASSED/$TESTS_TOTAL"
echo ""

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo "   🎉 FUSION TIME COMPLÈTE ET VALIDÉE ! 🕐"
else
    echo "   ⚠️  Certains tests ont échoué"
fi

echo ""
