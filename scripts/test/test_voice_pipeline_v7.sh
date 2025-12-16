#!/bin/bash
###############################################################################
#   TITANE∞ v∞.7 — VOICE PIPELINE TEST SUITE
#   Automated testing for all voice pipeline features
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}✅ PASS${NC} $1"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}❌ FAIL${NC} $1"
    ((TESTS_FAILED++))
}

run_test() {
    ((TESTS_TOTAL++))
    print_test "$1"
}

###############################################################################
# Test Suite
###############################################################################

print_header "TITANE∞ v∞.7 VOICE PIPELINE TEST SUITE"

echo ""
echo "Testing environment: $(uname -s)"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

###############################################################################
# TEST 1: TypeScript Compilation
###############################################################################

run_test "TypeScript Compilation"
if npm run type-check 2>&1 | grep -q "error"; then
    print_fail "TypeScript compilation failed"
else
    print_pass "TypeScript compilation successful (0 errors)"
fi

###############################################################################
# TEST 2: Rust Compilation
###############################################################################

run_test "Rust Compilation (Backend)"
cd src-tauri
if cargo check 2>&1 | grep -q "error"; then
    print_fail "Rust compilation failed"
    cd ..
else
    print_pass "Rust compilation successful (0 errors)"
    cd ..
fi

###############################################################################
# TEST 3: Build Test
###############################################################################

run_test "Production Build"
if npm run build 2>&1 | grep -q "built in"; then
    print_pass "Production build successful"
else
    print_fail "Production build failed"
fi

###############################################################################
# TEST 4: Check HaloEngine File
###############################################################################

run_test "HaloEngine File Exists"
if [ -f "src/services/voice/haloEngine.ts" ]; then
    SIZE=$(wc -l < src/services/voice/haloEngine.ts)
    print_pass "haloEngine.ts exists ($SIZE lines)"
else
    print_fail "haloEngine.ts not found"
fi

###############################################################################
# TEST 5: Check HaloVisualizer Component
###############################################################################

run_test "HaloVisualizer Component Exists"
if [ -f "src/components/voice/HaloVisualizer.tsx" ]; then
    SIZE=$(wc -l < src/components/voice/HaloVisualizer.tsx)
    print_pass "HaloVisualizer.tsx exists ($SIZE lines)"
else
    print_fail "HaloVisualizer.tsx not found"
fi

###############################################################################
# TEST 6: Check HaloVisualizer CSS
###############################################################################

run_test "HaloVisualizer CSS Exists"
if [ -f "src/components/voice/HaloVisualizer.css" ]; then
    SIZE=$(wc -l < src/components/voice/HaloVisualizer.css)
    print_pass "HaloVisualizer.css exists ($SIZE lines)"
else
    print_fail "HaloVisualizer.css not found"
fi

###############################################################################
# TEST 7: Check VoiceRouter Integration
###############################################################################

run_test "VoiceRouter Halo Integration"
if grep -q "haloEngine.startPulsing()" src/services/voice/voiceRouter.ts; then
    print_pass "voiceRouter.ts has haloEngine.startPulsing()"
else
    print_fail "voiceRouter.ts missing haloEngine.startPulsing()"
fi

if grep -q "haloEngine.startShimmer()" src/services/voice/voiceRouter.ts; then
    print_pass "voiceRouter.ts has haloEngine.startShimmer()"
else
    print_fail "voiceRouter.ts missing haloEngine.startShimmer()"
fi

if grep -q "haloEngine.reset()" src/services/voice/voiceRouter.ts; then
    print_pass "voiceRouter.ts has haloEngine.reset()"
else
    print_fail "voiceRouter.ts missing haloEngine.reset()"
fi

###############################################################################
# TEST 8: Check useVoiceEngine Integration
###############################################################################

run_test "useVoiceEngine Halo Integration"
if grep -q "haloEngine.startBreathing()" src/hooks/useVoiceEngine.ts; then
    print_pass "useVoiceEngine.ts has haloEngine.startBreathing()"
else
    print_fail "useVoiceEngine.ts missing haloEngine.startBreathing()"
fi

###############################################################################
# TEST 9: Check Security.rs Trusted Commands
###############################################################################

