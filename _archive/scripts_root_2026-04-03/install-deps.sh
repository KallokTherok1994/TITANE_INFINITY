#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v26.0.0 - Dependency Installation Script
# Installs all missing dependencies identified in the session
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║           TITANE∞ v26.0.0 - Dependency Installation                   ║${NC}"
echo -e "${BOLD}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "This script will install:"
echo "  • @emotion/is-prop-valid (fixes test suite)"
echo "  • @emotion/styled-base (emotion support)"
echo "  • tsconfig-paths (dev - for madge)"
echo "  • madge (dev - circular dependency checker)"
echo "  • dpdm (dev - alternative dependency analyzer)"
echo ""

read -p "Continue with installation? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installing Production Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm install @emotion/is-prop-valid @emotion/styled-base

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production dependencies installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Production dependencies installation had issues${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installing Development Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm install -D tsconfig-paths madge dpdm

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Development dependencies installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Development dependencies installation had issues${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking installed packages..."
echo ""

DEPS=(
    "@emotion/is-prop-valid"
    "@emotion/styled-base"
    "tsconfig-paths"
    "madge"
    "dpdm"
)

ALL_OK=true

for dep in "${DEPS[@]}"; do
    if npm list "$dep" --depth=0 > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} $dep"
    else
        echo -e "  ${YELLOW}⚠️${NC}  $dep (not found)"
        ALL_OK=false
    fi
done

echo ""

if $ALL_OK; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  ✅ ALL DEPENDENCIES INSTALLED ✅                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Commit changes: git add package*.json && git commit -m 'deps: Add missing dependencies'"
    echo "  2. Run tests: npm test"
    echo "  3. Check circular deps: npx madge --circular src/"
    echo "  4. Run verification: ./scripts/quick-verify.sh"
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║              ⚠️  SOME DEPENDENCIES MISSING ⚠️                          ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please check npm output above for errors."
fi
