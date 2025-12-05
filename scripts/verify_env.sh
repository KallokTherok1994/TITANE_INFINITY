#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ v∞ — VERIFY ENVIRONMENT SCRIPT
# Vérifie toutes les dépendances nécessaires au build
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TITANE∞ v∞ — ENVIRONMENT VERIFICATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

ERRORS=0

# Fonction de vérification
check_command() {
    local cmd=$1
    local name=$2
    local min_version=$3

    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -1)
        echo -e "${GREEN}✓${NC} $name: $version"
        return 0
    else
        echo -e "${RED}✗${NC} $name: NOT FOUND"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. RUST TOOLCHAIN
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[1/6] Rust Toolchain${NC}"
check_command "rustc" "Rust Compiler"
check_command "cargo" "Cargo"
check_command "rustup" "Rustup"

# Vérifier target wasm (optionnel)
if rustup target list --installed | grep -q "wasm32"; then
    echo -e "${GREEN}✓${NC} WASM target installed"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. NODE.JS & NPM
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[2/6] Node.js Environment${NC}"
check_command "node" "Node.js"
check_command "npm" "NPM"

# Check pnpm (optionnel)
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓${NC} pnpm: $(pnpm --version)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. TAURI CLI
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[3/6] Tauri CLI${NC}"
if command -v cargo-tauri &> /dev/null; then
    echo -e "${GREEN}✓${NC} Tauri CLI: $(cargo tauri --version 2>&1)"
elif cargo tauri --version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Tauri CLI: $(cargo tauri --version 2>&1)"
else
    echo -e "${RED}✗${NC} Tauri CLI: NOT FOUND"
    echo -e "   ${YELLOW}Install with: cargo install tauri-cli${NC}"
    ERRORS=$((ERRORS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. SYSTEM DEPENDENCIES (Linux)
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[4/6] System Dependencies${NC}"

# WebKitGTK
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    echo -e "${GREEN}✓${NC} WebKitGTK 4.1: installed"
elif pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    echo -e "${GREEN}✓${NC} WebKitGTK 4.0: installed"
else
    echo -e "${RED}✗${NC} WebKitGTK: NOT FOUND"
    echo -e "   ${YELLOW}Install with: sudo apt install libwebkit2gtk-4.1-dev${NC}"
    ERRORS=$((ERRORS + 1))
fi

# GTK3
if pkg-config --exists gtk+-3.0 2>/dev/null; then
    echo -e "${GREEN}✓${NC} GTK3: installed"
else
    echo -e "${RED}✗${NC} GTK3: NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi

# libappindicator
if pkg-config --exists ayatana-appindicator3-0.1 2>/dev/null || pkg-config --exists appindicator3-0.1 2>/dev/null; then
    echo -e "${GREEN}✓${NC} AppIndicator: installed"
else
    echo -e "${YELLOW}⚠${NC} AppIndicator: NOT FOUND (optional)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. PROJECT STRUCTURE
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[5/6] Project Structure${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json found"
else
    echo -e "${RED}✗${NC} package.json NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$PROJECT_ROOT/src-tauri/Cargo.toml" ]; then
    echo -e "${GREEN}✓${NC} src-tauri/Cargo.toml found"
else
    echo -e "${RED}✗${NC} src-tauri/Cargo.toml NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$PROJECT_ROOT/src-tauri/tauri.conf.json" ]; then
    echo -e "${GREEN}✓${NC} tauri.conf.json found"
else
    echo -e "${RED}✗${NC} tauri.conf.json NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. CARGO CHECK
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[6/6] Cargo Check${NC}"
cd "$PROJECT_ROOT/src-tauri"
if cargo check --quiet 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Cargo check passed"
else
    echo -e "${RED}✗${NC} Cargo check failed"
    ERRORS=$((ERRORS + 1))
fi
cd "$PROJECT_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
# RÉSUMÉ
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ ENVIRONMENT OK — Ready to build TITANE∞${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS ERROR(S) FOUND — Please fix before building${NC}"
    exit 1
fi
