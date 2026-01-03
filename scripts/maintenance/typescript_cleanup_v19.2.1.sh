#!/bin/bash

# 🔧 TITANE∞ TypeScript Cleanup Script v19.2.1
# Correction automatique des erreurs de compilation TypeScript

echo "🔥 TITANE∞ - Nettoyage TypeScript Critique v19.2.1"
echo "=================================================="

# Configuration
PROJECT_ROOT="/home/titane/Documents/TITANE_INFINITY"
BACKUP_DIR="${PROJECT_ROOT}/backup_before_cleanup_$(date +%Y%m%d_%H%M%S)"

# Créer un backup de sécurité
echo "📦 Création du backup de sécurité..."
mkdir -p "$BACKUP_DIR"

# Liste des fichiers problématiques
PROBLEM_FILES=(
    "src/hooks/archived/useChatOmnisSimple.ts"
    "src/services/ai/providers/omnis/hardenedProviders_OMNIS_v1.ts"
    "src/services/ai/orchestrator_OMNIS_v1.ts"
    "src/services/ai/providers/omnis/providerWrapper_OMNIS_v1.ts"
)

# Backup des fichiers problématiques
echo "💾 Backup des fichiers critiques..."
for file in "${PROBLEM_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        cp "$PROJECT_ROOT/$file" "$BACKUP_DIR/$(basename "$file").backup"
        echo "   ✓ Backup: $file"
    fi
done

cd "$PROJECT_ROOT"

echo ""
echo "🧹 Phase 1: Correction des caractères d'échappement..."

# Fonction de correction des caractères d'échappement
fix_escape_characters() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "   🔧 Correction: $file"

        # Remplacer les \n échappés par de vrais retours à la ligne
        sed -i 's/\\n/\n/g' "$file"

        # Nettoyer les autres caractères d'échappement problématiques
        sed -i 's/\\t/\t/g' "$file"
        sed -i 's/\\r//g' "$file"

        # Vérifier et corriger la syntaxe basique
        # Supprimer les lignes vides multiples
        sed -i '/^$/N;/^\n$/d' "$file"

        echo "   ✓ Corrigé: $file"
    else
        echo "   ⚠️  Fichier non trouvé: $file"
    fi
}

# Appliquer les corrections
for file in "${PROBLEM_FILES[@]}"; do
    fix_escape_characters "$file"
done

echo ""
echo "🔍 Phase 2: Vérification de la syntaxe..."

# Test de compilation TypeScript
echo "   📝 Vérification TypeScript..."
if pnpm run type-check > /tmp/typecheck_result.log 2>&1; then
    echo "   ✅ Compilation TypeScript réussie !"
    TYPECHECK_SUCCESS=true
else
    echo "   ⚠️  Erreurs TypeScript détectées"
    echo "      Voir les détails ci-dessous:"
    tail -20 /tmp/typecheck_result.log
    TYPECHECK_SUCCESS=false
fi

echo ""
echo "🧪 Phase 3: Validation des tests..."

# Tests Chat IA
echo "   🧪 Tests Chat IA..."
if pnpm test -- chat-ia-diagnostic.test.ts > /tmp/test_result.log 2>&1; then
    echo "   ✅ Tests Chat IA: OK"
    TEST_SUCCESS=true
else
    echo "   ❌ Tests Chat IA: ÉCHEC"
    tail -10 /tmp/test_result.log
    TEST_SUCCESS=false
fi

echo ""
echo "📊 RÉSULTATS DU NETTOYAGE"
echo "========================="
echo "🔧 Fichiers traités: ${#PROBLEM_FILES[@]}"
echo "📦 Backup créé: $BACKUP_DIR"

if [ "$TYPECHECK_SUCCESS" = true ] && [ "$TEST_SUCCESS" = true ]; then
    echo "✅ SUCCÈS TOTAL - Système entièrement opérationnel"
    echo ""
    echo "🎯 Actions accomplies:"
    echo "   ✓ Caractères d'échappement corrigés"
    echo "   ✓ Compilation TypeScript propre"
    echo "   ✓ Tests Chat IA validés"
    echo ""
    echo "🚀 TITANE∞ v19.2.1 - PRÊT POUR LA PRODUCTION"
else
    echo "⚠️  NETTOYAGE PARTIEL"
    echo ""
    if [ "$TYPECHECK_SUCCESS" = false ]; then
        echo "❌ Compilation TypeScript: Erreurs persistantes"
    fi
    if [ "$TEST_SUCCESS" = false ]; then
        echo "❌ Tests Chat IA: Échec détecté"
    fi
    echo ""
    echo "🔧 Backup disponible pour restauration: $BACKUP_DIR"
fi

echo ""
echo "📝 Pour plus de détails:"
echo "   - TypeCheck: cat /tmp/typecheck_result.log"
echo "   - Tests: cat /tmp/test_result.log"
echo "   - Backup: ls -la $BACKUP_DIR"
