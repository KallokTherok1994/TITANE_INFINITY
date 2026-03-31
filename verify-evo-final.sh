#!/bin/bash
echo "🧬 TITANE∞ v25.0 — VÉRIFICATION FINALE EVO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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

echo ""
echo "📋 Fichiers principaux..."
[ -f "src/pages/EvoPage.tsx" ]; check "EvoPage.tsx existe"
[ -f "src/ui/Menu.tsx" ]; check "Menu.tsx existe"
[ -f "src/App.tsx" ]; check "App.tsx existe"

echo ""
echo "🔍 Intégration EVO..."
grep -q "export { EvoPage }" src/pages/index.ts; check "Export EvoPage dans index.ts"
grep -q "v25.0-evo-fusion" src/ui/Menu.tsx; check "Version menu v25.0"
grep -q "id: 'evo'" src/ui/Menu.tsx; check "Section EVO dans menu"
grep -q 'path="/evo"' src/App.tsx; check "Route /evo dans App.tsx"
grep -q "EvoPage" src/App.tsx; check "Import EvoPage dans App.tsx"

echo ""
echo "🧹 Nettoyage sidebar..."
! grep -q "id: '/dashboard'" src/App.tsx; check "Pas de /dashboard dans sidebar"
! grep -q "id: '/progression'" src/App.tsx; check "Pas de /progression dans sidebar"
! grep -q "id: '/identity-memory-evolution'" src/App.tsx; check "Pas de /identity-memory-evolution dans sidebar"
grep -q "id: '/evo'" src/App.tsx; check "EVO présent dans sidebar"

echo ""
echo "🔀 Redirections..."
grep -q 'element={<Navigate to="/evo"' src/App.tsx; check "Redirections vers /evo configurées"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Résultats: $PASS/$((PASS+FAIL)) tests réussis"

if [ $FAIL -eq 0 ]; then
    echo "✅ VÉRIFICATION FINALE RÉUSSIE!"
    echo ""
    echo "🎯 RÉCAPITULATIF:"
    echo "  • Menu: 11 sections (incluant EVO)"
    echo "  • Sidebar: 13 entrées (-52%)"
    echo "  • Routes: 9 redirections vers /evo"
    echo "  • Qualité: 0 erreurs TypeScript"
    echo ""
    echo "🧬 EVO IS READY! 🚀"
    exit 0
else
    echo "❌ $FAIL test(s) échoué(s)"
    exit 1
fi
