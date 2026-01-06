#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v16.2.2 — VALIDATION COMPLÈTE CHAT IA + TTS
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "═════════════════════════════════════════════════════════════════════════"
echo "🧪 VALIDATION COMPLÈTE TITANE∞ v16.2.2"
echo "═════════════════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0

# Fonction test
test_check() {
    local test_name="$1"
    local test_command="$2"

    echo -n "🔍 $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "📦 VÉRIFICATION DÉPENDANCES"
echo "─────────────────────────────────────────────────────────────────────────"

test_check "Node.js installé" "which node"
test_check "pnpm installé" "command -v pnpm >/dev/null 2>&1 || (command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1)"
test_check "Rust/Cargo installé" "which cargo"
test_check "Ollama installé" "which ollama"
test_check "espeak-ng installé" "which espeak-ng"

echo ""
echo "🔧 VÉRIFICATION CONFIGURATION"
echo "─────────────────────────────────────────────────────────────────────────"

test_check "Fichier .env existe" "test -f .env"
test_check "GEMINI_API_KEY configurée" "grep -q 'GEMINI_API_KEY=' .env"
test_check "package.json existe" "test -f package.json"
test_check "Cargo.toml existe" "test -f src-tauri/Cargo.toml"

echo ""
echo "🚀 VÉRIFICATION SERVICES"
echo "─────────────────────────────────────────────────────────────────────────"

# Ollama server
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "🔍 Ollama server actif... ${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))

    # Vérifier modèles
    MODELS=$(ollama list 2>/dev/null | grep -c 'llama' || echo "0")
    if [ "$MODELS" -gt 0 ]; then
        echo -e "🔍 Modèles Ollama disponibles ($MODELS)... ${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "🔍 Modèles Ollama disponibles... ${YELLOW}⚠️  WARN (aucun)${NC}"
    fi
else
    echo -e "🔍 Ollama server actif... ${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
    echo "   → Lancer: ollama serve"
fi

# Vérifier app Tauri en cours
if pgrep -f 'titane-infinity' > /dev/null; then
    echo -e "🔍 App Tauri lancée... ${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "🔍 App Tauri lancée... ${YELLOW}⚠️  WARN (non lancée)${NC}"
    echo "   → Lancer: pnpm run tauri:dev"
fi

# TAURI-ONLY: pas de serveur HTTP frontend
echo -e "🔍 Frontend HTTP... ${YELLOW}⚠️  SKIP (TAURI-ONLY)${NC}"

echo ""
echo "🎯 VÉRIFICATION FICHIERS CLÉS"
echo "─────────────────────────────────────────────────────────────────────────"

test_check "Backend chat_orchestrator.rs" "test -f src-tauri/src/overdrive/chat_orchestrator.rs"
test_check "Frontend Chat.tsx" "test -f src/ui/pages/Chat.tsx"
test_check "Hook useChat.ts" "test -f src/hooks/useChat.ts"
test_check "Service tauriClient.ts" "test -f src/services/tauriClient.ts"
test_check "ChatDiagnostic.tsx" "test -f src/components/ChatDiagnostic.tsx"
test_check "Tests e2e" "test -f src/__tests__/e2e-automated-validation.test.ts"

echo ""
echo "📝 VÉRIFICATION CODE (SAMPLING)"
echo "─────────────────────────────────────────────────────────────────────────"

# Vérifier commande enregistrée main.rs
if grep -q 'chat_send_message' src-tauri/src/main.rs; then
    echo -e "🔍 Command chat_send_message (main.rs)... ${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "🔍 Command chat_send_message (main.rs)... ${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

# Vérifier heartbeat Ollama amélioré
if grep -q 'localhost:11434/api/tags' src-tauri/src/overdrive/chat_orchestrator.rs; then
    echo -e "🔍 Heartbeat Ollama amélioré... ${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "🔍 Heartbeat Ollama amélioré... ${YELLOW}⚠️  WARN (ancien code)${NC}"
fi

# Vérifier ChatDiagnostic importé App.tsx
if grep -q 'ChatDiagnostic' src/App.tsx; then
    echo -e "🔍 ChatDiagnostic dans App.tsx... ${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "🔍 ChatDiagnostic dans App.tsx... ${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "🔊 TEST TTS (espeak-ng)"
echo "─────────────────────────────────────────────────────────────────────────"

if espeak-ng "Test validation TITANE" -v fr --stdout > /dev/null 2>&1; then
    echo -e "🔍 espeak-ng TTS fonctionnel... ${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "🔍 espeak-ng TTS fonctionnel... ${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "═════════════════════════════════════════════════════════════════════════"
echo "📊 RÉSULTATS"
echo "═════════════════════════════════════════════════════════════════════════"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
PERCENT=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo -e "Tests réussis: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests échoués: ${RED}$TESTS_FAILED${NC}"
echo -e "Total: $TOTAL_TESTS"
echo -e "Taux de réussite: ${GREEN}${PERCENT}%${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TOUTES LES VÉRIFICATIONS PASSENT !${NC}"
    echo ""
    echo "🎯 PROCHAINES ÉTAPES:"
    echo "  1. Ouvrir Titan-Dev (fenêtre Tauri)"
    echo "  2. Cliquer bouton 'Lancer Diagnostic' (overlay haut droite)"
    echo "  3. Tester Chat UI /chat avec message réel"
    echo "  4. Tester voice mode TTS (bouton 🎤)"
    echo ""
    exit 0
else
    echo -e "${RED}❌ CERTAINES VÉRIFICATIONS ONT ÉCHOUÉ${NC}"
    echo ""
    echo "🔧 ACTIONS CORRECTIVES:"
    echo "  - Installer dépendances manquantes"
    echo "  - Lancer services requis (Ollama, app Tauri)"
    echo "  - Vérifier configuration .env"
    echo ""
    exit 1
fi
