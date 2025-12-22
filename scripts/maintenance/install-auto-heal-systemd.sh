#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SYSTEMD_USER_DIR="$HOME/.config/systemd/user"

echo "🔧 Installing TITANE∞ auto-heal systemd user service & timer..."
mkdir -p "$SYSTEMD_USER_DIR"

cp -f "$REPO_ROOT/scripts/systemd/titane-auto-heal.service" "$SYSTEMD_USER_DIR/"
cp -f "$REPO_ROOT/scripts/systemd/titane-auto-heal.timer" "$SYSTEMD_USER_DIR/"

systemctl --user daemon-reload
systemctl --user enable --now titane-auto-heal.timer

echo "✅ Installed & started: titane-auto-heal.timer"
echo "ℹ Check status: systemctl --user status titane-auto-heal.timer"
echo "ℹ Logs (last runs): journalctl --user -u titane-auto-heal.service --since '1 hour ago'"
