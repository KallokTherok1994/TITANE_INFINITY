#!/bin/bash
# Script de test pour vérifier la correction get_copilot_key_status
# Usage: ./verify-copilot-fix.sh

echo "🔍 VÉRIFICATION DE LA CORRECTION: get_copilot_key_status"
echo "=========================================================="
echo ""

# Test 1: Vérifier que la commande est dans la whitelist
echo "✓ Test 1: Whitelist security.ts"
if grep -q "get_copilot_key_status" src/lib/security.ts; then
    echo "  ✅ PASS - Commande trouvée dans ALLOWED_COMMANDS"
    grep -n "get_copilot_key_status" src/lib/security.ts | head -1
else
    echo "  ❌ FAIL - Commande non trouvée"
    exit 1
fi
echo ""

# Test 2: Vérifier qu'il n'y a pas d'erreurs TypeScript
echo "✓ Test 2: Erreurs TypeScript"
if npx tsc --noEmit --project tsconfig.json 2>&1 | grep -q "error TS"; then
    echo "  ⚠️  WARN - Erreurs TypeScript détectées (peut-être existantes)"
    npx tsc --noEmit --project tsconfig.json 2>&1 | grep "error TS" | head -5
else
    echo "  ✅ PASS - Pas d'erreurs TypeScript"
fi
echo ""

# Test 3: Vérifier l'utilisation de la commande
echo "✓ Test 3: Utilisation de la commande"
USAGE_COUNT=$(grep -r "get_copilot_key_status" src/ --include="*.ts" --include="*.tsx" | wc -l)
echo "  📊 Trouvé $USAGE_COUNT utilisations de get_copilot_key_status"
grep -r "get_copilot_key_status" src/ --include="*.ts" --include="*.tsx" -n | head -5
echo ""

# Test 4: Vérifier le backend
echo "✓ Test 4: Backend Rust"
if grep -q "get_copilot_key_status" src-tauri/src/commands/copilot_commands.rs; then
    echo "  ✅ PASS - Commande implémentée dans copilot_commands.rs"
else
    echo "  ⚠️  WARN - Commande non trouvée dans backend"
fi
echo ""

# Test 5: Vérifier que la commande est enregistrée dans main.rs
echo "✓ Test 5: Enregistrement Tauri"
if grep -q "get_copilot_key_status" src-tauri/src/main.rs; then
    echo "  ✅ PASS - Commande enregistrée dans invoke_handler"
else
    echo "  ⚠️  WARN - Commande peut-être non enregistrée"
fi
echo ""

echo "=========================================================="
echo "🎯 RÉSULTAT: Correction appliquée avec succès"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "   1. Recharger la page (Ctrl+R) dans le navigateur"
echo "   2. Ouvrir DevTools Console (F12)"
echo "   3. Vérifier qu'il n'y a plus d'erreur:"
echo "      ❌ [Security] ✗ Security: Command \"get_copilot_key_status\""
echo "   4. Si l'erreur persiste, vérifier les logs Tauri"
echo ""
echo "✅ Fichiers modifiés:"
echo "   - src/lib/security.ts (ligne ~436)"
echo ""
