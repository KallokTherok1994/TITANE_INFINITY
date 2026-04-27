#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#   TITANE∞ Remote Gateway — Status Script
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOGS_DIR="$ROOT_DIR/logs/remote"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}TITANE∞ Remote Gateway — Status${NC}"
echo "=================================="

SESSION_ENV="$LOGS_DIR/session.env"
if [[ ! -f "$SESSION_ENV" ]]; then
    echo -e "${YELLOW}No session.env found — gateway may not be running.${NC}"
else
    source "$SESSION_ENV"
    echo "  Started:  ${STARTED_AT:-unknown}"
    echo "  PID:      ${TITANE_PID:-unknown}"
    echo "  Port:     ${REMOTE_PORT:-7420}"
    echo "  Tunnel:   ${TUNNEL_URL:-none}"
fi

PORT="${REMOTE_PORT:-7420}"
echo ""
echo -n "  HTTP health:  "
if curl -fsS --max-time 3 "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
    echo -e "${GREEN}UP (port $PORT)${NC}"
else
    echo -e "${RED}DOWN (port $PORT)${NC}"
fi

if [[ -n "${TUNNEL_URL:-}" ]]; then
    echo -n "  Tunnel health: "
    if curl -fsS --max-time 5 "$TUNNEL_URL/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}UP${NC}"
    else
        echo -e "${YELLOW}UNREACHABLE (may be initializing)${NC}"
    fi
fi

if [[ -f "$LOGS_DIR/tunnel.url" ]]; then
    TUNNEL_URL_FILE="$(cat "$LOGS_DIR/tunnel.url" 2>/dev/null || echo '')"
    echo "  Tunnel URL (file): $TUNNEL_URL_FILE"
fi
