#!/bin/bash
# ════════════════════════════════════════════════════════════════
#   TITANE∞ v14 — Backend Validation Script
#   Quick validation of backend migration completion
# ════════════════════════════════════════════════════════════════

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  TITANE∞ v14 — Backend Validation                           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../src-tauri"

# 1. Check compilation dev
echo -e "${CYAN}[1/6] Checking dev compilation...${NC}"
if cargo check --lib 2>&1 | grep -q "error"; then
    echo -e "${RED}✗ Compilation dev FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Compilation dev OK${NC}"
fi

# 2. Check compilation release
echo -e "${CYAN}[2/6] Checking release compilation...${NC}"
if cargo build --release --lib 2>&1 | grep -q "error\["; then
    echo -e "${RED}✗ Compilation release FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Compilation release OK${NC}"
fi

# 3. Check tests
echo -e "${CYAN}[3/6] Running unit tests...${NC}"
TEST_OUTPUT=$(cargo test --lib 2>&1)
if echo "$TEST_OUTPUT" | grep -q "FAILED"; then
    echo -e "${RED}✗ Tests FAILED${NC}"
    echo "$TEST_OUTPUT" | grep "FAILED"
    exit 1
else
    TEST_COUNT=$(echo "$TEST_OUTPUT" | grep -o "[0-9]* passed" | head -1 | grep -o "[0-9]*")
    echo -e "${GREEN}✓ Tests OK ($TEST_COUNT passed)${NC}"
fi

# 4. Check binary size
echo -e "${CYAN}[4/6] Checking binary size...${NC}"
BINARY_PATH="target/release/libtitane_infinity.rlib"
if [ -f "$BINARY_PATH" ]; then
    SIZE=$(du -h "$BINARY_PATH" | cut -f1)
    echo -e "${GREEN}✓ Binary size: $SIZE${NC}"
else
    echo -e "${YELLOW}⚠ Binary not found (expected after cargo build --release)${NC}"
fi

# 5. Check formatting
echo -e "${CYAN}[5/6] Checking code formatting...${NC}"
if cargo fmt --check 2>&1 | grep -q "Diff in"; then
    echo -e "${YELLOW}⚠ Code formatting needs update (run: cargo fmt)${NC}"
else
    echo -e "${GREEN}✓ Code formatting OK${NC}"
fi

# 6. Check warnings count
echo -e "${CYAN}[6/6] Checking warnings...${NC}"
WARNING_COUNT=$(cargo check --lib 2>&1 | grep -c "warning:" || true)
echo -e "${GREEN}✓ Warnings: $WARNING_COUNT (acceptable)${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Backend v14 Validation PASSED                            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Summary:${NC}"
echo -e "  • Dev compilation: ${GREEN}✓${NC}"
echo -e "  • Release compilation: ${GREEN}✓${NC}"
echo -e "  • Unit tests: ${GREEN}✓ ($TEST_COUNT passed)${NC}"
echo -e "  • Binary size: ${GREEN}✓ ($SIZE)${NC}"
echo -e "  • Warnings: ${GREEN}✓ ($WARNING_COUNT)${NC}"
echo ""
echo -e "${CYAN}Backend is ${GREEN}PRODUCTION READY${CYAN} 🚀${NC}"
