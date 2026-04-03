#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — AUTO FIX v24
#   Réparation automatique de tous les problèmes courants
# ═══════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔧 TITANE∞ Auto Fix v24"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Kill all running processes
echo -e "${BLUE}[1/8]${NC} Killing stale processes..."
pkill -9 -f 'tauri|cargo-tauri' 2>/dev/null || true
pkill -9 -f 'vite' 2>/dev/null || true
sleep 1
echo -e "  ${GREEN}✓${NC} Processes cleared"

# 2. Clean Rust build artifacts
echo -e "${BLUE}[2/8]${NC} Cleaning Rust build artifacts..."
if [ -d "src-tauri/target" ]; then
    rm -rf src-tauri/target
    echo -e "  ${GREEN}✓${NC} Removed src-tauri/target"
fi
if [ -f "src-tauri/Cargo.lock" ]; then
    rm -f src-tauri/Cargo.lock
    echo -e "  ${GREEN}✓${NC} Removed Cargo.lock"
fi

# 3. Clean Node.js artifacts
echo -e "${BLUE}[3/8]${NC} Cleaning Node.js artifacts..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "  ${GREEN}✓${NC} Removed node_modules"
fi
if [ -f "pnpm-lock.yaml" ]; then
    rm -f pnpm-lock.yaml
    echo -e "  ${GREEN}✓${NC} Removed pnpm-lock.yaml"
fi
if [ -d ".vite" ]; then
    rm -rf .vite
    echo -e "  ${GREEN}✓${NC} Removed .vite cache"
fi

# 4. Reinstall Node dependencies
echo -e "${BLUE}[4/8]${NC} Reinstalling Node dependencies..."
pnpm install --force
echo -e "  ${GREEN}✓${NC} Dependencies installed"

# 5. Update Cargo dependencies
echo -e "${BLUE}[5/8]${NC} Updating Cargo dependencies..."
cd src-tauri
cargo update
cargo fetch
cd ..
echo -e "  ${GREEN}✓${NC} Cargo dependencies updated"

# 6. Fix permissions
echo -e "${BLUE}[6/8]${NC} Fixing permissions..."
chmod -R u+rw src-tauri/
chmod +x scripts/*.sh 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Permissions fixed"

# 7. Detect WebKitGTK version
echo -e "${BLUE}[7/8]${NC} Detecting WebKitGTK version..."
if pkg-config --exists webkit2gtk-4.1; then
    WEBKIT_VERSION="4.1"
    echo -e "  ${GREEN}✓${NC} Using WebKitGTK 4.1"
elif pkg-config --exists webkit2gtk-4.0; then
    WEBKIT_VERSION="4.0"
    echo -e "  ${YELLOW}⚠${NC} Using WebKitGTK 4.0 (consider upgrading)"
else
    echo -e "  ${RED}✗${NC} WebKitGTK not found!"
    echo "  Install: sudo apt install libwebkit2gtk-4.1-dev"
    exit 1
fi

# 8. Run clippy fixes
echo -e "${BLUE}[8/8]${NC} Running clippy auto-fixes..."
cd src-tauri
cargo clippy --fix --allow-dirty --allow-staged 2>/dev/null || true
cd ..
echo -e "  ${GREEN}✓${NC} Clippy fixes applied"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Auto-fix complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: pnpm dev"
echo "  2. Or: pnpm tauri dev"
echo ""
echo "Detected WebKitGTK: $WEBKIT_VERSION"
