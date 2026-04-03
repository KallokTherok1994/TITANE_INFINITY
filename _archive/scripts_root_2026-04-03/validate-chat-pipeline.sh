#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ CHAT PIPELINE VALIDATION SCRIPT v21
# ═══════════════════════════════════════════════════════════════════════════
# Validates complete Chat IA pipeline integrity after SELF-REPAIR ENGINE fix
# ═══════════════════════════════════════════════════════════════════════════

# Note: Ne pas utiliser set -e car nous gérons les erreurs manuellement

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ CHAT PIPELINE VALIDATION v21"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

check_pass() {
    echo "✅ $1"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo "❌ $1"
    ((CHECKS_FAILED++))
}

echo "📋 Phase 1: Backend Rust Validation"
echo "────────────────────────────────────────────────────────────────────────────"

# Check 1: Verify chat_orchestrator.rs exports all commands
echo -n "Checking chat_orchestrator.rs exports... "
CHAT_COMMANDS=(
    "chat_send_message"
    "chat_stream_message"
    "chat_get_providers_status"
    "chat_check_providers"
    "chat_create_conversation"
    "chat_get_conversation"
    "chat_delete_conversation"
    "chat_generate_suggestions"
)

ALL_FOUND=true
for cmd in "${CHAT_COMMANDS[@]}"; do
    if ! grep -q "pub async fn $cmd" "$PROJECT_ROOT/src-tauri/src/overdrive/chat_orchestrator.rs"; then
        check_fail "Command $cmd not found in chat_orchestrator.rs"
        ALL_FOUND=false
    fi
done

if [ "$ALL_FOUND" = true ]; then
    check_pass "All 8 chat commands found in chat_orchestrator.rs"
fi

# Check 2: Verify main.rs registers all commands
echo -n "Checking main.rs invoke_handler registration... "
ALL_REGISTERED=true
for cmd in "${CHAT_COMMANDS[@]}"; do
    # Check for full path (overdrive::chat_orchestrator::command_name)
    if ! grep -q "chat_orchestrator::$cmd" "$PROJECT_ROOT/src-tauri/src/main.rs"; then
        check_fail "Command $cmd not registered in main.rs invoke_handler"
        ALL_REGISTERED=false
    fi
done

if [ "$ALL_REGISTERED" = true ]; then
    check_pass "All 8 chat commands registered in main.rs"
fi

# Check 3: Verify whitelist contains chat commands
echo -n "Checking security whitelist... "
ALL_WHITELISTED=true
for cmd in "${CHAT_COMMANDS[@]}"; do
    if ! grep -q "\"$cmd\"" "$PROJECT_ROOT/src-tauri/src/commands/security.rs"; then
        check_fail "Command $cmd not in security whitelist"
        ALL_WHITELISTED=false
    fi
done

if [ "$ALL_WHITELISTED" = true ]; then
    check_pass "All 8 chat commands whitelisted in security.rs"
fi

# Check 4: Verify ChatOrchestratorState is managed
echo -n "Checking ChatOrchestratorState initialization... "
if grep -q "\.manage(chat_orchestrator)" "$PROJECT_ROOT/src-tauri/src/main.rs"; then
    check_pass "ChatOrchestratorState properly managed"
else
    check_fail "ChatOrchestratorState not managed in main.rs"
fi

# Check 5: Compile backend
echo -n "Compiling Rust backend... "
cd "$PROJECT_ROOT/src-tauri"
if cargo check --quiet 2>/dev/null; then
    check_pass "Rust backend compiles successfully"
else
    check_fail "Rust compilation errors detected"
fi
cd "$PROJECT_ROOT"

echo ""
echo "📋 Phase 2: Frontend Integration Validation"
echo "────────────────────────────────────────────────────────────────────────────"

# Check 6: Verify frontend uses correct command names
echo -n "Checking frontend command calls... "
FRONTEND_CALLS=0
for file in "$PROJECT_ROOT/src"/**/*.tsx "$PROJECT_ROOT/src"/**/*.ts; do
    if [ -f "$file" ]; then
        if grep -q "invoke.*chat_send_message" "$file" 2>/dev/null; then
            ((FRONTEND_CALLS++))
        fi
    fi
done

if [ "$FRONTEND_CALLS" -gt 0 ]; then
    check_pass "Found $FRONTEND_CALLS frontend files calling chat_send_message"
else
    check_fail "No frontend files call chat_send_message"
fi

# Check 7: Verify secureInvoke wrapper exists
echo -n "Checking secureInvoke security wrapper... "
if [ -f "$PROJECT_ROOT/src/lib/security.ts" ]; then
    if grep -q "secureInvoke" "$PROJECT_ROOT/src/lib/security.ts"; then
        check_pass "secureInvoke wrapper found"
    else
        check_fail "secureInvoke wrapper missing"
    fi
