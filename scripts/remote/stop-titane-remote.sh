#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#   TITANE∞ Remote Gateway — Stop Script
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOGS_DIR="$ROOT_DIR/logs/remote"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo "🛑 Stopping TITANE∞ Remote Gateway..."

SESSION_ENV="$LOGS_DIR/session.env"
if [[ -f "$SESSION_ENV" ]]; then
    # shellcheck disable=SC1090
    source "$SESSION_ENV"

    if [[ -n "${TITANE_PID:-}" ]] && ps -p "$TITANE_PID" >/dev/null 2>&1; then
        kill "$TITANE_PID" 2>/dev/null || true
        echo -e "${GREEN}✓ TITANE process $TITANE_PID stopped${NC}"
    fi

    if [[ -n "${TUNNEL_PID:-}" ]] && ps -p "$TUNNEL_PID" >/dev/null 2>&1; then
        kill "$TUNNEL_PID" 2>/dev/null || true
        echo -e "${GREEN}✓ Tunnel process $TUNNEL_PID stopped${NC}"
    fi

    rm -f "$SESSION_ENV" "$LOGS_DIR/titane.pid" "$LOGS_DIR/tunnel.pid"
else
    # Fallback: kill by port
    REMOTE_PORT="${TITANE_REMOTE_PORT:-7420}"
    if lsof -Pi :"$REMOTE_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti :"$REMOTE_PORT" | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✓ Port $REMOTE_PORT freed${NC}"
    fi
    # Kill any cloudflared tunnels
    pkill -f 'cloudflared tunnel' 2>/dev/null || true
fi

echo -e "${YELLOW}TITANE∞ Remote Gateway stopped.${NC}"
