#!/bin/bash
# Script de test en conditions réelles du chat fallback fix v26.3.1
# Usage: ./scripts/test-chat-fallback-live.sh

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Test en Conditions Réelles - Chat Fallback Fix v26.3.1      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

LOG_FILE="/tmp/titane-chat-test-$(date +%s).log"
PASSED=0
FAILED=0

echo "📝 Fichier de log: $LOG_FILE"
echo ""

# Test 1: Vérifier que l'application tourne
echo "🧪 Test 1: Vérification de l'application en cours..."
if pgrep -f "titane-infinity" > /dev/null; then
    echo -e "   ${GREEN}✅ PASS${NC}: Application Tauri en cours d'exécution"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}❌ FAIL${NC}: Application Tauri non démarrée"
    echo "   → Lancer d'abord: pnpm run dev:tauri"
    FAILED=$((FAILED + 1))
fi

# Test 2: Vérifier que Vite répond
echo "🧪 Test 2: Vérification du serveur Vite..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173 | grep -q "200"; then
    echo -e "   ${GREEN}✅ PASS${NC}: Vite répond sur port 5173"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${YELLOW}⚠️  WARN${NC}: Vite ne répond pas (peut être sur un autre port)"
fi

# Test 3: Vérifier les corrections dans le code source
echo "🧪 Test 3: Vérification du code source corrigé..."

if grep -q "messageAge < 3000" src/components/chat/MessageBubble.tsx; then
    echo -e "   ${GREEN}✅ PASS${NC}: Logique des 3s présente"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}❌ FAIL${NC}: Logique des 3s MANQUANTE"
    FAILED=$((FAILED + 1))
fi

if grep -q "forcedFallback" src/hooks/useChat.ts; then
    echo -e "   ${GREEN}✅ PASS${NC}: Fallback forcé présent"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}❌ FAIL${NC}: Fallback forcé MANQUANT"
    FAILED=$((FAILED + 1))
fi

if grep -q "message-error" src/components/chat/MessageBubble.css; then
    echo -e "   ${GREEN}✅ PASS${NC}: Style .message-error présent"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}❌ FAIL${NC}: Style .message-error MANQUANT"
    FAILED=$((FAILED + 1))
fi

# Test 4: Surveillance des logs en temps réel (30s)
echo ""
echo "🧪 Test 4: Surveillance des logs Tauri (30 secondes)..."
echo "   ${YELLOW}ℹ️  Envoie maintenant un message dans le chat IA${NC}"
echo ""

# Créer un moniteur de logs
MONITOR_PID=""
if [ -t 0 ]; then
    # Mode interactif
    timeout 30 journalctl -f --since "30 seconds ago" 2>/dev/null | grep -i --line-buffered -E "(AI Router|useChat|fallback|provider)" > "$LOG_FILE" &
    MONITOR_PID=$!
    
    # Attendre
    sleep 30
    
    # Arrêter le moniteur
    if [ -n "$MONITOR_PID" ]; then
        kill $MONITOR_PID 2>/dev/null || true
    fi
fi

# Analyser les logs capturés
echo ""
echo "📊 Analyse des logs capturés..."

if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ]; then
    echo ""
    echo "Logs pertinents trouvés:"
    head -20 "$LOG_FILE"
    
    if grep -q "No provider available" "$LOG_FILE"; then
        echo -e "   ${GREEN}✅ INFO${NC}: Cascade de fallback détectée (attendu)"
    fi
    
    if grep -q "Fallback response created" "$LOG_FILE"; then
        echo -e "   ${GREEN}✅ PASS${NC}: Fallback response créée (correction active)"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "   ${YELLOW}⚠️  INFO${NC}: Aucune activité chat détectée (normal si aucun message envoyé)"
fi

# Test 5: Vérifier qu'Ollama n'est pas disponible (pour tester le fallback)
echo ""
echo "🧪 Test 5: Vérification de la disponibilité des providers..."

if curl -s http://localhost:11434/api/tags 2>/dev/null | grep -q "models"; then
    echo -e "   ${YELLOW}ℹ️  INFO${NC}: Ollama disponible (fallback ne sera pas testé)"
else
    echo -e "   ${GREEN}✅ INFO${NC}: Ollama non disponible (conditions idéales pour tester le fallback)"
fi

# Résumé final
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ DES TESTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "   ${GREEN}✅ Tests réussis: $PASSED${NC}"
echo -e "   ${RED}❌ Tests échoués: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCÈS: Toutes les vérifications sont OK${NC}"
    echo ""
    echo "📝 Pour tester manuellement:"
    echo "   1. Envoie un message dans le chat IA"
    echo "   2. Vérifie que tu vois un message de fallback"
    echo "   3. La bulle ne doit PAS rester vide > 3s"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ÉCHEC: $FAILED vérification(s) échouée(s)${NC}"
    echo ""
    echo "⚠️  Exécuter: ./scripts/validate-chat-fallback-fix.sh"
    echo ""
    exit 1
fi
