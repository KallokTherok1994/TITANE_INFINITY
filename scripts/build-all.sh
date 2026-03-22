#!/usr/bin/env bash
# =============================================================================
# TITANE∞ — Complete Build Orchestration Script
# Phase 4.3 — Build Artifact Consolidation
# Usage: bash scripts/build-all.sh [--prod]
# =============================================================================

set -euo pipefail

PROD_MODE=false
[[ "${1:-}" == "--prod" ]] && PROD_MODE=true

echo "╔══════════════════════════════════════════════════════════╗"
echo "║    TITANE∞ — Full Build Orchestration                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Step 1: Generate Tauri config for the correct environment
echo "▶ Step 1/5: Generate Tauri configuration..."
if [[ "$PROD_MODE" == true ]]; then
  TITANE_ENV=production node scripts/generate-tauri-config.mjs
else
  TITANE_ENV=development node scripts/generate-tauri-config.mjs
fi
echo "✅ Tauri config generated"

# Step 2: Frontend build (Vite)
echo ""
echo "▶ Step 2/5: Frontend build (Vite)..."
pnpm run build
echo "✅ Frontend compiled → dist/"

# Step 3: Rust / Tauri backend build
echo ""
echo "▶ Step 3/5: Rust backend build..."
cd src-tauri
if [[ "$PROD_MODE" == true ]]; then
  cargo build --release
else
  cargo build
fi
cd "$ROOT"
echo "✅ Rust backend compiled"

# Step 4: Tauri bundle (only in production mode)
if [[ "$PROD_MODE" == true ]]; then
  echo ""
  echo "▶ Step 4/5: Tauri bundle..."
  pnpm tauri build
  echo "✅ Tauri bundle created"
else
  echo ""
  echo "▶ Step 4/5: Skipping Tauri bundle (dev mode)"
fi

# Step 5: Consolidate release artifacts (production only)
if [[ "$PROD_MODE" == true ]]; then
  echo ""
  echo "▶ Step 5/5: Consolidating release artifacts..."
  mkdir -p release

  copied=0

  # Copy AppImage (if present)
  while IFS= read -r f; do
    cp "$f" release/ && echo "  → $(basename "$f")"
    copied=$((copied + 1))
  done < <(find src-tauri/target/release/bundle/appimage -name "*.AppImage" 2>/dev/null)

  # Copy .deb (if present)
  while IFS= read -r f; do
    cp "$f" release/ && echo "  → $(basename "$f")"
    copied=$((copied + 1))
  done < <(find src-tauri/target/release/bundle/deb -name "*.deb" 2>/dev/null)

  if [[ $copied -gt 0 ]]; then
    cd release
    # Generate checksums for whatever was copied
    sha256sum -- *.AppImage *.deb 2>/dev/null > CHECKSUMS.txt || sha256sum -- ./* > CHECKSUMS.txt
    cd "$ROOT"
    echo "✅ $copied artifact(s) consolidated in ./release/"
    cat release/CHECKSUMS.txt
  else
    echo "ℹ️  No bundle artifacts found (expected in full Tauri build)"
  fi
else
  echo "▶ Step 5/5: Skipping artifact consolidation (dev mode)"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║    ✅ Build Complete                                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
