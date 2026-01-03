#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ v∞ — OPTIMIZED BUILD PIPELINE
# Build ultra-optimisé avec LTO, strip, et compression
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_PROFILE="${1:-release}"  # release, release-lto, debug
PARALLEL_JOBS="${PARALLEL_JOBS:-$(nproc)}"
ENABLE_LTO="${ENABLE_LTO:-true}"
STRIP_BINARY="${STRIP_BINARY:-true}"
COMPRESS_ASSETS="${COMPRESS_ASSETS:-true}"

# Timestamps
START_TIME=$(date +%s)

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}   TITANE∞ v∞ — OPTIMIZED BUILD PIPELINE${NC}"
echo -e "${MAGENTA}   Profile: ${CYAN}$BUILD_PROFILE${MAGENTA} | Jobs: ${CYAN}$PARALLEL_JOBS${MAGENTA}${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
# 0. ENVIRONMENT CHECK
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[0/7] Pre-flight checks...${NC}"

# Check required tools
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js required${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}NPM required${NC}"; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo -e "${RED}Cargo required${NC}"; exit 1; }

# Check Tauri CLI
if ! cargo tauri --version >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing Tauri CLI...${NC}"
    cargo install tauri-cli
fi

echo -e "${GREEN}✓${NC} All tools available"

# ─────────────────────────────────────────────────────────────────────────────
# 1. CLEAN PREVIOUS BUILD
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[1/7] Cleaning previous builds...${NC}"

rm -rf dist/
rm -rf node_modules/.vite/
rm -rf src-tauri/target/release/bundle/ 2>/dev/null || true

echo -e "${GREEN}✓${NC} Clean complete"

# ─────────────────────────────────────────────────────────────────────────────
# 2. INSTALL DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[2/7] Installing dependencies...${NC}"

if [ -f "pnpm-lock.yaml" ] && command -v pnpm >/dev/null 2>&1; then
    pnpm install --frozen-lockfile
elif [ -f "package-lock.json" ]; then
    pnpm install --frozen-lockfile
else
    pnpm install
fi

echo -e "${GREEN}✓${NC} Dependencies installed"

# ─────────────────────────────────────────────────────────────────────────────
# 3. TYPE CHECK
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[3/7] TypeScript validation...${NC}"

pnpm run type-check || {
    echo -e "${RED}✗ TypeScript errors found${NC}"
    exit 1
}

echo -e "${GREEN}✓${NC} TypeScript: 0 errors"

# ─────────────────────────────────────────────────────────────────────────────
# 4. FRONTEND BUILD (Vite)
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[4/7] Building frontend (Vite)...${NC}"

FRONTEND_START=$(date +%s)

# Build with optimizations
NODE_ENV=production pnpm run build

FRONTEND_END=$(date +%s)
FRONTEND_TIME=$((FRONTEND_END - FRONTEND_START))

# Measure output
DIST_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1 || echo "N/A")

echo -e "${GREEN}✓${NC} Frontend built in ${CYAN}${FRONTEND_TIME}s${NC} (${DIST_SIZE})"

# ─────────────────────────────────────────────────────────────────────────────
# 5. COMPRESS ASSETS (optional)
# ─────────────────────────────────────────────────────────────────────────────
if [ "$COMPRESS_ASSETS" = "true" ]; then
    echo -e "\n${YELLOW}[5/7] Compressing assets...${NC}"

    # Compress JS files with gzip if available
    if command -v gzip >/dev/null 2>&1; then
        find dist/ -name "*.js" -size +10k -exec gzip -9 -k {} \; 2>/dev/null || true
        find dist/ -name "*.css" -size +10k -exec gzip -9 -k {} \; 2>/dev/null || true

        GZIP_COUNT=$(find dist/ -name "*.gz" 2>/dev/null | wc -l)
        echo -e "${GREEN}✓${NC} Created ${GZIP_COUNT} compressed files"
    else
        echo -e "${YELLOW}⚠${NC} gzip not available, skipping compression"
    fi
