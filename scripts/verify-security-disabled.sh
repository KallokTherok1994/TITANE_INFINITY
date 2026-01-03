#!/bin/bash
# TITANE∞ - Vérification des Restrictions de Sécurité
# Script de validation pour confirmer que les restrictions sont désactivées

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🔍 TITANE∞ - Vérification des Restrictions de Sécurité"
echo "========================================================"
echo ""

ERRORS=0
WARNINGS=0

# Vérifier shouldBlockLoading retourne false
echo "1. Vérification de shouldBlockLoading()..."
if grep -q "return false;" src/core/tauri/environment.ts; then
    echo "   ✅ shouldBlockLoading() retourne false"
else
    echo "   ❌ ERREUR: shouldBlockLoading() ne retourne pas false"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Vérifier absence de blocages dans App.tsx
echo "2. Vérification des blocages dans App.tsx..."
if ! grep -q "if (shouldBlockLoading())" src/App.tsx; then
    echo "   ✅ Aucun blocage conditionnel dans App.tsx"
else
    echo "   ⚠️  WARNING: Blocage conditionnel trouvé dans App.tsx"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Vérifier activation des services en mode navigateur
echo "3. Vérification de l'activation des services..."
if grep -q "titane_ollama_enabled.*'1'" src/utils/browserModeAdapter.ts && \
   grep -q "titane_restrictions_disabled.*'1'" src/utils/browserModeAdapter.ts; then
    echo "   ✅ Services activés en mode navigateur"
else
    echo "   ❌ ERREUR: Services désactivés en mode navigateur"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Vérifier commentaires de désactivation
echo "4. Vérification des annotations de désactivation..."
if grep -q "RESTRICTIONS DÉSACTIVÉES\|MODE OUVERT" src/core/tauri/environment.ts src/App.tsx src/utils/browserModeAdapter.ts; then
    echo "   ✅ Annotations de désactivation présentes"
else
    echo "   ⚠️  WARNING: Annotations manquantes"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Résumé
echo "========================================================"
echo "RÉSUMÉ"
echo "========================================================"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ SUCCÈS: Toutes les restrictions sont désactivées"
    echo ""
    echo "Configuration actuelle:"
    echo "  • shouldBlockLoading: Toujours false"
    echo "  • Mode navigateur: Tous services activés"
    echo "  • Restrictions: Désactivées"
    echo "  • Sécurité: Mode ouvert"
    echo ""
    echo "🚀 L'application peut fonctionner sans blocages"
else
    echo "❌ ERREURS: $ERRORS problème(s) détecté(s)"
    echo ""
    echo "Actions requises:"
    echo "  1. Vérifier les fichiers modifiés"
    echo "  2. Appliquer les corrections nécessaires"
    echo "  3. Relancer ce script de vérification"
fi

if [ $WARNINGS -gt 0 ]; then
    echo ""
    echo "⚠️  AVERTISSEMENTS: $WARNINGS point(s) d'attention"
fi

echo ""
exit $ERRORS
