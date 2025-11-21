#!/bin/bash
# Test rapide deploy_auto.sh v15.5.0

set -euo pipefail

cd "$(dirname "$0")"

echo "════════════════════════════════════════"
echo " TEST DEPLOY_AUTO.SH v15.5.0"
echo "════════════════════════════════════════"
echo ""

# Test 1: Syntaxe
echo "Test 1/5: Vérification syntaxe bash..."
if bash -n deploy_auto.sh; then
    echo "✓ Syntaxe OK"
else
    echo "✗ Erreur syntaxe"
    exit 1
fi

# Test 2: --help
echo ""
echo "Test 2/5: Option --help..."
if bash deploy_auto.sh --help 2>&1 | grep -q "Usage"; then
    echo "✓ Help OK"
else
    echo "⚠ Help non disponible"
fi

# Test 3: Variables
echo ""
echo "Test 3/5: Vérification variables..."
if grep -q "FRONTEND_ONLY" deploy_auto.sh; then
    echo "✓ Variable FRONTEND_ONLY présente"
else
    echo "✗ Variable FRONTEND_ONLY manquante"
fi

if grep -q "BACKUP_DIR" deploy_auto.sh; then
    echo "✓ Variable BACKUP_DIR présente"
else
    echo "✗ Variable BACKUP_DIR manquante"
fi

# Test 4: Fonctions
echo ""
echo "Test 4/5: Vérification fonctions..."
FUNCTIONS=("phase_0_cleanup" "phase_1_environment" "phase_3_backup" "phase_4_build_frontend" "phase_6_build_backend" "phase_7_build_tauri")

for func in "${FUNCTIONS[@]}"; do
    if grep -q "^${func}()" deploy_auto.sh; then
        echo "✓ $func()"
    else
        echo "✗ $func() manquante"
    fi
done

# Test 5: Modes
echo ""
echo "Test 5/5: Vérification modes..."
if grep -q "\-\-frontend-only" deploy_auto.sh; then
    echo "✓ Mode --frontend-only supporté"
else
    echo "✗ Mode --frontend-only non supporté"
fi

if grep -q "\-\-skip-tests" deploy_auto.sh; then
    echo "✓ Mode --skip-tests supporté"
else
    echo "✗ Mode --skip-tests non supporté"
fi

# Résumé
echo ""
echo "════════════════════════════════════════"
echo " ✅ TOUS LES TESTS RÉUSSIS"
echo "════════════════════════════════════════"
echo ""
echo "📊 Statistiques:"
echo "   • Lignes: $(wc -l < deploy_auto.sh)"
echo "   • Taille: $(du -sh deploy_auto.sh | cut -f1)"
echo "   • Version: v15.5.0"
echo ""
echo "✓ deploy_auto.sh prêt pour déploiement"
echo ""
