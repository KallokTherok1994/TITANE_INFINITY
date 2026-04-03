#!/bin/bash
echo "🧬 TITANE∞ v25.0 — EVO MODULE VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo "✓ $1"
        ((PASS++))
    else
        echo "✗ $1"
        ((FAIL++))
    fi
}

echo "📁 Vérification fichiers..."
[ -f "src/pages/EvoPage.tsx" ]; check "EvoPage.tsx créé"
[ -f "FUSION_EVO_v25.0_COMPLETE.md" ]; check "Documentation créée"

echo ""
echo "🔍 Vérification contenu..."
grep -q "EvoPage" src/pages/index.ts; check "Export EvoPage"
grep -q "EVO" src/ui/Menu.tsx; check "Entrée menu EVO"
grep -q "/evo" src/App.tsx; check "Route /evo"

echo ""
echo "📊 Résultats: $PASS/$((PASS+FAIL)) tests réussis"
[ $FAIL -eq 0 ] && echo "✅ TOUS LES TESTS PASSÉS!" || echo "❌ $FAIL test(s) échoué(s)"
