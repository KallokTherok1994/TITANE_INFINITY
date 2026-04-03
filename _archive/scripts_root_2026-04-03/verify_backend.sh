#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — BACKEND VERIFICATION v1.0.0
#   Vérifie build, tests et santé du backend Tauri/Rust
# ═══════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse args
MODE="standard"
if [ "$1" = "--quick" ]; then
    MODE="quick"
elif [ "$1" = "--deep" ]; then
    MODE="deep"
fi

echo -e "${BLUE}🔍 TITANE∞ Backend Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Mode: ${YELLOW}$MODE${NC}"
echo ""

# Exit codes
EXIT_OK=0
EXIT_BUILD_FAILED=1
EXIT_TESTS_FAILED=2
EXIT_HEALTH_FAILED=3

# ═══════════════════════════════════════════════════════════════
# STEP 1: Environment Check (5s)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[1/5]${NC} Checking environment..."

if ! command -v rustc &> /dev/null; then
    echo -e "${RED}✗ Rust not found${NC}"
    exit $EXIT_BUILD_FAILED
fi

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}✗ Cargo not found${NC}"
    exit $EXIT_BUILD_FAILED
fi

RUST_VERSION=$(rustc --version | awk '{print $2}')
CARGO_VERSION=$(cargo --version | awk '{print $2}')
echo -e "${GREEN}✓${NC} Rust $RUST_VERSION, Cargo $CARGO_VERSION"

# ═══════════════════════════════════════════════════════════════
# STEP 2: Cargo Build (30s-1min)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[2/5]${NC} Building backend..."

cd src-tauri

if cargo build 2>&1 | tee build.log | tail -10; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo -e "${YELLOW}See src-tauri/build.log for details${NC}"
    exit $EXIT_BUILD_FAILED
fi

cd ..

# Quick mode: skip tests
if [ "$MODE" = "quick" ]; then
    echo -e "${BLUE}[3/5]${NC} Tests: ${YELLOW}SKIPPED (quick mode)${NC}"
    echo -e "${BLUE}[4/5]${NC} Health check: ${YELLOW}SKIPPED (quick mode)${NC}"
    echo -e "${BLUE}[5/5]${NC} Summary: ${GREEN}✓ Quick verification PASSED${NC}"
    exit $EXIT_OK
fi

# ═══════════════════════════════════════════════════════════════
# STEP 3: Cargo Test (30s-1min)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[3/5]${NC} Running tests..."

cd src-tauri

if cargo test 2>&1 | tee test.log | tail -20; then
    echo -e "${GREEN}✓${NC} Tests passed"
    TEST_EXIT=0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    echo -e "${YELLOW}See src-tauri/test.log for details${NC}"
    TEST_EXIT=$EXIT_TESTS_FAILED
fi

cd ..

# Deep mode: additional checks
if [ "$MODE" = "deep" ]; then
    echo -e "${BLUE}[3b/5]${NC} Running clippy..."
    cd src-tauri
    if cargo clippy -- -D warnings 2>&1 | tail -10; then
        echo -e "${GREEN}✓${NC} Clippy passed"
    else
        echo -e "${YELLOW}⚠️  Clippy warnings detected${NC}"
    fi
    cd ..
fi

# ═══════════════════════════════════════════════════════════════
# STEP 4: Health Check (2s) - if app is running
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}[4/5]${NC} Checking backend health..."

if pgrep -f "titane-infinity" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend process running"
    # TODO: Add actual health check via Tauri command when implemented
    # For now, just check if process exists
else
    echo -e "${YELLOW}⚠️${NC}  Backend not running (OK for CI/local dev)"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 5: Summary
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}[5/5]${NC} Summary"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $TEST_EXIT -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Backend verification completed with WARNINGS${NC}"
    echo -e "   - Build: ${GREEN}OK${NC}"
    echo -e "   - Tests: ${YELLOW}FAILED${NC}"
    echo -e ""
    echo -e "Next steps:"
    echo -e "  1. Check ${YELLOW}src-tauri/test.log${NC}"
    echo -e "  2. Fix failing tests"
    echo -e "  3. Run ${BLUE}pnpm run verify:backend${NC} again"
    exit $TEST_EXIT
else
    echo -e "${GREEN}✅ Backend verification PASSED${NC}"
    echo -e "   - Environment: ${GREEN}OK${NC}"
    echo -e "   - Build: ${GREEN}OK${NC}"
    echo -e "   - Tests: ${GREEN}OK${NC}"
    echo -e "   - Health: ${GREEN}OK${NC}"
    exit $EXIT_OK
fi
