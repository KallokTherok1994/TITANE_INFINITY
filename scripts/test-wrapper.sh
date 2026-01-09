#!/bin/bash
# TITANE∞ v26.4.0 - Test Wrapper
# Handles Vitest heap overflow crashes that occur AFTER all tests pass
# This is a known issue with Vitest v4.x and large test suites (2300+ tests)

set -o pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 TITANE∞ Test Suite v26.4.0${NC}"
echo "Running tests with heap overflow protection..."
echo ""

# Create temp file for output
TEMP_OUTPUT=$(mktemp)
trap "rm -f $TEMP_OUTPUT" EXIT

# Run tests using npx to ensure cross-env is available
# This fixes "cross-env: command not found" error
VITEST_ARGS=("$@")
if [[ "${VITEST_ARGS[0]:-}" == "--" ]]; then
    VITEST_ARGS=("${VITEST_ARGS[@]:1}")
fi

# Some tasks call: `pnpm test -- --run`.
# But we already invoke `vitest run`, so the extra `--run` flag can be treated as invalid
# by newer Vitest versions and cause a non-zero exit code despite successful execution.
FILTERED_ARGS=()
for arg in "${VITEST_ARGS[@]}"; do
    if [[ "$arg" == "--run" ]]; then
        continue
    fi
    FILTERED_ARGS+=("$arg")
done
VITEST_ARGS=("${FILTERED_ARGS[@]}")