else
    echo -e "\n${YELLOW}[5/7] Asset compression: SKIPPED${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. BACKEND BUILD (Rust/Tauri)
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[6/7] Building backend (Rust/Tauri)...${NC}"

RUST_START=$(date +%s)

# Set Rust optimization flags
export CARGO_PROFILE_RELEASE_LTO=${ENABLE_LTO}
export CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1
export CARGO_PROFILE_RELEASE_OPT_LEVEL=3
export CARGO_PROFILE_RELEASE_PANIC=abort

# Build Tauri app
if [ "$BUILD_PROFILE" = "debug" ]; then
    cargo tauri build --debug 2>&1 | tail -20
else
    cargo tauri build --release 2>&1 | tail -20
fi

RUST_END=$(date +%s)
RUST_TIME=$((RUST_END - RUST_START))

echo -e "${GREEN}✓${NC} Backend built in ${CYAN}${RUST_TIME}s${NC}"

# ─────────────────────────────────────────────────────────────────────────────
# 7. POST-BUILD OPTIMIZATION
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[7/7] Post-build optimization...${NC}"

# Find binary
BINARY_PATH=""
if [ -f "src-tauri/target/release/titane-infinity" ]; then
    BINARY_PATH="src-tauri/target/release/titane-infinity"
elif [ -f "src-tauri/target/release/titane_infinity" ]; then
    BINARY_PATH="src-tauri/target/release/titane_infinity"
fi

if [ -n "$BINARY_PATH" ]; then
    ORIGINAL_SIZE=$(du -h "$BINARY_PATH" | cut -f1)

    # Strip debug symbols if enabled
    if [ "$STRIP_BINARY" = "true" ] && command -v strip >/dev/null 2>&1; then
        strip -s "$BINARY_PATH" 2>/dev/null || true
        STRIPPED_SIZE=$(du -h "$BINARY_PATH" | cut -f1)
        echo -e "${GREEN}✓${NC} Binary stripped: ${ORIGINAL_SIZE} → ${CYAN}${STRIPPED_SIZE}${NC}"
    else
        echo -e "${GREEN}✓${NC} Binary size: ${CYAN}${ORIGINAL_SIZE}${NC}"
    fi
else
    echo -e "${YELLOW}⚠${NC} Binary not found for post-processing"
fi

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}   BUILD COMPLETE${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "   ${CYAN}Profile:${NC}      $BUILD_PROFILE"
echo -e "   ${CYAN}Frontend:${NC}     ${FRONTEND_TIME}s"
echo -e "   ${CYAN}Backend:${NC}      ${RUST_TIME}s"
echo -e "   ${CYAN}Total Time:${NC}   ${GREEN}${TOTAL_TIME}s${NC}"
echo ""

# Find bundle location
BUNDLE_DIR="src-tauri/target/release/bundle"
if [ -d "$BUNDLE_DIR" ]; then
    echo -e "   ${CYAN}Bundles:${NC}"
    if [ -d "$BUNDLE_DIR/deb" ]; then
        DEB_FILE=$(ls "$BUNDLE_DIR/deb/"*.deb 2>/dev/null | head -1)
        [ -n "$DEB_FILE" ] && echo -e "     • DEB: ${GREEN}$(basename "$DEB_FILE")${NC}"
    fi
    if [ -d "$BUNDLE_DIR/appimage" ]; then
        APPIMAGE_FILE=$(ls "$BUNDLE_DIR/appimage/"*.AppImage 2>/dev/null | head -1)
        [ -n "$APPIMAGE_FILE" ] && echo -e "     • AppImage: ${GREEN}$(basename "$APPIMAGE_FILE")${NC}"
    fi
fi

echo ""
echo -e "${GREEN}★ TITANE∞ v∞ — Build successful!${NC}"
echo -e "${BLUE}Generated: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
