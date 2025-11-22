#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — SYSTEM CHECKER v24
#   Vérifie toutes les dépendances système (Pop!_OS/Ubuntu)
# ═══════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 TITANE∞ System Checker v24"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Rust
echo -n "Checking Rust... "
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version | awk '{print $2}')
    echo -e "${GREEN}✓${NC} $RUST_VERSION"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    echo "  Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check Cargo
echo -n "Checking Cargo... "
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version | awk '{print $2}')
    echo -e "${GREEN}✓${NC} $CARGO_VERSION"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    exit 1
fi

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    echo "  Install: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
    exit 1
fi

# Check pnpm
echo -n "Checking pnpm... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} $PNPM_VERSION"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    echo "  Install: npm install -g pnpm"
    exit 1
fi

# Check WebKitGTK
echo -n "Checking WebKitGTK... "
WEBKIT_4_1=$(pkg-config --exists webkit2gtk-4.1 2>/dev/null && echo "yes" || echo "no")
WEBKIT_4_0=$(pkg-config --exists webkit2gtk-4.0 2>/dev/null && echo "yes" || echo "no")

if [ "$WEBKIT_4_1" = "yes" ]; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo -e "${GREEN}✓${NC} 4.1 ($WEBKIT_VERSION)"
    export WEBKIT_VERSION="4.1"
elif [ "$WEBKIT_4_0" = "yes" ]; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.0)
    echo -e "${YELLOW}⚠${NC} 4.0 ($WEBKIT_VERSION) - Consider upgrading to 4.1"
    export WEBKIT_VERSION="4.0"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    echo "  Install: sudo apt install libwebkit2gtk-4.1-dev (or 4.0)"
    exit 1
fi

# Check JavaScriptCore
echo -n "Checking JavaScriptCore... "
JSC_4_1=$(pkg-config --exists javascriptcoregtk-4.1 2>/dev/null && echo "yes" || echo "no")
JSC_4_0=$(pkg-config --exists javascriptcoregtk-4.0 2>/dev/null && echo "yes" || echo "no")

if [ "$JSC_4_1" = "yes" ]; then
    JSC_VERSION=$(pkg-config --modversion javascriptcoregtk-4.1)
    echo -e "${GREEN}✓${NC} 4.1 ($JSC_VERSION)"
elif [ "$JSC_4_0" = "yes" ]; then
    JSC_VERSION=$(pkg-config --modversion javascriptcoregtk-4.0)
    echo -e "${YELLOW}⚠${NC} 4.0 ($JSC_VERSION)"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    exit 1
fi

# Check GTK+
echo -n "Checking GTK+... "
if pkg-config --exists gtk+-3.0; then
    GTK_VERSION=$(pkg-config --modversion gtk+-3.0)
    echo -e "${GREEN}✓${NC} $GTK_VERSION"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    echo "  Install: sudo apt install libgtk-3-dev"
    exit 1
fi

# Check libsoup
echo -n "Checking libsoup... "
if pkg-config --exists libsoup-3.0; then
    SOUP_VERSION=$(pkg-config --modversion libsoup-3.0)
    echo -e "${GREEN}✓${NC} 3.0 ($SOUP_VERSION)"
elif pkg-config --exists libsoup-2.4; then
    SOUP_VERSION=$(pkg-config --modversion libsoup-2.4)
    echo -e "${YELLOW}⚠${NC} 2.4 ($SOUP_VERSION)"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    exit 1
fi

# Check build-essential
echo -n "Checking build tools... "
if command -v gcc &> /dev/null && command -v g++ &> /dev/null && command -v make &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ MISSING${NC}"
    echo "  Install: sudo apt install build-essential"
    exit 1
fi

# Check pkg-config
echo -n "Checking pkg-config... "
if command -v pkg-config &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All system dependencies are satisfied${NC}"
echo ""
echo "Detected WebKitGTK version: $WEBKIT_VERSION"
echo "To use this version in Tauri, ensure tauri.conf.json uses webkit2gtk-rs/v${WEBKIT_VERSION/-/.}"
