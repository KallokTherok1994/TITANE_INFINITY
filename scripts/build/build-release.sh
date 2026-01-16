#!/bin/bash
# TITANE∞ v21.2 — Release Build Optimizer
# Optimise et build le binaire production avec size reduction -82%

set -e

echo "🚀 Building TITANE∞ Release v21.2..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
cargo clean --manifest-path src-tauri/Cargo.toml --release 2>/dev/null || true
rm -rf dist/ 2>/dev/null || true

# 2. Build frontend (production)
echo ""
echo -e "${BLUE}📦 Building frontend (production)...${NC}"
corepack pnpm run build

FRONTEND_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
echo -e "${GREEN}✓ Frontend built: ${FRONTEND_SIZE}${NC}"

# 3. Build Tauri (release)
echo ""
echo -e "${BLUE}⚙️ Building Tauri release...${NC}"
echo -e "${YELLOW}   This may take 2-3 minutes (LTO + optimizations)...${NC}"

START_TIME=$(date +%s)
cargo build --release --manifest-path src-tauri/Cargo.toml
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))

echo -e "${GREEN}✓ Rust backend built in ${BUILD_TIME}s${NC}"

# 4. Check binary exists
BINARY_PATH="src-tauri/target/release/titane-infinity"
if [ ! -f "$BINARY_PATH" ]; then
    echo -e "${YELLOW}⚠️  Binary not found at expected path${NC}"
    BINARY_PATH=$(find src-tauri/target/release -name "titane-infinity" -o -name "titane_infinity" | head -1)
fi

if [ -z "$BINARY_PATH" ]; then
    echo "❌ Error: Could not find binary"
    exit 1
fi

# 5. Strip debug symbols (if not already stripped)
echo ""
echo -e "${BLUE}🔪 Stripping debug symbols...${NC}"
BEFORE_SIZE=$(stat -c%s "$BINARY_PATH" 2>/dev/null || stat -f%z "$BINARY_PATH" 2>/dev/null)
strip "$BINARY_PATH" 2>/dev/null || true
AFTER_SIZE=$(stat -c%s "$BINARY_PATH" 2>/dev/null || stat -f%z "$BINARY_PATH" 2>/dev/null)

BEFORE_MB=$((BEFORE_SIZE / 1024 / 1024))
AFTER_MB=$((AFTER_SIZE / 1024 / 1024))

if [ "$BEFORE_SIZE" -ne "$AFTER_SIZE" ]; then
    REDUCTION=$(( (BEFORE_SIZE - AFTER_SIZE) * 100 / BEFORE_SIZE ))
    echo -e "${GREEN}✓ Stripped: ${BEFORE_MB}M → ${AFTER_MB}M (-${REDUCTION}%)${NC}"
else
    echo -e "${YELLOW}  Already stripped: ${AFTER_MB}M${NC}"
fi

# 6. Optional: UPX compression (ultra-compact)
if command -v upx &> /dev/null; then
    echo ""
    echo -e "${BLUE}🗜️  UPX compression available (optional)${NC}"
    read -p "   Compress binary with UPX? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        UPX_BEFORE=$AFTER_SIZE
        upx --best --lzma "$BINARY_PATH" 2>/dev/null || upx --best "$BINARY_PATH" 2>/dev/null || true
        UPX_AFTER=$(stat -c%s "$BINARY_PATH" 2>/dev/null || stat -f%z "$BINARY_PATH" 2>/dev/null)
        UPX_MB=$((UPX_AFTER / 1024 / 1024))
        UPX_REDUCTION=$(( (UPX_BEFORE - UPX_AFTER) * 100 / UPX_BEFORE ))
        echo -e "${GREEN}✓ Compressed: ${AFTER_MB}M → ${UPX_MB}M (-${UPX_REDUCTION}%)${NC}"
        AFTER_MB=$UPX_MB
    fi
fi

# 7. Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Release build complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Build Summary:"
echo "   Frontend:  $FRONTEND_SIZE"
echo "   Backend:   ${AFTER_MB}M (release)"
echo "   Build time: ${BUILD_TIME}s"
echo ""
echo "📁 Binary location:"
echo "   $BINARY_PATH"
echo ""
echo "🚀 To run:"
echo "   $BINARY_PATH"
echo ""
