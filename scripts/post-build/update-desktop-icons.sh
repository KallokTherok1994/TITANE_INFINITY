#!/bin/bash
# TITANE∞ - Post-build: Synchronisation lanceurs, icônes, cache desktop, et binaire
set -e

BIN_SRC="$(dirname "$0")/../../src-tauri/target/release/titane-infinity"
BIN_DST="/usr/bin/titane-infinity"
DESKTOP_SRC1="$(dirname "$0")/../../titane-infinity.desktop"
DESKTOP_SRC2="$(dirname "$0")/../../titane-infinity.desktop"
DESKTOP_DST1="$HOME/.local/share/applications/titane-infinity.desktop"
DESKTOP_DST2="$HOME/.local/share/applications/TITANE-Infinity.desktop"
ICON_SRC="$(dirname "$0")/../../src-tauri/icons/128x128.png"
ICON_DST="$HOME/.local/share/icons/hicolor/128x128/apps/titane-infinity.png"

# 1. Copier le binaire le plus récent
if [ -f "$BIN_SRC" ]; then
  sudo killall titane-infinity 2>/dev/null || true
  sudo cp "$BIN_SRC" "$BIN_DST"
  sudo chmod 755 "$BIN_DST"
fi

# 2. Copier les lanceurs .desktop
install -Dm644 "$DESKTOP_SRC1" "$DESKTOP_DST1"
install -Dm644 "$DESKTOP_SRC2" "$DESKTOP_DST2"

# 3. Copier l’icône
install -Dm644 "$ICON_SRC" "$ICON_DST"

# 4. Rafraîchir les caches desktop
update-desktop-database "$HOME/.local/share/applications"
sudo update-icon-caches /usr/share/icons/* "$HOME/.local/share/icons/*" 2>/dev/null || true
xdg-desktop-menu forceupdate || true

echo "[TITANE∞] Post-build: lanceurs, icônes, cache desktop et binaire synchronisés."

# 5. Vérification version binaire
BIN_VER=$("$BIN_DST" --version 2>&1 | head -n1)
echo "[TITANE∞] Version binaire installée: $BIN_VER"
