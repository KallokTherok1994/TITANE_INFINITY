#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v26.0.0 - Quick Verification Script
# Run this after completing user actions to verify everything is working
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║           TITANE∞ v26.0.0 - Quick Verification Script                 ║${NC}"
echo -e "${BOLD}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track pass/fail
PASSED=0
FAILED=0

# Function to check command
check() {
    local name="$1"
    local cmd="$2"

    echo -n "Checking $name... "

    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# Function to check with output
check_verbose() {
    local name="$1"
    local cmd="$2"

    echo -e "${BOLD}Checking $name...${NC}"

    if output=$(eval "$cmd" 2>&1); then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "$output" | head -5
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "$output" | head -10
        ((FAILED++))
        return 1
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Git & Repository Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "Git clean" "git diff --quiet && git diff --cached --quiet"
check "Remote sync" "git fetch origin && git status | grep -q 'up to date'"
check "No uncommitted" "test \$(git status --short | wc -l) -eq 0"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. TypeScript Compilation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if check_verbose "TypeScript (npx tsc --noEmit)" "npx tsc --noEmit"; then
    echo -e "${GREEN}TypeScript: 0 errors ✅${NC}"
else
    echo -e "${RED}TypeScript: Errors found ❌${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "@emotion/is-prop-valid" "npm list @emotion/is-prop-valid --depth=0"
check "@emotion/styled-base" "npm list @emotion/styled-base --depth=0"
check "tsconfig-paths" "npm list tsconfig-paths --depth=0"
check "madge" "npm list madge --depth=0"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Build Artifacts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "dist/ exists" "test -d dist"
check "dist/index.html" "test -f dist/index.html"
check "dist/stats.html" "test -f dist/stats.html"
check "dist/assets/" "test -d dist/assets"

if [ -d dist ]; then
    BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
    echo -e "${GREEN}Bundle size: $BUNDLE_SIZE${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Test Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TEST_COUNT=$(find src -name "*.test.ts*" 2>/dev/null | wc -l)
echo -e "Test files found: ${GREEN}$TEST_COUNT${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Circular Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v madge &> /dev/null; then
    if CIRCULAR=$(npx madge --circular src/ 2>&1); then
        if echo "$CIRCULAR" | grep -q "No circular"; then
            echo -e "${GREEN}✅ No circular dependencies found${NC}"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️  Circular dependencies detected:${NC}"
            echo "$CIRCULAR"
            ((FAILED++))
        fi
    else
        echo -e "${RED}❌ Madge check failed${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  Madge not installed (install with: npm install -D madge)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Module Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d src/modules/devSudo ]; then
    MODULE_COUNT=$(ls -1 src/modules/devSudo/*.ts 2>/dev/null | wc -l)
    echo -e "devSudo modules: ${GREEN}$MODULE_COUNT files${NC}"

    if [ -f src/modules/devSudo/devSudoHandler.ts ]; then
        LOC=$(wc -l < src/modules/devSudo/devSudoHandler.ts)
        echo -e "devSudoHandler.ts: ${GREEN}$LOC LOC${NC} (target: <500)"

        if [ $LOC -lt 500 ]; then
            echo -e "${GREEN}✅ Successfully refactored (was 6,651 LOC)${NC}"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️  Still larger than target${NC}"
        fi
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                           SUMMARY                                      ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║                      ✅ ALL CHECKS PASSED ✅                            ║${NC}"
    echo -e "${BOLD}${GREEN}║                  System ✅ Tech-Ready (Dev) | Production: ⛔ EN ATTENTE (autorisation requise)                          ║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${BOLD}${YELLOW}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${YELLOW}║                    ⚠️  SOME CHECKS FAILED ⚠️                           ║${NC}"
    echo -e "${BOLD}${YELLOW}║            Please review failures and take action                     ║${NC}"
    echo -e "${BOLD}${YELLOW}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
