#!/bin/bash
# TITANE∞ - Post-build: Synchronisation lanceurs, icônes, cache desktop, et binaire
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BIN_SRC="$ROOT_DIR/src-tauri/target/release/titane-infinity"
BIN_DST="/usr/bin/titane-infinity"
DESKTOP_SRC="$ROOT_DIR/titane-infinity.desktop"
SYSTEM_DESKTOP_DIR="/usr/share/applications"
SYSTEM_DESKTOP_DST1="$SYSTEM_DESKTOP_DIR/titane-infinity.desktop"
CANONICAL_VERSION="$(node -p "require('./package.json').version")"
ICON_RESOLUTIONS=(128 256 512)
SYSTEM_ICON_DIR="/usr/share/icons/hicolor"
SYSTEM_ICON_DST="$SYSTEM_ICON_DIR/titane-infinity.png"
SYSTEM_SYNC_STATUS="SKIPPED"
BINARY_SYNC_STATUS="SKIPPED"

run_with_root_if_available() {
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    "$@"
    return 0
  fi

  if command -v sudo >/dev/null 2>&1 && sudo -n true >/dev/null 2>&1; then
    sudo "$@"
    return 0
  fi

  return 1
}

install_system_icon_resolution() {
  local resolution="$1"
  local icon_source="$ROOT_DIR/src-tauri/icons/${resolution}x${resolution}.png"
  local system_icon_dir="$SYSTEM_ICON_DIR/${resolution}x${resolution}/apps"

  if [ -f "$icon_source" ]; then
    run_with_root_if_available install -Dm644 "$icon_source" "$system_icon_dir/titane-infinity.png"
  fi
}

# 1. Copier le binaire le plus récent
if [ -f "$BIN_SRC" ]; then
  if run_with_root_if_available killall titane-infinity 2>/dev/null || true; then
    :
  fi

  if run_with_root_if_available cp "$BIN_SRC" "$BIN_DST" &&
    run_with_root_if_available chmod 755 "$BIN_DST"; then
    BINARY_SYNC_STATUS="UPDATED"
  else
    BINARY_SYNC_STATUS="BLOCKED_SUDO_REQUIRED"
  fi
fi

# 2. Générer un launcher desktop aligné sur le binaire/version réellement sélectionnés
bash "$ROOT_DIR/scripts/update-desktop-icon.sh"

# 3. Répliquer le launcher généré au niveau système pour éviter les divergences menu local/global
if [ -f "$DESKTOP_SRC" ]; then
  if run_with_root_if_available install -Dm644 "$DESKTOP_SRC" "$SYSTEM_DESKTOP_DST1"; then
    run_with_root_if_available rm -f "$SYSTEM_DESKTOP_DIR/TITANE-Infinity.desktop" || true
    SYSTEM_SYNC_STATUS="UPDATED"
  else
    SYSTEM_SYNC_STATUS="BLOCKED_SUDO_REQUIRED"
  fi
fi

if [ "$SYSTEM_SYNC_STATUS" = "UPDATED" ]; then
  for resolution in "${ICON_RESOLUTIONS[@]}"; do
    install_system_icon_resolution "$resolution" || true
  done
elif [ "$SYSTEM_SYNC_STATUS" = "SKIPPED" ]; then
  SYSTEM_SYNC_STATUS="BLOCKED_SUDO_REQUIRED"
fi

# 4. Rafraîchir les caches desktop
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
if [ "$SYSTEM_SYNC_STATUS" = "UPDATED" ]; then
  run_with_root_if_available update-desktop-database "$SYSTEM_DESKTOP_DIR" 2>/dev/null || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
  if [ "$SYSTEM_SYNC_STATUS" = "UPDATED" ]; then
    run_with_root_if_available gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true
  fi
fi
xdg-desktop-menu forceupdate || true

echo "[TITANE∞] Post-build: launcher local et caches utilisateur synchronisés."
echo "[TITANE∞] Post-build: sync système=$SYSTEM_SYNC_STATUS, sync binaire=$BINARY_SYNC_STATUS"

# 5. Vérification binaire installée
if [ -f "$BIN_SRC" ] && [ -f "$BIN_DST" ] && cmp -s "$BIN_SRC" "$BIN_DST"; then
  echo "[TITANE∞] Binaire installé synchronisé avec la build locale (version canonique: $CANONICAL_VERSION)"
elif [ "$BINARY_SYNC_STATUS" = "BLOCKED_SUDO_REQUIRED" ]; then
  echo "[TITANE∞] AVERTISSEMENT: /usr/bin/titane-infinity non synchronisé; sudo non interactif requis." >&2
else
  echo "[TITANE∞] ERREUR: /usr/bin/titane-infinity ne correspond pas à la build locale attendue" >&2
  exit 1
fi
