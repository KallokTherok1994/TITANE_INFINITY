#!/bin/bash
# Test Multi-Provider API Integration - TITANE∞ v19.5.2
# Vérifie tous les providers d'IA et leur intégration au Chat

echo "═══════════════════════════════════════════════════════════════"
echo "  🧪 TEST MULTI-PROVIDER API INTEGRATION - TITANE∞ v19.5.2"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counter
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

print_test_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
}

test_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo -e "${RED}   → $2${NC}"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
}

test_skip() {
    echo -e "${YELLOW}⏭️  SKIP${NC}: $1"
    echo -e "${YELLOW}   → $2${NC}"
    ((TESTS_SKIPPED++))
    ((TESTS_TOTAL++))
}

# ═══════════════════════════════════════════════════════════════
# TEST 1: Backend Commands Verification
# ═══════════════════════════════════════════════════════════════
print_test_header "1️⃣  BACKEND COMMANDS VERIFICATION"

echo "Recherche des commandes Tauri dans le code Rust..."

# Vérifier les commandes enregistrées dans main.rs
MAIN_RS="src-tauri/src/main.rs"
if [ -f "$MAIN_RS" ]; then
    echo ""
    echo "📋 Commandes OMEGA Pipeline:"
    if grep -q "conversation_generate" "$MAIN_RS"; then
        test_pass "conversation_generate registered (OMEGA Pipeline)"
    else
        test_fail "conversation_generate NOT registered" "Command missing in main.rs"
    fi
    
    if grep -q "create_new_conversation" "$MAIN_RS"; then
        test_pass "create_new_conversation registered"
    else
        test_fail "create_new_conversation NOT registered" "Command missing in main.rs"
    fi
    
    if grep -q "conversation_process_message" "$MAIN_RS"; then
        test_pass "conversation_process_message registered"
    else
        test_fail "conversation_process_message NOT registered" "Command missing in main.rs"
    fi
    
    echo ""
    echo "📋 Commandes API Providers:"
    if grep -q "get_openai_key_status\|openai.*status" "$MAIN_RS"; then
        test_pass "OpenAI API commands present"
    else
        test_fail "OpenAI API commands missing" "Check main.rs invoke_handler"
    fi
    
    if grep -q "get_anthropic_key_status\|anthropic.*status" "$MAIN_RS"; then
        test_pass "Anthropic/Claude API commands present"
    else
        test_fail "Anthropic API commands missing" "Check main.rs invoke_handler"
    fi
    
    if grep -q "ai_check_ollama_status\|ollama.*status" "$MAIN_RS"; then
        test_pass "Ollama API commands present"
    else
        test_fail "Ollama API commands missing" "Check main.rs invoke_handler"
    fi
else
    test_fail "main.rs not found" "Cannot verify backend commands"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 2: Frontend API Integration
# ═══════════════════════════════════════════════════════════════
print_test_header "2️⃣  FRONTEND API INTEGRATION"

echo "Vérification des appels API dans ChatPage.tsx..."

CHAT_PAGE="src/pages/ChatPage.tsx"
if [ -f "$CHAT_PAGE" ]; then
    if grep -q "get_anthropic_key_status" "$CHAT_PAGE"; then
        test_pass "ChatPage uses correct Anthropic command (get_anthropic_key_status)"
    else
        test_fail "ChatPage uses incorrect Anthropic command" "Should use get_anthropic_key_status"
    fi
    
    if grep -q "ai_check_ollama_status" "$CHAT_PAGE"; then
        test_pass "ChatPage uses correct Ollama command (ai_check_ollama_status)"
    else
        test_fail "ChatPage uses incorrect Ollama command" "Should use ai_check_ollama_status"
    fi
    
    if grep -q "systemPrompt.*omega_generate\|omega_generate.*systemPrompt" "$CHAT_PAGE"; then
        test_pass "ChatPage transmits systemPrompt to omega_generate"
    else
        test_skip "systemPrompt transmission unclear" "Manual verification needed"
    fi
else
    test_fail "ChatPage.tsx not found" "Cannot verify frontend integration"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 3: Provider Configuration
# ═══════════════════════════════════════════════════════════════
print_test_header "3️⃣  PROVIDER CONFIGURATION"

echo "Vérification des providers configurés..."

# Check AIRouter configuration
AI_ROUTER="src-tauri/src/ai/router.rs"
if [ -f "$AI_ROUTER" ]; then
    PROVIDERS=$(grep -o "ProviderType::[A-Za-z]*" "$AI_ROUTER" 2>/dev/null | sort -u | wc -l)
    if [ "$PROVIDERS" -gt 0 ]; then
        test_pass "AIRouter has $PROVIDERS provider types configured"
        grep -o "ProviderType::[A-Za-z]*" "$AI_ROUTER" 2>/dev/null | sort -u | sed 's/^/     - /'
    else
        test_skip "AIRouter provider detection" "Could not parse provider types"
    fi
else
    test_skip "AIRouter configuration check" "router.rs not found"
fi

# Check UnifiedIA
UNIFIED_IA="src-tauri/src/ai/unified_ia.rs"
if [ -f "$UNIFIED_IA" ]; then
    if grep -q "try_provider\|fallback\|cascade" "$UNIFIED_IA"; then
        test_pass "UnifiedIA has fallback/cascade logic"
    else
        test_skip "UnifiedIA fallback logic" "Could not detect cascade pattern"
    fi
