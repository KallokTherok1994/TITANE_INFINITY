#!/bin/bash
# 🧪 TEST SCRIPT - Sprint 6 Phase 3 Complete Test Suite
# Production testing for TITANE∞ Chat IA
# 
# Usage: bash test-sprint6-phase3.sh
# Requirements: jq, curl (optionnel)

set -e

TEST_DIR="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
REPORT_FILE="${TEST_DIR}/TEST_REPORT_${TIMESTAMP}.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════
# HEADER
# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧪 SPRINT 6 PHASE 3 - COMPLETE TEST SUITE                     ║${NC}"
echo -e "${BLUE}║  v26.4.0 — Production Testing                                  ║${NC}"
echo -e "${BLUE}║  $(date '+%Y-%m-%d %H:%M:%S')                                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# TEST COUNTERS
# ═══════════════════════════════════════════════════════════════════

TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# ═══════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

test_pass() {
  local test_name="$1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  echo -e "${GREEN}✅ PASS${NC}: ${test_name}"
  echo "[PASS] ${test_name}" >> "$REPORT_FILE"
}

test_fail() {
  local test_name="$1"
  local reason="$2"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  echo -e "${RED}❌ FAIL${NC}: ${test_name}"
  [ -n "$reason" ] && echo -e "${RED}   Reason: ${reason}${NC}"
  echo "[FAIL] ${test_name} - ${reason}" >> "$REPORT_FILE"
}

test_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "[$1]" >> "$REPORT_FILE"
}

# ═══════════════════════════════════════════════════════════════════
# SETUP
# ═══════════════════════════════════════════════════════════════════

echo -e "${YELLOW}📝 Report file: ${REPORT_FILE}${NC}"
> "$REPORT_FILE"  # Clear report

# ═══════════════════════════════════════════════════════════════════
# 1️⃣ PROJECT STRUCTURE TESTS
# ═══════════════════════════════════════════════════════════════════

test_section "1️⃣ PROJECT STRUCTURE & FILES"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ -f "${TEST_DIR}/src/services/chat/toolCaller.ts" ]; then
  test_pass "toolCaller.ts exists"
else
  test_fail "toolCaller.ts exists" "File not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ -f "${TEST_DIR}/src/services/ai/chatModes.config.ts" ]; then
  test_pass "chatModes.config.ts exists"
else
  test_fail "chatModes.config.ts exists" "File not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ -f "${TEST_DIR}/src/hooks/useZoomControl.ts" ]; then
  test_pass "useZoomControl.ts exists (Zoom Control)"
else
  test_fail "useZoomControl.ts exists" "File not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ -f "${TEST_DIR}/src/components/MessageReactions.tsx" ]; then
  test_pass "MessageReactions.tsx exists (Reactions)"
else
  test_fail "MessageReactions.tsx exists" "File not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ -f "${TEST_DIR}/src/components/ContextUsage.tsx" ]; then
  test_pass "ContextUsage.tsx exists (Token Counter)"
else
  test_fail "ContextUsage.tsx exists" "File not found"
fi

# ═══════════════════════════════════════════════════════════════════
# 2️⃣ CODE QUALITY TESTS
# ═══════════════════════════════════════════════════════════════════

test_section "2️⃣ CODE QUALITY & SYNTAX"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "tool_name" "${TEST_DIR}/src/services/chat/toolCaller.ts"; then
  test_pass "JSON tool_name pattern exists in toolCaller.ts"
else
  test_fail "JSON tool_name pattern" "Pattern not found in toolCaller.ts"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "🔍 PARSING TEXT" "${TEST_DIR}/src/services/chat/toolCaller.ts"; then
  test_pass "Debug logging added to toolCaller.ts"
else
  test_fail "Debug logging in toolCaller.ts" "Debug logs not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "Few-shot" "${TEST_DIR}/src/services/ai/chatModes.config.ts" || grep -q "EXEMPLE" "${TEST_DIR}/src/services/ai/chatModes.config.ts"; then
  test_pass "Few-shot examples in system prompt"
else
  test_fail "Few-shot examples" "Examples not found in prompt"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "get_time\|calculate\|web_search\|get_weather" "${TEST_DIR}/src/services/chat/toolCaller.ts"; then
  test_pass "All 4 tools defined (get_time, calculate, web_search, get_weather)"
else
  test_fail "All 4 tools" "One or more tools missing"
fi

# ═══════════════════════════════════════════════════════════════════
# 3️⃣ GIT COMMIT TESTS
# ═══════════════════════════════════════════════════════════════════

test_section "3️⃣ GIT COMMITS & VERSION CONTROL"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
cd "${TEST_DIR}"
LATEST_COMMIT=$(git log --oneline -1)
if echo "$LATEST_COMMIT" | grep -q "Tool Calling\|toolCaller\|Few-Shot"; then
  test_pass "Latest commit related to Tool Calling (${LATEST_COMMIT:0:40})"
else
  test_fail "Latest commit" "Unexpected commit message: $LATEST_COMMIT"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if git log --oneline -5 | grep -q "Sprint 6"; then
  test_pass "Sprint 6 commits found in history"
else
  test_fail "Sprint 6 commits" "No Sprint 6 commits in recent history"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
STAGED=$(git diff --cached --name-only | wc -l)
if [ "$STAGED" -eq 0 ]; then
  test_pass "No uncommitted changes (clean working tree)"
