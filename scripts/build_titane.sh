#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ v24.3.0 — BUILD SCRIPT
# Build complet : Frontend (Vite) + Backend (Rust/Tauri)
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_MODE="${1:-release}"  # release ou debug
SKIP_FRONTEND="${SKIP_FRONTEND:-false}"
SKIP_BACKEND="${SKIP_BACKEND:-false}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TITANE∞ v24.3.0 — BUILD PIPELINE${NC}"
echo -e "${BLUE}   Mode: ${CYAN}$BUILD_MODE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
# 0. VERIFY ENVIRONMENT
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[0/5] Verifying environment...${NC}"
if [ -x "$SCRIPT_DIR/verify_env.sh" ]; then
    "$SCRIPT_DIR/verify_env.sh" || {
        echo -e "${RED}Environment verification failed. Aborting.${NC}"
        exit 1
    }
else
    echo -e "${YELLOW}⚠ verify_env.sh not executable, skipping verification${NC}"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 1. CLEAN (optionnel)
# ─────────────────────────────────────────────────────────────────────────────
if [ "$CLEAN_BUILD" = "true" ]; then
    echo -e "${YELLOW}[1/5] Cleaning previous builds...${NC}"
    rm -rf dist/
    rm -rf src-tauri/target/release/
    rm -rf node_modules/.vite/
    echo -e "${GREEN}✓ Clean complete${NC}"
else
    echo -e "${YELLOW}[1/5] Skipping clean (use CLEAN_BUILD=true to enable)${NC}"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 2. INSTALL DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[2/5] Installing dependencies...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile 2>/dev/null || pnpm install --frozen-lockfile
elif [ -f "package-lock.json" ]; then
    pnpm install --frozen-lockfile
else
    pnpm install
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 3. TYPE CHECK
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[3/5] Running TypeScript type check...${NC}"
pnpm run type-check || {
    echo -e "${RED}✗ TypeScript errors found${NC}"
    exit 1
}
echo -e "${GREEN}✓ TypeScript check passed${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 4. BUILD FRONTEND
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_FRONTEND" != "true" ]; then
    echo -e "${YELLOW}[4/5] Building frontend (Vite)...${NC}"

    # Build avec optimisations
    NODE_ENV=production pnpm run build

    # Vérifier la taille du build
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo -e "${GREEN}✓ Frontend built successfully (${DIST_SIZE})${NC}"
    else
        echo -e "${RED}✗ Frontend build failed - dist/ not found${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}[4/5] Skipping frontend build${NC}"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 5. BUILD TAURI (Backend + Bundle)
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_BACKEND" != "true" ]; then
    echo -e "${YELLOW}[5/5] Building Tauri application...${NC}"

    if [ "$BUILD_MODE" = "debug" ]; then
        cargo tauri build --debug
    else
        cargo tauri build
    fi

    # Trouver le binaire généré
    if [ "$BUILD_MODE" = "debug" ]; then
        BINARY_PATH="src-tauri/target/debug/titane-infinity"
    else
        BINARY_PATH="src-tauri/target/release/titane-infinity"
    fi

    if [ -f "$BINARY_PATH" ]; then
        BINARY_SIZE=$(du -h "$BINARY_PATH" | cut -f1)
        echo -e "${GREEN}✓ Binary built: ${BINARY_SIZE}${NC}"
    fi

    # Trouver les bundles
    BUNDLE_DIR="src-tauri/target/release/bundle"
    if [ -d "$BUNDLE_DIR" ]; then
        echo -e "${CYAN}Bundles generated:${NC}"

        # AppImage
        if ls "$BUNDLE_DIR/appimage/"*.AppImage 1> /dev/null 2>&1; then
            APPIMAGE=$(ls -1 "$BUNDLE_DIR/appimage/"*.AppImage | head -1)
            APPIMAGE_SIZE=$(du -h "$APPIMAGE" | cut -f1)
            echo -e "  ${GREEN}✓${NC} AppImage: $APPIMAGE_SIZE"
        fi

        # DEB
        if ls "$BUNDLE_DIR/deb/"*.deb 1> /dev/null 2>&1; then
            DEB=$(ls -1 "$BUNDLE_DIR/deb/"*.deb | head -1)
            DEB_SIZE=$(du -h "$DEB" | cut -f1)
            echo -e "  ${GREEN}✓${NC} DEB: $DEB_SIZE"
        fi
    fi
else
    echo -e "${YELLOW}[5/5] Skipping Tauri build${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. COPILOT-XS VALIDATION (optionnel)
# ─────────────────────────────────────────────────────────────────────────────
if [ -f ".github/copilot-xs/scripts/validate.js" ]; then
    echo -e "${YELLOW}[6/6] Running copilot-xs validation...${NC}"
    if node .github/copilot-xs/scripts/validate.js > /dev/null 2>&1; then
        echo -e "${GREEN}✓ copilot-xs validation passed${NC}"
    else
        echo -e "${YELLOW}⚠ copilot-xs validation has warnings (non-blocking)${NC}"
    fi
    echo ""
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ BUILD COMPLETE — TITANE∞ v24.3.0${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Afficher les chemins des artifacts
echo -e "\n${CYAN}Build artifacts:${NC}"
if [ -d "dist" ]; then
    echo -e "  Frontend: ${PROJECT_ROOT}/dist/"
fi
if [ -d "$BUNDLE_DIR" ]; then
    echo -e "  Bundles:  ${PROJECT_ROOT}/$BUNDLE_DIR/"
fi

exit 0