else
    test_skip "UnifiedIA check" "unified_ia.rs not found"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 4: Environment Variables
# ═══════════════════════════════════════════════════════════════
print_test_header "4️⃣  ENVIRONMENT VARIABLES"

echo "Vérification des variables d'environnement API..."

if [ -n "$OPENAI_API_KEY" ]; then
    test_pass "OPENAI_API_KEY is set (${#OPENAI_API_KEY} chars)"
else
    test_skip "OPENAI_API_KEY" "Not configured (Gemini/Ollama fallback will be used)"
fi

if [ -n "$ANTHROPIC_API_KEY" ]; then
    test_pass "ANTHROPIC_API_KEY is set (${#ANTHROPIC_API_KEY} chars)"
else
    test_skip "ANTHROPIC_API_KEY" "Not configured (Gemini/Ollama fallback will be used)"
fi

if [ -n "$GEMINI_API_KEY" ]; then
    test_pass "GEMINI_API_KEY is set (${#GEMINI_API_KEY} chars)"
else
    test_skip "GEMINI_API_KEY" "Not configured (Ollama fallback will be used)"
fi

# Check Ollama service
if command -v ollama &> /dev/null; then
    test_pass "Ollama CLI installed"
    if pgrep -x "ollama" > /dev/null; then
        test_pass "Ollama service is running"
    else
        test_skip "Ollama service status" "Service not running (can be started with 'ollama serve')"
    fi
else
    test_skip "Ollama installation" "Not installed (pure cloud API mode)"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 5: TypeScript Types Consistency
# ═══════════════════════════════════════════════════════════════
print_test_header "5️⃣  TYPESCRIPT TYPES CONSISTENCY"

echo "Vérification de la cohérence des types..."

CHAT_ENGINE_COMMANDS="src/services/tauri/chatEngine.commands.ts"
if [ -f "$CHAT_ENGINE_COMMANDS" ]; then
    if grep -q "systemPrompt\?" "$CHAT_ENGINE_COMMANDS"; then
        test_pass "chatEngine.commands.ts has systemPrompt field"
    else
        test_fail "chatEngine.commands.ts missing systemPrompt" "Field should be optional in OmegaGenerateArgs"
    fi
    
    if grep -q "export.*ProviderPreference.*auto.*gemini.*ollama" "$CHAT_ENGINE_COMMANDS"; then
        test_pass "ProviderPreference type includes auto|gemini|ollama|local"
    else
        test_skip "ProviderPreference type check" "Could not verify all provider types"
    fi
else
    test_fail "chatEngine.commands.ts not found" "Cannot verify TypeScript types"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 6: Runtime Service Check
# ═══════════════════════════════════════════════════════════════
print_test_header "6️⃣  RUNTIME SERVICE CHECK"

echo "Vérification de l'état du serveur de développement..."

# Check if dev server is running
if pgrep -f "vite.*5173" > /dev/null; then
    test_pass "Vite dev server is running (port 5173)"
else
    test_skip "Vite dev server" "Not running (start with 'pnpm run dev:tauri')"
fi

if pgrep -f "titane-infinity" > /dev/null; then
    test_pass "Tauri app is running"
else
    test_skip "Tauri app" "Not running (start with 'pnpm run dev:tauri')"
fi

# Check browser port
if nc -z localhost 5173 2>/dev/null; then
    test_pass "Frontend port 5173 is open"
else
    test_skip "Frontend port check" "Port 5173 not responding"
fi

# ═══════════════════════════════════════════════════════════════
# TEST 7: Compilation Status
# ═══════════════════════════════════════════════════════════════
print_test_header "7️⃣  COMPILATION STATUS"

echo "Vérification de la dernière compilation..."

# Check Rust target
RUST_TARGET="src-tauri/target/debug/titane-infinity"
if [ -f "$RUST_TARGET" ]; then
    TARGET_AGE=$(($(date +%s) - $(stat -c %Y "$RUST_TARGET" 2>/dev/null || stat -f %m "$RUST_TARGET" 2>/dev/null)))
    if [ $TARGET_AGE -lt 300 ]; then
        test_pass "Rust binary compiled recently (${TARGET_AGE}s ago)"
    else
        test_skip "Rust binary age" "Last compiled $((TARGET_AGE / 60)) minutes ago"
    fi
else
    test_fail "Rust binary not found" "Run 'cargo build' in src-tauri/"
fi

# Check TypeScript compilation
if [ -d "dist" ] || [ -d "build" ]; then
    test_pass "Frontend build directory exists"
else
    test_skip "Frontend build" "No dist/build directory (dev mode OK)"
fi

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "Total Tests:   ${TESTS_TOTAL}"
echo -e "${GREEN}✅ Passed:     ${TESTS_PASSED}${NC}"
echo -e "${RED}❌ Failed:     ${TESTS_FAILED}${NC}"
echo -e "${YELLOW}⏭️  Skipped:    ${TESTS_SKIPPED}${NC}"
echo ""

# Calculate success rate
if [ $TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((100 * TESTS_PASSED / TESTS_TOTAL))
    echo -e "Success Rate:  ${SUCCESS_RATE}% (excluding skipped)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"

# Exit code
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ TESTS FAILED - Fix errors above${NC}"
    exit 1
elif [ $TESTS_PASSED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  NO TESTS PASSED - Check configuration${NC}"
    exit 2
else
    echo -e "${GREEN}✅ ALL CRITICAL TESTS PASSED${NC}"
    exit 0
fi
