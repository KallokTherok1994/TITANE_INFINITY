#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# TITANE∞ v∞ - TEST APIS OPENAI & ANTHROPIC
# Script de validation des APIs cloud
# ═══════════════════════════════════════════════════════════════

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  TITANE∞ — Test APIs OpenAI & Anthropic                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Gestionnaire de paquets: pnpm-only (corepack préféré)
PNPM=()
resolve_pnpm_cmd() {
    if command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1; then
        PNPM=(corepack pnpm)
        return 0
    fi
    if command -v pnpm >/dev/null 2>&1; then
        PNPM=(pnpm)
        return 0
    fi
    return 1
}

# Fonction de test
test_step() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    local name="$1"
    local expected="$2"

    echo -e "${BLUE}[TEST ${TESTS_TOTAL}]${NC} $name"

    if [ -n "$expected" ]; then
        if grep -q "$expected" <<< "$3"; then
            echo -e "  ${GREEN}✓ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "  ${RED}✗ FAIL${NC} (expected: $expected)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "  ${YELLOW}⚠ SKIP${NC} (manuel check required)"
    fi
    echo ""
}

echo "════════════════════════════════════════════════════════════"
echo "1. VÉRIFICATION CODE SOURCE"
echo "════════════════════════════════════════════════════════════"
echo ""

# Test 1: Vérifier présence chargement OpenAI dans main.rs
test_step "Chargement OpenAI dans main.rs" \
    "openai_api_key" \
    "$(grep -A 5 'Load OpenAI API key' src-tauri/src/main.rs)"

# Test 2: Vérifier présence chargement Anthropic dans main.rs
test_step "Chargement Anthropic dans main.rs" \
    "anthropic_api_key" \
    "$(grep -A 5 'Load Anthropic API key' src-tauri/src/main.rs)"

# Test 3: Vérifier log final avec 5 providers
test_step "Log final avec 5 providers" \
    "Gemini + OpenAI + Anthropic + Ollama + Local ready" \
    "$(grep 'ChatOrchestrator v16:' src-tauri/src/main.rs)"

# Test 4: Vérifier commandes Tauri exposées
test_step "Commandes Tauri chat_set_openai_key" \
    "chat_set_openai_key" \
    "$(grep 'chat_set_openai_key' src-tauri/src/main.rs)"

test_step "Commandes Tauri chat_set_anthropic_key" \
    "chat_set_anthropic_key" \
    "$(grep 'chat_set_anthropic_key' src-tauri/src/main.rs)"

test_step "Commandes Tauri get_openai_key_status" \
    "get_openai_key_status" \
    "$(grep 'get_openai_key_status' src-tauri/src/main.rs)"

test_step "Commandes Tauri get_anthropic_key_status" \
    "get_anthropic_key_status" \
    "$(grep 'get_anthropic_key_status' src-tauri/src/main.rs)"

echo "════════════════════════════════════════════════════════════"
echo "2. VÉRIFICATION FONCTIONS HANDLER"
echo "════════════════════════════════════════════════════════════"
echo ""

# Test 5: Vérifier fonction send_to_openai
test_step "Fonction send_to_openai" \
    "async fn send_to_openai" \
    "$(grep -A 2 'async fn send_to_openai' src-tauri/src/overdrive/chat_orchestrator.rs)"

# Test 6: Vérifier fonction send_to_anthropic
test_step "Fonction send_to_anthropic" \
    "async fn send_to_anthropic" \
    "$(grep -A 2 'async fn send_to_anthropic' src-tauri/src/overdrive/chat_orchestrator.rs)"

# Test 7: Vérifier URL OpenAI
test_step "URL API OpenAI" \
    "https://api.openai.com/v1/chat/completions" \
    "$(grep 'api.openai.com' src-tauri/src/overdrive/chat_orchestrator.rs)"

# Test 8: Vérifier URL Anthropic
test_step "URL API Anthropic" \
    "https://api.anthropic.com/v1/messages" \
    "$(grep 'api.anthropic.com' src-tauri/src/overdrive/chat_orchestrator.rs)"

echo "════════════════════════════════════════════════════════════"
echo "3. VÉRIFICATION FRONTEND"
echo "════════════════════════════════════════════════════════════"
echo ""

# Test 9: Vérifier service OpenAI
test_step "Service setOpenAIKey" \
    "setOpenAIKey" \
    "$(grep 'setOpenAIKey' src/features/governance-center/services/governanceService.ts)"

test_step "Service getOpenAIStatus" \
    "getOpenAIStatus" \
    "$(grep 'getOpenAIStatus' src/features/governance-center/services/governanceService.ts)"

# Test 10: Vérifier service Anthropic
test_step "Service setAnthropicKey" \
    "setAnthropicKey" \
    "$(grep 'setAnthropicKey' src/features/governance-center/services/governanceService.ts)"

test_step "Service getAnthropicStatus" \
    "getAnthropicStatus" \
    "$(grep 'getAnthropicStatus' src/features/governance-center/services/governanceService.ts)"

# Test 11: Vérifier SecretsTab OpenAI
test_step "SecretsTab props openaiStatus" \
    "openaiStatus" \
    "$(grep 'openaiStatus' src/features/governance-center/tabs/SecretsTab.tsx | head -1)"

# Test 12: Vérifier SecretsTab Anthropic
test_step "SecretsTab props anthropicStatus" \
    "anthropicStatus" \
    "$(grep 'anthropicStatus' src/features/governance-center/tabs/SecretsTab.tsx | head -1)"

echo "════════════════════════════════════════════════════════════"
echo "4. COMPILATION"
echo "════════════════════════════════════════════════════════════"
echo ""

# Test 13: Compilation Rust
echo -e "${BLUE}[TEST]${NC} Compilation Rust (cargo check)..."
cd src-tauri
if cargo check --quiet 2>&1 | grep -q "Finished"; then
    echo -e "  ${GREEN}✓ PASS${NC} (compilation OK)"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "  ${RED}✗ FAIL${NC} (erreurs de compilation)"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
cd ..
echo ""

# Test 14: Vérification TypeScript
echo -e "${BLUE}[TEST]${NC} Vérification TypeScript (tsc --noEmit)..."
if ! resolve_pnpm_cmd; then
    echo -e "  ${YELLOW}⚠ SKIP${NC} (pnpm non détecté)"
elif "${PNPM[@]}" exec tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
    echo -e "  ${RED}✗ FAIL${NC} (erreurs TypeScript détectées)"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    TESTS_FAILED=$((TESTS_FAILED + 1))
else
    echo -e "  ${GREEN}✓ PASS${NC} (pas d'erreurs TypeScript)"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
echo ""

echo "════════════════════════════════════════════════════════════"
echo "RÉSUMÉ"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Total tests: $TESTS_TOTAL"
echo -e "Réussis:     ${GREEN}$TESTS_PASSED${NC}"
echo -e "Échoués:     ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES TESTS PASSÉS !${NC}"
    echo ""
    echo "Les APIs OpenAI et Anthropic sont correctement configurées."
    echo ""
    echo "Prochaines étapes:"
    echo "  1. Lancer TITANE∞: pnpm run tauri:dev"
    echo "  2. Ouvrir Centre Gouvernance → Secrets"
    echo "  3. Configurer clés API OpenAI et Anthropic"
    echo "  4. Tester Chat OMEGA avec providers 'openai' et 'anthropic'"
    echo ""
    exit 0
else
    echo -e "${RED}❌ CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo ""
    echo "Vérifiez les erreurs ci-dessus et corrigez-les."
    echo ""
    exit 1
fi
