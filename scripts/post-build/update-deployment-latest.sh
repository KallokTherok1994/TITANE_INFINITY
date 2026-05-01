#!/bin/bash
# TITANE∞ — Post-build: Copie auto DEB+AppImage vers deployment/latest/
# Usage: bash scripts/post-build/update-deployment-latest.sh [VERSION]
#
# Si VERSION est omis, lit package.json.
# Cherche les artifacts dans src-tauri/target/release/bundle/{deb,appimage}/
# Copie vers deployment/latest/, met à jour MANIFEST.json, VERSION.txt, SHA256SUMS.txt

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle"
DEPLOY_DIR="$ROOT_DIR/deployment/latest"

# ── Résolution version ─────────────────────────────────────────────────────
if [[ -n "${1:-}" ]]; then
  VERSION="$1"
else
  VERSION="$(node -e "process.stdout.write(require('$ROOT_DIR/package.json').version)")"
fi

echo "[deploy-latest] Version cible : $VERSION"

# ── Vérification bundle directory ─────────────────────────────────────────
if [[ ! -d "$BUNDLE_DIR" ]]; then
  echo "[deploy-latest] ERREUR : bundle dir absent ($BUNDLE_DIR) — exécuter 'pnpm run tauri build' d'abord"
  exit 1
fi

mkdir -p "$DEPLOY_DIR"

# ── Trouver les artifacts (DEB + AppImage) ────────────────────────────────
DEB_PATH="$(ls -1t "$BUNDLE_DIR/deb/titane-infinity_${VERSION}_amd64.deb" 2>/dev/null | head -n1 || true)"
APPIMAGE_PATH="$(ls -1t "$BUNDLE_DIR/appimage/titane-infinity_${VERSION}_amd64.AppImage" 2>/dev/null | head -n1 || true)"

if [[ -z "$DEB_PATH" ]]; then
  # Fallback: prendre le DEB le plus récent
  DEB_PATH="$(ls -1t "$BUNDLE_DIR/deb/"*.deb 2>/dev/null | head -n1 || true)"
  [[ -n "$DEB_PATH" ]] && echo "[deploy-latest] WARN: DEB exact introuvable, fallback -> $(basename "$DEB_PATH")"
fi

if [[ -z "$APPIMAGE_PATH" ]]; then
  APPIMAGE_PATH="$(ls -1t "$BUNDLE_DIR/appimage/"*.AppImage 2>/dev/null | head -n1 || true)"
  [[ -n "$APPIMAGE_PATH" ]] && echo "[deploy-latest] WARN: AppImage exact introuvable, fallback -> $(basename "$APPIMAGE_PATH")"
fi

COPIED=()

# ── Copie DEB ─────────────────────────────────────────────────────────────
if [[ -n "$DEB_PATH" && -f "$DEB_PATH" ]]; then
  DEB_NAME="$(basename "$DEB_PATH")"
  cp -f "$DEB_PATH" "$DEPLOY_DIR/$DEB_NAME"
  COPIED+=("$DEB_NAME")
  echo "[deploy-latest] ✓ DEB  : $DEB_NAME"
else
  echo "[deploy-latest] WARN: aucun DEB trouvé dans $BUNDLE_DIR/deb/"
fi

# ── Copie AppImage ────────────────────────────────────────────────────────
if [[ -n "$APPIMAGE_PATH" && -f "$APPIMAGE_PATH" ]]; then
  APPIMAGE_NAME="$(basename "$APPIMAGE_PATH")"
  cp -f "$APPIMAGE_PATH" "$DEPLOY_DIR/$APPIMAGE_NAME"
  chmod +x "$DEPLOY_DIR/$APPIMAGE_NAME"
  COPIED+=("$APPIMAGE_NAME")
  echo "[deploy-latest] ✓ AppImage : $APPIMAGE_NAME"
else
  echo "[deploy-latest] WARN: aucun AppImage trouvé dans $BUNDLE_DIR/appimage/"
fi

if [[ ${#COPIED[@]} -eq 0 ]]; then
  echo "[deploy-latest] ERREUR : aucun artifact copié — vérifier bundle dir"
  exit 1
fi

# ── VERSION.txt ───────────────────────────────────────────────────────────
echo "$VERSION" > "$DEPLOY_DIR/VERSION.txt"
echo "[deploy-latest] ✓ VERSION.txt -> $VERSION"

# ── SHA256SUMS.txt ────────────────────────────────────────────────────────
SHA_FILE="$DEPLOY_DIR/SHA256SUMS.txt"
{
  echo "# SHA256 — TITANE∞ v$VERSION — $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  for name in "${COPIED[@]}"; do
    sha256sum "$DEPLOY_DIR/$name" | awk '{print $1"  "$2}' | sed "s|$DEPLOY_DIR/||"
  done
} > "$SHA_FILE"
echo "[deploy-latest] ✓ SHA256SUMS.txt"

# ── SIZES.txt ─────────────────────────────────────────────────────────────
SIZES_FILE="$DEPLOY_DIR/SIZES.txt"
{
  echo "# Tailles — TITANE∞ v$VERSION — $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  for name in "${COPIED[@]}"; do
    du -h "$DEPLOY_DIR/$name" | awk '{print $1"\t"$2}' | sed "s|$DEPLOY_DIR/||"
  done
} > "$SIZES_FILE"
echo "[deploy-latest] ✓ SIZES.txt"

# ── MANIFEST.json ─────────────────────────────────────────────────────────
MANIFEST_FILE="$DEPLOY_DIR/MANIFEST.json"
{
  echo "{"
  echo "  \"version\": \"$VERSION\","
  echo "  \"timestamp\": \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\","
  echo "  \"artifacts\": ["
  first=true
  for name in "${COPIED[@]}"; do
    hash="$(sha256sum "$DEPLOY_DIR/$name" | awk '{print $1}')"
    size="$(stat -c%s "$DEPLOY_DIR/$name")"
    [[ "$first" == "true" ]] && first=false || echo ","
    printf '    {"name": "%s", "sha256": "%s", "size": %d}' "$name" "$hash" "$size"
  done
  echo ""
  echo "  ]"
  echo "}"
} > "$MANIFEST_FILE"
echo "[deploy-latest] ✓ MANIFEST.json"

# ── Résumé ────────────────────────────────────────────────────────────────
echo ""
echo "[deploy-latest] === DONE v$VERSION ==="
echo "[deploy-latest] Artifacts copiés dans : $DEPLOY_DIR"
for name in "${COPIED[@]}"; do
  echo "  - $name"
done
