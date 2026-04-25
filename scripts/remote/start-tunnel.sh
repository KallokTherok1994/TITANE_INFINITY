#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ Remote Access — Start Cloudflare Tunnel
#   Usage: bash scripts/remote/start-tunnel.sh
#   Keeps the tunnel running in the foreground (use screen/tmux or systemd for persistent run).
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

CONFIG_FILE="${HOME}/.cloudflared/titane-tunnel.yml"
TUNNEL_NAME="${TITANE_TUNNEL_NAME:-titane-remote}"
LOCAL_PORT="${TITANE_REMOTE_PORT:-7420}"

check_titane_running() {
    local retries=0
    echo "[start-tunnel] Checking TITANE remote gateway on port ${LOCAL_PORT}..."
    while [[ $retries -lt 5 ]]; do
        if curl -sf "http://127.0.0.1:${LOCAL_PORT}/api/health" &>/dev/null; then
            echo "[start-tunnel] ✅ TITANE gateway responding on port ${LOCAL_PORT}"
            return 0
        fi
        retries=$((retries + 1))
        echo "[start-tunnel] ⏳ Waiting for gateway (attempt ${retries}/5)..."
        sleep 2
    done
    echo "[start-tunnel] ⚠️  Gateway not responding on port ${LOCAL_PORT}."
    echo "               Start TITANE with TITANE_REMOTE_ENABLED=1 first."
    echo "               Continuing tunnel startup anyway..."
}

print_urls() {
    # Try to get the quick-tunnel URL from cloudflared output
    echo "[start-tunnel] 🌐 Tunnel starting..."
    echo ""
    echo "  Once the tunnel is ready, you will see the public URL above."
    echo "  If you configured a custom domain:"
    echo "    → https://titane.yourdomain.com"
    echo ""
    echo "  Use this URL to access TITANE from any browser on the internet."
    echo "  Open: https://<your-url>/  and enter your TITANE_REMOTE_SECRET"
    echo ""
}

main() {
    if ! command -v cloudflared &>/dev/null; then
        echo "[start-tunnel] ❌ cloudflared not found. Run: bash scripts/remote/install-cloudflare-tunnel.sh"
        exit 1
    fi

    check_titane_running

    if [[ -f "$CONFIG_FILE" ]]; then
        print_urls
        exec cloudflared tunnel --config "$CONFIG_FILE" run
    else
        # Quick tunnel mode (no account needed) — for quick testing
        echo "[start-tunnel] ℹ️  No tunnel config found — starting quick tunnel (temporary URL)"
        echo "[start-tunnel]    For permanent URL, run: bash scripts/remote/setup-tunnel.sh"
        echo ""
        print_urls
        exec cloudflared tunnel --url "http://127.0.0.1:${LOCAL_PORT}"
    fi
}

main "$@"
