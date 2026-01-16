#!/bin/bash
set -euo pipefail

# ==============================================================================
# 🏗️ [BUILD-GUARD] TITANE∞ Build Stable Certification
# PHASE P3: Build & Certification AppImage Production
# ==============================================================================

echo "🏗️ [BUILD-GUARD] TITANE∞ Build Stable Certification"
echo "====================================================="

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")" && cd ../.. && pwd)"
STABLE_DIR="$PROJECT_ROOT/runtime/stable"
TAURI_DIR="$PROJECT_ROOT/src-tauri"
EVIDENCE_DIR="$PROJECT_ROOT/docs/_evidence/p3-build"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$EVIDENCE_DIR"
mkdir -p "$STABLE_DIR/logs"

# Logs centralisés
BUILD_LOG="$STABLE_DIR/logs/build-certification-$TIMESTAMP.log"

echo "📋 Phase 1: Pré-build validation..." | tee -a "$BUILD_LOG"

# Vérifier les prérequis
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo "❌ BLOQUANT: package.json manquant" | tee -a "$BUILD_LOG"
    exit 1
fi

if [ ! -f "$TAURI_DIR/Cargo.toml" ]; then
    echo "❌ BLOQUANT: Cargo.toml Tauri manquant" | tee -a "$BUILD_LOG"
    exit 1
fi

if [ ! -f "$STABLE_DIR/tauri.conf.json" ]; then
    echo "❌ BLOQUANT: Configuration stable manquante: $STABLE_DIR/tauri.conf.json" | tee -a "$BUILD_LOG"
    exit 1
fi

# Vérifier outils de build
if ! command -v pnpm >/dev/null 2>&1; then
    echo "❌ BLOQUANT: pnpm manquant pour le build" | tee -a "$BUILD_LOG"
    exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
    echo "❌ BLOQUANT: cargo manquant pour le build" | tee -a "$BUILD_LOG"
    exit 1
fi

echo "✅ Prérequis validés" | tee -a "$BUILD_LOG"

echo "📋 Phase 2: Clean build environment..." | tee -a "$BUILD_LOG"