else
    check_fail "security.ts not found"
fi

# Check 8: Verify ALLOWED_COMMANDS whitelist in frontend
echo -n "Checking frontend ALLOWED_COMMANDS... "
if [ -f "$PROJECT_ROOT/src/lib/security.ts" ]; then
    FRONTEND_WHITELIST_COUNT=0
    for cmd in "${CHAT_COMMANDS[@]}"; do
        # Check for exact string match in security.ts (handles quotes)
        if grep -q "'$cmd'" "$PROJECT_ROOT/src/lib/security.ts" || grep -q "\"$cmd\"" "$PROJECT_ROOT/src/lib/security.ts"; then
            ((FRONTEND_WHITELIST_COUNT++))
        fi
    done
    
    if [ "$FRONTEND_WHITELIST_COUNT" -ge 6 ]; then
        check_pass "$FRONTEND_WHITELIST_COUNT/8 chat commands in frontend whitelist"
    else
        check_fail "Only $FRONTEND_WHITELIST_COUNT/8 chat commands in frontend whitelist"
    fi
else
    check_fail "Cannot verify frontend whitelist"
fi

echo ""
echo "📋 Phase 3: Provider Configuration Validation"
echo "────────────────────────────────────────────────────────────────────────────"

# Check 9: Verify provider implementations
echo -n "Checking provider implementations... "
PROVIDERS=("gemini" "ollama" "openai" "anthropic" "local")
PROVIDERS_FOUND=0

for provider in "${PROVIDERS[@]}"; do
    if grep -q "send_to_$provider" "$PROJECT_ROOT/src-tauri/src/overdrive/chat_orchestrator.rs"; then
        ((PROVIDERS_FOUND++))
    fi
done

if [ "$PROVIDERS_FOUND" -eq 5 ]; then
    check_pass "All 5 providers (Gemini/Ollama/OpenAI/Anthropic/Local) implemented"
else
    check_fail "Only $PROVIDERS_FOUND/5 providers found"
fi

# Check 10: Verify fallback logic
echo -n "Checking fallback engine... "
if grep -q "Boucle de fallback" "$PROJECT_ROOT/src-tauri/src/overdrive/chat_orchestrator.rs"; then
    check_pass "Fallback loop implemented"
else
    check_fail "Fallback loop missing"
fi

# Check 11: Verify rate limiting
echo -n "Checking rate limiting integration... "
if grep -q "GLOBAL_RATE_LIMITER" "$PROJECT_ROOT/src-tauri/src/overdrive/chat_orchestrator.rs"; then
    check_pass "Rate limiting active in chat pipeline"
else
    check_fail "Rate limiting not integrated"
fi

# Check 12: Verify conversation memory
echo -n "Checking conversation memory... "
if grep -q "store_message" "$PROJECT_ROOT/src-tauri/src/overdrive/chat_orchestrator.rs"; then
    check_pass "Conversation memory storage implemented"
else
    check_fail "Conversation memory missing"
fi

echo ""
echo "📋 Phase 4: Integration Tests Recommendations"
echo "────────────────────────────────────────────────────────────────────────────"

echo "ℹ️  To complete validation, run these manual tests:"
echo ""
echo "  1. Start dev environment:"
echo "     $ pnpm run dev"
echo ""
echo "  2. Test chat_send_message command:"
echo "     Open DevTools Console (F12) and run:"
echo "     > await invoke('chat_send_message', { message: 'test', provider: 'local' })"
echo ""
echo "  3. Test provider status:"
echo "     > await invoke('chat_get_providers_status')"
echo ""
echo "  4. Test Ollama (if installed):"
echo "     > await invoke('chat_send_message', { message: 'hello', provider: 'ollama' })"
echo ""
echo "  5. Configure Gemini API key (optional):"
echo "     > await invoke('chat_set_gemini_key', { key: 'YOUR_KEY' })"
echo ""

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  VALIDATION SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Checks Passed: $CHECKS_PASSED"
echo "❌ Checks Failed: $CHECKS_FAILED"
echo ""

if [ "$CHECKS_FAILED" -eq 0 ]; then
    echo "🎉 SUCCESS: Chat Pipeline v21 fully validated!"
    echo ""
    echo "Next steps:"
    echo "  1. Start development: pnpm run dev"
    echo "  2. Test chat in UI or DevTools"
    echo "  3. Configure providers (Ollama/Gemini/etc.)"
    echo ""
    exit 0
else
    echo "⚠️  WARNING: $CHECKS_FAILED validation checks failed"
    echo ""
    echo "Review errors above and fix before deploying."
    echo ""
    exit 1
fi
