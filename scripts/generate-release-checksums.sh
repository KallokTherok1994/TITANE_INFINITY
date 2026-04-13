#!/usr/bin/env bash
# generate-release-checksums.sh
# Reproducible checksum generation for TITANE_INFINITY release artifacts.
# Run after: pnpm exec tauri build

set -euo pipefail
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

BUNDLE="src-tauri/target/release/bundle"
SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
VERSION=$(python3 -c "import json; print(json.load(open('src-tauri/tauri.conf.json'))['version'])" 2>/dev/null || echo "unknown")
OUTPUT="release/checksums/RELEASE_ARTIFACTS_CHECKSUMS_${VERSION}.txt"
mkdir -p release/checksums

echo "[checksums] SHA=$SHA version=$VERSION"

FILES=()
for f in \
  "src-tauri/target/release/titane-infinity" \
  "$BUNDLE/appimage/TITANE-Infinity_${VERSION}_amd64.AppImage" \
  "$BUNDLE/deb/TITANE-Infinity_${VERSION}_amd64.deb" \
  "$BUNDLE/rpm/TITANE-Infinity-${VERSION}-1.x86_64.rpm"; do
  [ -f "$f" ] && FILES+=("$f")
done

if [ ${#FILES[@]} -eq 0 ]; then
  echo "[checksums] ERROR: no artifacts found under $BUNDLE"
  echo "[checksums] Run: pnpm exec tauri build   first"
  exit 1
fi

sha256sum "${FILES[@]}" | tee "$OUTPUT"
echo ""
echo "[checksums] Verifying..."
sha256sum -c "$OUTPUT"
echo "[checksums] PASS — written to $OUTPUT"
