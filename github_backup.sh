#!/usr/bin/env bash
set -euo pipefail

echo "═══════════════════════════════"
echo "   BACKUP TITANE∞ v17 — START  "
echo "═══════════════════════════════"

BACKUP_DIR="$HOME/TITANE_BACKUP_$(date +%Y%m%d_%H%M)"

mkdir -p "$BACKUP_DIR"

echo "[INFO] Sauvegarde vers : $BACKUP_DIR"

# Projet TITANE∞
cp -r "$HOME/Documents/TITANE_NEWGEN" "$BACKUP_DIR/"

# Rust
cp -r "$HOME/.cargo" "$BACKUP_DIR/.cargo"
cp -r "$HOME/.rustup" "$BACKUP_DIR/.rustup"

# Tauri
mkdir -p "$BACKUP_DIR/tauri"
cp -r "$HOME/.local/share/tauri" "$BACKUP_DIR/tauri" || true

# Node / npm
cp -r "$HOME/.npm" "$BACKUP_DIR/.npm" || true

# Scripts
cp -r "$HOME/scripts" "$BACKUP_DIR/scripts" || true

# Config générale
cp -r "$HOME/.config" "$BACKUP_DIR/.config"

echo "═══════════════════════════════"
echo "   BACKUP TITANE∞ v17 — DONE   "
echo "═══════════════════════════════"

echo "[OK] Sauvegarde complète terminée."
echo "[Chemin] $BACKUP_DIR"
