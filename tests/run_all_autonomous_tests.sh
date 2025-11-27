#!/bin/bash
# TITANE∞ v24.30 - Run All Tests Suite

echo "═══════════════════════════════════════════════════════════════════"
echo "TITANE∞ v24.30 - COMPREHENSIVE TEST SUITE"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test_suite() {
    local suite_name=$1
    local test_path=$2

    echo -e "${YELLOW}Running: ${suite_name}${NC}"

    if npm test -- "$test_path" 2>&1 | tee /tmp/test_output.log; then
        PASSED=$(grep -c "PASS" /tmp/test_output.log || echo "0")
        FAILED=$(grep -c "FAIL" /tmp/test_output.log || echo "0")

        PASSED_TESTS=$((PASSED_TESTS + PASSED))
        FAILED_TESTS=$((FAILED_TESTS + FAILED))
        TOTAL_TESTS=$((TOTAL_TESTS + PASSED + FAILED))

        echo -e "${GREEN}✓ ${suite_name} completed${NC}"
    else
        echo -e "${RED}✗ ${suite_name} failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
    fi

    echo ""
}

echo "Starting test execution..."
echo ""

# Phase 1: Autonomy Tests
run_test_suite "Phase 1: SingularityAutonomyEngine" "tests/unit/autonomy/SingularityAutonomyEngine.test.ts"

# Phase 2: Cognitive Tests
run_test_suite "Phase 2: CognitiveOptimizationEngine" "tests/unit/cognitive/CognitiveOptimizationEngine.test.ts"

# Phase 4: Fusion Tests
run_test_suite "Phase 4: SingularityFusionEngine" "tests/unit/fusion/SingularityFusionEngine.test.ts"

# Phase 5: Real-Time Tests
run_test_suite "Phase 5: RealTimeExecutionEngine" "tests/unit/realtime/RealTimeExecutionEngine.test.ts"

# Phase 6: Context Tests
run_test_suite "Phase 6: LongContextOptimizer" "tests/unit/context/LongContextOptimizer.test.ts"

# Integration Tests
run_test_suite "Integration: Full Pipeline" "tests/integration/full-pipeline.test.ts"

# Summary
echo "═══════════════════════════════════════════════════════════════════"
echo "TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════════"
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"

if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
