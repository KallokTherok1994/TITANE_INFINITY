#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ Remote Access — Quick Start
#   Starts TITANE with remote gateway enabled + Cloudflare tunnel
#   Usage: TITANE_REMOTE_SECRET=my-strong-secret bash scripts/remote/quick-start-remote.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

: "${TITANE_REMOTE_SECRET:?❌ TITANE_REMOTE_SECRET must be set. Example: export TITANE_REMOTE_SECRET=my-strong-secret}"
: "${TITANE_SECRETS_PASSPHRASE:=$(echo "dev-default-passphrase")}"

export TITANE_REMOTE_ENABLED=1
export TITANE_REMOTE_PORT="${TITANE_REMOTE_PORT:-7420}"
export TITANE_REMOTE_ORIGIN="${TITANE_REMOTE_ORIGIN:-*}"

echo "══════════════════════════════════════════════════════════"
echo "  TITANE∞ Remote Access — Quick Start"
echo ""
echo "  Remote Port   : ${TITANE_REMOTE_PORT}"
echo "  CORS Origin   : ${TITANE_REMOTE_ORIGIN}"
echo "  Secret set    : ✅"
echo "══════════════════════════════════════════════════════════"
echo ""

# Check if TITANE is installed
if command -v titane-infinity &>/dev/null; then
    echo "[quick-start] Starting titane-infinity with remote gateway..."
    titane-infinity &
    TITANE_PID=$!
    sleep 3
elif [[ -f "src-tauri/target/release/titane-infinity" ]]; then
    echo "[quick-start] Starting from build output..."
    ./src-tauri/target/release/titane-infinity &
    TITANE_PID=$!
    sleep 3
else
    echo "[quick-start] ⚠️  titane-infinity not found in PATH or build output."
    echo "              Build first: pnpm run tauri build"
    echo "              Or install the DEB: sudo dpkg -i deployment/latest/*.deb"
    exit 1
fi

# Start tunnel
echo "[quick-start] Starting Cloudflare tunnel..."
bash "$(dirname "$0")/start-tunnel.sh"

echo ""
echo "[quick-start] ✅ Remote access started. Kill with Ctrl+C."
wait $TITANE_PID