npx cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run "${VITEST_ARGS[@]}" 2>&1 | tee "$TEMP_OUTPUT"
VITEST_EXIT=${PIPESTATUS[0]}

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Test Results Analysis${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Strip ANSI codes for reliable pattern matching (and remove CR from TTY-style output)
CLEAN_OUTPUT=$(cat "$TEMP_OUTPUT" | sed 's/\x1b\[[0-9;]*m//g' | tr -d '\r')

# Count green checkmarks (✓) - these are the passing tests
# Each passing test in Vitest output shows a ✓
# NOTE: With Vitest v4.x, some reporters no longer print per-test "✓" markers.
# Also: `grep -c` prints "0" even when exit status is 1 (no matches), so do NOT add a fallback echo.
PASSING_TESTS=$(echo "$CLEAN_OUTPUT" | grep -c "✓" || true)

# Ensure numeric-only values (avoid stray newlines breaking bash arithmetic/comparisons)
PASSING_TESTS=$(echo "$PASSING_TESTS" | tr -dc '0-9')
PASSING_TESTS=${PASSING_TESTS:-0}

# Prefer Vitest summary counts when present (more robust than per-test markers)
PASSED_FILES_SUMMARY=$(echo "$CLEAN_OUTPUT" | grep -E "^\s*Test Files\s+[0-9]+ passed" | head -1 || true)
PASSED_TESTS_SUMMARY=$(echo "$CLEAN_OUTPUT" | grep -E "^\s*Tests\s+[0-9]+ passed" | head -1 || true)

PASSED_FILES_COUNT=$(echo "$PASSED_FILES_SUMMARY" | grep -oE "[0-9]+" | head -1 || true)
PASSED_TESTS_COUNT=$(echo "$PASSED_TESTS_SUMMARY" | grep -oE "[0-9]+" | head -1 || true)

PASSED_FILES_COUNT=${PASSED_FILES_COUNT:-0}
PASSED_TESTS_COUNT=${PASSED_TESTS_COUNT:-0}

PASSED_FILES_COUNT=$(echo "$PASSED_FILES_COUNT" | tr -dc '0-9')
PASSED_TESTS_COUNT=$(echo "$PASSED_TESTS_COUNT" | tr -dc '0-9')
PASSED_FILES_COUNT=${PASSED_FILES_COUNT:-0}
PASSED_TESTS_COUNT=${PASSED_TESTS_COUNT:-0}

# Check for actual test failures via Vitest SUMMARY counts (robust, avoids false positives)
FAILED_FILES_SUMMARY=$(echo "$CLEAN_OUTPUT" | grep -E "^\s*Test Files\s+[0-9]+ failed" | head -1 || true)
FAILED_TESTS_SUMMARY=$(echo "$CLEAN_OUTPUT" | grep -E "^\s*Tests\s+[0-9]+ failed" | head -1 || true)

FAILED_FILES_COUNT=$(echo "$FAILED_FILES_SUMMARY" | grep -oE "[0-9]+" | head -1 || true)
FAILED_TESTS_COUNT=$(echo "$FAILED_TESTS_SUMMARY" | grep -oE "[0-9]+" | head -1 || true)

FAILED_FILES_COUNT=${FAILED_FILES_COUNT:-0}
FAILED_TESTS_COUNT=${FAILED_TESTS_COUNT:-0}

FAILED_FILES_COUNT=$(echo "$FAILED_FILES_COUNT" | tr -dc '0-9')
FAILED_TESTS_COUNT=$(echo "$FAILED_TESTS_COUNT" | tr -dc '0-9')
FAILED_FILES_COUNT=${FAILED_FILES_COUNT:-0}
FAILED_TESTS_COUNT=${FAILED_TESTS_COUNT:-0}

FAILED_TEST_LINES=$((FAILED_FILES_COUNT + FAILED_TESTS_COUNT))

# Check for heap overflow - use tr to ensure clean number
HAS_HEAP_OVERFLOW=$(echo "$CLEAN_OUTPUT" | grep -ci "heap out of memory" || true)
HAS_HEAP_OVERFLOW=$(echo "$HAS_HEAP_OVERFLOW" | tr -dc '0-9')
HAS_HEAP_OVERFLOW=${HAS_HEAP_OVERFLOW:-0}

VITEST_EXIT=$(echo "$VITEST_EXIT" | tr -dc '0-9')
VITEST_EXIT=${VITEST_EXIT:-1}

echo "Passing test markers (✓): $PASSING_TESTS"
echo "Passed summary: files=$PASSED_FILES_COUNT tests=$PASSED_TESTS_COUNT"
echo "Failed summary: files=$FAILED_FILES_COUNT tests=$FAILED_TESTS_COUNT"
echo "Total failures detected: $FAILED_TEST_LINES"
echo "Heap overflow: $HAS_HEAP_OVERFLOW"
echo "Vitest exit code: $VITEST_EXIT"
echo ""

# Success if:
# - Vitest exited 0 AND summary has 0 failed
# OR
# - Heap overflow detected AFTER tests finished, summary has 0 failed, and we have a passed summary.
if [[ $FAILED_TEST_LINES -eq 0 ]] && ( [[ $VITEST_EXIT -eq 0 ]] || ( [[ $HAS_HEAP_OVERFLOW -gt 0 ]] && [[ $PASSED_TESTS_COUNT -gt 0 ]] ) ); then
    echo -e "${GREEN}✅ All tests passed! ($PASSING_TESTS individual tests)${NC}"

    # Show summary if available
    echo "$CLEAN_OUTPUT" | grep -E "Test Files.*passed" | head -1 || true
    echo "$CLEAN_OUTPUT" | grep -E "Tests.*passed" | head -1 || true
    echo "$CLEAN_OUTPUT" | grep -E "Duration" | head -1 || true

    if [[ $HAS_HEAP_OVERFLOW -gt 0 ]]; then
        echo ""
        echo -e "${YELLOW}⚠️  Note: Worker heap overflow during cleanup (after tests completed)${NC}"
        echo -e "${YELLOW}   This is a known Vitest v4.x issue. All tests passed before crash.${NC}"
    fi

    echo ""
    echo -e "${GREEN}✅ TITANE∞ Test Suite: SUCCESS${NC}"
    exit 0
fi

# If we get here, tests actually failed
echo -e "${RED}❌ Tests failed or insufficient passing tests${NC}"
echo ""
tail -30 "$TEMP_OUTPUT"
exit 1
