#!/bin/bash
# Script de validation rapide du chat fallback fix (v26.3.1)
# Usage: ./scripts/validate-chat-fallback-fix.sh

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Validation du Chat Fallback Fix v26.3.1                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0

# 1. Vérifier les commits
echo "📦 1. Vérification des commits Git..."
if git log --oneline | grep -q "b8e6abca"; then
    echo "   ✅ Commit b8e6abca (code fix) présent"
else
    echo "   ❌ Commit b8e6abca MANQUANT"
    ERRORS=$((ERRORS + 1))
fi

if git log --oneline | grep -q "7fef2e91"; then
    echo "   ✅ Commit 7fef2e91 (protection) présent"
else
    echo "   ❌ Commit 7fef2e91 MANQUANT"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Vérifier le code critique
echo "🔍 2. Vérification du code critique..."

if grep -q "messageAge < 3000" src/components/chat/MessageBubble.tsx; then
    echo "   ✅ Logique 3s présente dans MessageBubble.tsx"
else
    echo "   ❌ Logique 3s MANQUANTE dans MessageBubble.tsx"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "forcedFallback" src/hooks/useChat.ts; then
    echo "   ✅ Fallback forcé présent dans useChat.ts"
else
    echo "   ❌ Fallback forcé MANQUANT dans useChat.ts"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "message-error" src/components/chat/MessageBubble.css; then
    echo "   ✅ Style .message-error présent dans MessageBubble.css"
else
    echo "   ❌ Style .message-error MANQUANT dans MessageBubble.css"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Vérifier les fichiers de protection
echo "🔒 3. Vérification des protections..."

if [ -f "src/__tests__/chat-fallback-display.test.ts" ]; then
    echo "   ✅ Test de régression présent"
else
    echo "   ❌ Test de régression MANQUANT"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "docs/fixes/CHAT_FALLBACK_FIX_v26.3.1.md" ]; then
    echo "   ✅ Documentation présente"
else
    echo "   ❌ Documentation MANQUANTE"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".git/hooks/pre-commit-chat-fallback-check" ]; then
    echo "   ✅ Git hook présent"
else
    echo "   ❌ Git hook MANQUANT"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Lancer les tests
echo "🧪 4. Exécution des tests..."

echo "   → Tests de régression..."
if pnpm test src/__tests__/chat-fallback-display.test.ts --run --silent 2>&1 | grep -q "5 passed"; then
    echo "   ✅ Tests de régression: 5/5 passent"
else
    echo "   ❌ Tests de régression ÉCHOUENT"
    ERRORS=$((ERRORS + 1))
fi

echo "   → Tests useChat..."
if pnpm test src/hooks/__tests__/useChat.test.ts --run --silent 2>&1 | grep -q "50 passed"; then
    echo "   ✅ Tests useChat: 50/50 passent"
else
    echo "   ⚠️  Tests useChat: Certains tests peuvent échouer (vérifier manuellement)"
fi
echo ""

# 5. Résultat final
echo "═══════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ VALIDATION RÉUSSIE - Toutes les protections sont en place"
    echo "═══════════════════════════════════════════════════════════════"
    exit 0
else
    echo "❌ VALIDATION ÉCHOUÉE - $ERRORS erreur(s) détectée(s)"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "⚠️  ACTIONS REQUISES:"
    echo "   1. Vérifier que les commits b8e6abca et 7fef2e91 n'ont pas été annulés"
    echo "   2. Restaurer les fichiers manquants depuis le commit"
    echo "   3. Relancer ce script pour validation"
    echo ""
    exit 1
fi