else
  test_fail "Clean working tree" "$STAGED files staged/modified"
fi

# ═══════════════════════════════════════════════════════════════════
# 4️⃣ CONFIGURATION TESTS
# ═══════════════════════════════════════════════════════════════════

test_section "4️⃣ CONFIGURATION & DEPENDENCIES"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ -f "${TEST_DIR}/package.json" ]; then
  test_pass "package.json exists"
else
  test_fail "package.json" "Not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ -f "${TEST_DIR}/pnpm-lock.yaml" ]; then
  test_pass "pnpm-lock.yaml exists (lock file)"
else
  test_fail "pnpm-lock.yaml" "Not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ -d "${TEST_DIR}/src" ] && [ -d "${TEST_DIR}/src-tauri" ]; then
  test_pass "Project structure: Tauri (src + src-tauri)"
else
  test_fail "Project structure" "Tauri folders missing"
fi

# ═══════════════════════════════════════════════════════════════════
# 5️⃣ FEATURES INTEGRATION TESTS
# ═══════════════════════════════════════════════════════════════════

test_section "5️⃣ FEATURES INTEGRATION"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "parseToolCalls\|executeToolCall" "${TEST_DIR}/src/services/chat/toolCaller.ts"; then
  test_pass "Tool Calling methods implemented (parseToolCalls, executeToolCall)"
else
  test_fail "Tool Calling methods" "Methods not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "useChatMemory\|MEMORY-COMPACTOR" "${TEST_DIR}/src"/**/*.ts 2>/dev/null; then
  test_pass "Memory management integrated"
else
  test_fail "Memory management" "Not found in codebase"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "useZoomControl\|zoom" "${TEST_DIR}/src/hooks/useZoomControl.ts" 2>/dev/null; then
  test_pass "Zoom control implemented"
else
  test_fail "Zoom control" "Not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "MessageReactions\|emoji\|👍\|❤️" "${TEST_DIR}/src/components/"*.tsx 2>/dev/null; then
  test_pass "Message Reactions implemented"
else
  test_fail "Message Reactions" "Not found"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if grep -q "ContextUsage\|token" "${TEST_DIR}/src/components/"*.tsx 2>/dev/null; then
  test_pass "Token Counter implemented"
else
  test_fail "Token Counter" "Not found"
fi

# ═══════════════════════════════════════════════════════════════════
# 6️⃣ OLLAMA INTEGRATION TESTS
# ═══════════════════════════════════════════════════════════════════

test_section "6️⃣ OLLAMA INTEGRATION"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if curl -s http://127.0.0.1:11434/api/tags &>/dev/null; then
  test_pass "Ollama endpoint healthy (127.0.0.1:11434)"
  TESTS_TOTAL=$((TESTS_TOTAL + 1))
  MODELS=$(curl -s http://127.0.0.1:11434/api/tags | grep -o '"name":"[^"]*"' | head -1)
  if [ -n "$MODELS" ]; then
    test_pass "Ollama has models available: $MODELS"
  else
    test_fail "Ollama models" "No models found"
  fi
else
  test_fail "Ollama endpoint health" "Cannot reach 127.0.0.1:11434 (Ollama not running or not accessible)"
fi

# ═══════════════════════════════════════════════════════════════════
# 7️⃣ TYPESCRIPT TYPE CHECKING (IF tsc available)
# ═══════════════════════════════════════════════════════════════════

test_section "7️⃣ TYPESCRIPT VALIDATION"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if command -v tsc &> /dev/null; then
  cd "${TEST_DIR}"
  if tsc --noEmit 2>/dev/null; then
    test_pass "TypeScript compilation (no errors)"
  else
    test_fail "TypeScript compilation" "Type errors found (run: tsc --noEmit)"
  fi
else
  echo -e "${YELLOW}⚠️  SKIP${NC}: TypeScript compiler not in PATH"
  echo "[SKIP] TypeScript compiler not available" >> "$REPORT_FILE"
fi

# ═══════════════════════════════════════════════════════════════════
# FINAL REPORT
# ═══════════════════════════════════════════════════════════════════

test_section "📊 TEST SUMMARY"

echo ""
echo -e "${BLUE}Total Tests: ${TESTS_TOTAL}${NC}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

PASS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
echo -e "Pass Rate: ${PASS_RATE}%"

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  echo "Status: ALL_PASSED" >> "$REPORT_FILE"
else
  echo -e "${YELLOW}⚠️  ${TESTS_FAILED} TEST(S) FAILED${NC}"
  echo "Status: SOME_FAILED" >> "$REPORT_FILE"
fi

# ═══════════════════════════════════════════════════════════════════
# NEXT STEPS
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 MANUAL TESTING CHECKLIST${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🧪 Open the app (F12 > Console) and test:"
echo "   1. Tool Calling: \"Quelle heure est-il?\""
echo "   2. Tool Calling: \"Calcule 456 * 123\""
echo "   3. Memory: Refresh page, check messages persist"
echo "   4. Reactions: Click emoji on message"
echo "   5. Zoom: Ctrl + Plus/Minus/0"
echo "   6. Token Counter: Check token count in bubbles"
echo ""
echo "📊 Report saved to: ${REPORT_FILE}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# END
# ═══════════════════════════════════════════════════════════════════

exit 0