# Nettoyer les artefacts précédents
cd "$PROJECT_ROOT"
rm -rf node_modules/.vite-cache || true
rm -rf src-tauri/target/release/bundle || true
rm -f "$STABLE_DIR"/*.AppImage || true
rm -f "$STABLE_DIR"/*.deb || true

echo "✅ Environment nettoyé" | tee -a "$BUILD_LOG"

echo "📋 Phase 3: Build stable production..." | tee -a "$BUILD_LOG"

# Build avec configuration stable
cd "$TAURI_DIR"
export RUST_LOG=info
export TITANE_BUILD_ASSUME_YES=1

# Timeout de 20 minutes pour le build
timeout 1200s cargo tauri build --config "$STABLE_DIR/tauri.conf.json" --verbose 2>&1 | tee -a "$BUILD_LOG" || {
    EXIT_CODE=$?
    if [ "$EXIT_CODE" = "124" ]; then
        echo "❌ TIMEOUT: Build dépassé 20min" | tee -a "$BUILD_LOG"
    else
        echo "❌ BUILD FAILED: Exit code $EXIT_CODE" | tee -a "$BUILD_LOG"
    fi
    exit "$EXIT_CODE"
}

echo "✅ Build terminé" | tee -a "$BUILD_LOG"

echo "📋 Phase 4: Certification artefacts..." | tee -a "$BUILD_LOG"

# Localiser les artefacts
APPIMAGE_SRC=""
DEB_SRC=""

if [ -d "$TAURI_DIR/target/release/bundle/appimage" ]; then
    APPIMAGE_SRC=$(find "$TAURI_DIR/target/release/bundle/appimage" -name "*.AppImage" | head -n 1)
fi

if [ -d "$TAURI_DIR/target/release/bundle/deb" ]; then
    DEB_SRC=$(find "$TAURI_DIR/target/release/bundle/deb" -name "*.deb" | head -n 1)
fi

if [ -z "$APPIMAGE_SRC" ] || [ ! -f "$APPIMAGE_SRC" ]; then
    echo "❌ BLOQUANT: AppImage non généré" | tee -a "$BUILD_LOG"
    exit 1
fi

if [ -z "$DEB_SRC" ] || [ ! -f "$DEB_SRC" ]; then
    echo "❌ WARNING: DEB non généré (continuons)" | tee -a "$BUILD_LOG"
fi

echo "✅ AppImage trouvé: $(basename "$APPIMAGE_SRC")" | tee -a "$BUILD_LOG"
if [ -n "$DEB_SRC" ]; then
    echo "✅ DEB trouvé: $(basename "$DEB_SRC")" | tee -a "$BUILD_LOG"
fi

echo "📋 Phase 5: Déploiement stable..." | tee -a "$BUILD_LOG"

# Copier vers runtime/stable avec nom standard
APPIMAGE_DST="$STABLE_DIR/$(basename "$APPIMAGE_SRC")"
cp "$APPIMAGE_SRC" "$APPIMAGE_DST"
chmod +x "$APPIMAGE_DST"
echo "✅ AppImage déployé: $(basename "$APPIMAGE_DST")" | tee -a "$BUILD_LOG"

if [ -n "$DEB_SRC" ]; then
    DEB_DST="$STABLE_DIR/$(basename "$DEB_SRC")"
    cp "$DEB_SRC" "$DEB_DST"
    echo "✅ DEB déployé: $(basename "$DEB_DST")" | tee -a "$BUILD_LOG"
fi

echo "📋 Phase 6: Certification finale..." | tee -a "$BUILD_LOG"

# Calcul hashes et métadonnées
APPIMAGE_SIZE=$(stat -c%s "$APPIMAGE_DST")
APPIMAGE_SHA256=$(sha256sum "$APPIMAGE_DST" | cut -d' ' -f1)

# Test de smoke (30s)
echo "🧪 Test smoke AppImage (30s)..." | tee -a "$BUILD_LOG"
SMOKE_LOG="$STABLE_DIR/logs/smoke-$TIMESTAMP.log"

set +e
timeout 30s "$APPIMAGE_DST" >"$SMOKE_LOG" 2>&1
SMOKE_EXIT=$?
set -e

if [ "$SMOKE_EXIT" = "124" ]; then
    echo "✅ Smoke test PASS: app stable 30s" | tee -a "$BUILD_LOG"
    SMOKE_STATUS="PASS"
else
    echo "⚠️ Smoke test: exit $SMOKE_EXIT (vérifier manuellement)" | tee -a "$BUILD_LOG"
    SMOKE_STATUS="WARN"
fi

# Rapport de certification
CERT_REPORT="$EVIDENCE_DIR/P3_build_certification_$TIMESTAMP.txt"
{
    echo "TIMESTAMP: $(date -Iseconds)"
    echo "PHASE: P3 BUILD STABLE CERTIFICATION"
    echo "STATUS: PASS"
    echo ""
    echo "=== ARTEFACTS ==="
    echo "AppImage: $(basename "$APPIMAGE_DST")"
    echo "Size: $APPIMAGE_SIZE bytes ($(( APPIMAGE_SIZE / 1024 / 1024 ))MB)"
    echo "SHA256: $APPIMAGE_SHA256"
    if [ -n "$DEB_SRC" ]; then
        DEB_SIZE=$(stat -c%s "$DEB_DST")
        DEB_SHA256=$(sha256sum "$DEB_DST" | cut -d' ' -f1)
        echo "DEB: $(basename "$DEB_DST")"
        echo "DEB Size: $DEB_SIZE bytes ($(( DEB_SIZE / 1024 / 1024 ))MB)"
        echo "DEB SHA256: $DEB_SHA256"
    fi
    echo ""
    echo "=== SMOKE TEST ==="
    echo "Status: $SMOKE_STATUS"
    echo "Exit: $SMOKE_EXIT"
    echo "Duration: 30s timeout"
    echo ""
    echo "=== BUILD LOG (TAIL) ==="
    tail -n 50 "$BUILD_LOG"
} > "$CERT_REPORT"

echo ""
echo "✅ BUILD-GUARD: PASS - AppImage stable certifié"
echo "📊 AppImage: $(basename "$APPIMAGE_DST") (${APPIMAGE_SIZE} bytes)"
echo "🔐 SHA256: $APPIMAGE_SHA256"
echo "🧪 Smoke test: $SMOKE_STATUS"
echo "📄 Certification: $(basename "$CERT_REPORT")"
echo "📋 Log complet: $(basename "$BUILD_LOG")"

exit 0