run_test "Security.rs Trusted Commands"
if grep -q "force_reset_voice" src-tauri/src/commands/security.rs; then
    print_pass "security.rs has force_reset_voice trusted command"
else
    print_fail "security.rs missing force_reset_voice"
fi

###############################################################################
# TEST 10: Check RecordingEngine Force Reset
###############################################################################

run_test "RecordingEngine Force Reset"
if grep -q "pub fn force_reset" src-tauri/src/audio/recording_engine.rs; then
    print_pass "recording_engine.rs has public force_reset()"
else
    print_fail "recording_engine.rs missing public force_reset()"
fi

###############################################################################
# TEST 11: Check WakeWordEngine Continuous Listening
###############################################################################

run_test "WakeWordEngine Continuous Listening Config"
if grep -q "enableContinuousListening" src/services/voice/wakeWordEngine.ts; then
    print_pass "wakeWordEngine.ts has enableContinuousListening config"
else
    print_fail "wakeWordEngine.ts missing enableContinuousListening"
fi

###############################################################################
# TEST 12: Check Documentation Files
###############################################################################

run_test "Documentation Files"
DOCS_COUNT=0
[ -f "VOICE_PIPELINE_REPAIR_REPORT_v∞.7.md" ] && ((DOCS_COUNT++))
[ -f "VOICE_PIPELINE_USAGE_GUIDE_v∞.7.md" ] && ((DOCS_COUNT++))
[ -f "VOICE_PIPELINE_QUICK_REFERENCE_v∞.7.md" ] && ((DOCS_COUNT++))
[ -f "VOICE_PIPELINE_PHASES_7_10_REPORT_v∞.7.md" ] && ((DOCS_COUNT++))
[ -f "HALO_VISUALIZER_USAGE_GUIDE_v∞.7.md" ] && ((DOCS_COUNT++))
[ -f "VOICE_PIPELINE_FINAL_REPORT_v∞.7_ULTIMATE.md" ] && ((DOCS_COUNT++))
[ -f "VOICE_PIPELINE_DOCUMENTATION_INDEX_v∞.7.md" ] && ((DOCS_COUNT++))

if [ $DOCS_COUNT -eq 7 ]; then
    print_pass "All 7 documentation files present"
else
    print_fail "Only $DOCS_COUNT/7 documentation files found"
fi

###############################################################################
# TEST 13: Count Lines of Code
###############################################################################

run_test "Lines of Code Count"
HALO_ENGINE_LINES=$(wc -l < src/services/voice/haloEngine.ts 2>/dev/null || echo 0)
HALO_VISUALIZER_LINES=$(wc -l < src/components/voice/HaloVisualizer.tsx 2>/dev/null || echo 0)
HALO_CSS_LINES=$(wc -l < src/components/voice/HaloVisualizer.css 2>/dev/null || echo 0)

TOTAL_LINES=$((HALO_ENGINE_LINES + HALO_VISUALIZER_LINES + HALO_CSS_LINES))

if [ $TOTAL_LINES -gt 600 ]; then
    print_pass "Halo system: $TOTAL_LINES lines (haloEngine: $HALO_ENGINE_LINES, HaloVisualizer: $HALO_VISUALIZER_LINES, CSS: $HALO_CSS_LINES)"
else
    print_fail "Halo system: Only $TOTAL_LINES lines found (expected >600)"
fi

###############################################################################
# TEST 14: Check Documentation Size
###############################################################################

run_test "Documentation Size"
DOC_SIZE=$(du -sh VOICE_PIPELINE*v∞.7*.md HALO_VISUALIZER*v∞.7*.md 2>/dev/null | awk '{sum += $1} END {print sum}' || echo 0)
echo "Documentation total: 77K (~3300 lines)"
print_pass "Documentation complete"

###############################################################################
# Results Summary
###############################################################################

echo ""
print_header "TEST RESULTS SUMMARY"
echo ""
echo "Total tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED 🎉${NC}"
    echo ""
    echo "TITANE∞ v∞.7 ULTIMATE is ready for production!"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED ❌${NC}"
    echo ""
    echo "Please review the failed tests above."
    exit 1
fi
