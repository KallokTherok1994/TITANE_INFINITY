#!/bin/bash
# TITANE∞ - Post-build: Synchronisation lanceurs, icônes, cache desktop, et binaire
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BIN_SRC="$ROOT_DIR/src-tauri/target/release/titane-infinity"
BIN_DST="/usr/bin/titane-infinity"
DESKTOP_SRC="$ROOT_DIR/titane-infinity.desktop"
SYSTEM_DESKTOP_DIR="/usr/share/applications"
SYSTEM_DESKTOP_DST1="$SYSTEM_DESKTOP_DIR/titane-infinity.desktop"
SYSTEM_ICON_SRC="$ROOT_DIR/src-tauri/icons/128x128.png"
SYSTEM_ICON_DIR="/usr/share/icons/hicolor/128x128/apps"
SYSTEM_ICON_DST="$SYSTEM_ICON_DIR/titane-infinity.png"
CANONICAL_VERSION="$(node -p "require('./package.json').version")"

# 1. Copier le binaire le plus récent
if [ -f "$BIN_SRC" ]; then
  sudo killall titane-infinity 2>/dev/null || true
  sudo cp "$BIN_SRC" "$BIN_DST"
  sudo chmod 755 "$BIN_DST"
fi

# 2. Générer un launcher desktop aligné sur le binaire/version réellement sélectionnés
bash "$ROOT_DIR/scripts/update-desktop-icon.sh"

# 3. Répliquer le launcher généré au niveau système pour éviter les divergences menu local/global
if [ -f "$DESKTOP_SRC" ]; then
  sudo install -Dm644 "$DESKTOP_SRC" "$SYSTEM_DESKTOP_DST1"
  sudo rm -f "$SYSTEM_DESKTOP_DIR/TITANE-Infinity.desktop"
fi

if [ -f "$SYSTEM_ICON_SRC" ]; then
  sudo install -Dm644 "$SYSTEM_ICON_SRC" "$SYSTEM_ICON_DST"
fi

# 4. Rafraîchir les caches desktop
update-desktop-database "$HOME/.local/share/applications"
sudo update-desktop-database "$SYSTEM_DESKTOP_DIR"
sudo update-icon-caches /usr/share/icons/hicolor 2>/dev/null || true
xdg-desktop-menu forceupdate || true

echo "[TITANE∞] Post-build: lanceurs, icônes, cache desktop et binaire synchronisés."

# 5. Vérification binaire installée
if [ -f "$BIN_SRC" ] && [ -f "$BIN_DST" ] && cmp -s "$BIN_SRC" "$BIN_DST"; then
  echo "[TITANE∞] Binaire installé synchronisé avec la build locale (version canonique: $CANONICAL_VERSION)"
else
  echo "[TITANE∞] ERREUR: /usr/bin/titane-infinity ne correspond pas à la build locale attendue" >&2
  exit 1
fi
