#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#   TITANE∞ Remote Gateway — Start Script
#   Expose TITANE∞ AI engine over HTTPS via Cloudflare Tunnel
#   Auth: shared secret → JWT  |  Port: 7420 (axum gateway)
#
#   Usage:
#     TITANE_REMOTE_SECRET="your-secret-min32chars" bash scripts/remote/start-titane-remote.sh
#
#   Optional env vars:
#     TITANE_REMOTE_PORT         (default: 7420)
#     TITANE_REMOTE_ORIGIN       (default: *, set to tunnel URL for prod)
#     TITANE_SECRETS_PASSPHRASE  (default: auto-generated)
#     OLLAMA_BASE_URL            (default: http://127.0.0.1:11434)
#     OLLAMA_DEFAULT_MODEL       (default: gemma2:2b)
#     NO_TUNNEL=1                (skip cloudflared — API-only mode)
#     TITANE_BINARY              (path to titane-infinity binary)
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

LOGS_DIR="$ROOT_DIR/logs/remote"
mkdir -p "$LOGS_DIR"

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; MAGENTA='\033[0;35m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ REMOTE GATEWAY — Online Intelligence Launcher     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── 1. Validate TITANE_REMOTE_SECRET ─────────────────────────
TITANE_REMOTE_SECRET="${TITANE_REMOTE_SECRET:-}"
if [[ -z "$TITANE_REMOTE_SECRET" ]]; then
    echo -e "${RED}❌ TITANE_REMOTE_SECRET is not set.${NC}"
    echo ""
    echo "  Generate a strong secret:"
    echo "    openssl rand -base64 32"
    echo ""
    echo "  Then run:"
    echo "    TITANE_REMOTE_SECRET=\"your-secret\" bash scripts/remote/start-titane-remote.sh"
    exit 1
fi

if [[ ${#TITANE_REMOTE_SECRET} -lt 32 ]]; then
    echo -e "${RED}❌ TITANE_REMOTE_SECRET must be at least 32 characters (got ${#TITANE_REMOTE_SECRET}).${NC}"
    echo "  Generate: openssl rand -base64 32"
    exit 1
fi

echo -e "${GREEN}✓ Secret validated (${#TITANE_REMOTE_SECRET} chars)${NC}"

# ── 2. Resolve TITANE binary ──────────────────────────────────
TITANE_BINARY="${TITANE_BINARY:-}"
if [[ -z "$TITANE_BINARY" ]]; then
    # Try release first, then debug
    if [[ -x "$ROOT_DIR/src-tauri/target/release/titane-infinity" ]]; then
        TITANE_BINARY="$ROOT_DIR/src-tauri/target/release/titane-infinity"
    elif [[ -x "$ROOT_DIR/src-tauri/target/debug/titane-infinity" ]]; then
        TITANE_BINARY="$ROOT_DIR/src-tauri/target/debug/titane-infinity"
    elif [[ -x "/usr/bin/titane-infinity" ]]; then
        TITANE_BINARY="/usr/bin/titane-infinity"
    else
        echo -e "${RED}❌ TITANE binary not found. Set TITANE_BINARY= or build first.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Binary: $TITANE_BINARY${NC}"

# ── 3. Compose env vars ───────────────────────────────────────
REMOTE_PORT="${TITANE_REMOTE_PORT:-7420}"
SECRETS_PASSPHRASE="${TITANE_SECRETS_PASSPHRASE:-$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)}"
OLLAMA_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_DEFAULT_MODEL:-gemma2:2b}"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Gateway port:  $REMOTE_PORT"
echo "   Ollama URL:    $OLLAMA_URL"
echo "   Ollama model:  $OLLAMA_MODEL"
echo ""

# ── 4. Kill any existing gateway on that port ─────────────────
if lsof -Pi :"$REMOTE_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $REMOTE_PORT in use — killing existing process...${NC}"
    lsof -ti :"$REMOTE_PORT" | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# ── 5. Launch TITANE with remote gateway enabled ──────────────
TITANE_LOG="$LOGS_DIR/titane-remote-$(date +%Y%m%d-%H%M%S).log"

echo -e "${CYAN}🚀 Starting TITANE∞ Remote Gateway...${NC}"

TITANE_REMOTE_ENABLED=1 \
TITANE_REMOTE_SECRET="$TITANE_REMOTE_SECRET" \
TITANE_REMOTE_PORT="$REMOTE_PORT" \
TITANE_SECRETS_PASSPHRASE="$SECRETS_PASSPHRASE" \
CONVOS_MEMORY_LTM=1 \
OLLAMA_BASE_URL="$OLLAMA_URL" \
OLLAMA_DEFAULT_MODEL="$OLLAMA_MODEL" \
"$TITANE_BINARY" > "$TITANE_LOG" 2>&1 &

TITANE_PID=$!
echo "$TITANE_PID" > "$LOGS_DIR/titane.pid"
echo -e "${YELLOW}⏳ TITANE PID: $TITANE_PID — waiting for gateway to come up...${NC}"

# ── 6. Wait for /api/health ────────────────────────────────────
MAX_RETRIES=30
RETRY=0
GATEWAY_READY=false

while [[ $RETRY -lt $MAX_RETRIES ]]; do
    if curl -fsS "http://127.0.0.1:$REMOTE_PORT/api/health" >/dev/null 2>&1; then
        GATEWAY_READY=true
        break
    fi
    # Check if process died
    if ! ps -p "$TITANE_PID" > /dev/null 2>&1; then
        echo -e "${RED}❌ TITANE process died. Check logs: $TITANE_LOG${NC}"
        tail -n 30 "$TITANE_LOG" || true
        exit 1
    fi
    RETRY=$((RETRY + 1))
    sleep 1
done

if [[ "$GATEWAY_READY" != "true" ]]; then
    echo -e "${RED}❌ Gateway did not respond after ${MAX_RETRIES}s. Check logs: $TITANE_LOG${NC}"
    tail -n 30 "$TITANE_LOG" || true
    exit 1
fi

echo -e "${GREEN}✓ Remote Gateway is UP on port $REMOTE_PORT${NC}"

# ── 7. Test auth endpoint ─────────────────────────────────────
AUTH_RESP=$(curl -fsS -X POST "http://127.0.0.1:$REMOTE_PORT/api/auth/token" \
    -H "Content-Type: application/json" \
    -d "{\"secret\":\"$TITANE_REMOTE_SECRET\"}" 2>/dev/null || echo '{}')

if echo "$AUTH_RESP" | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ Auth endpoint: OK${NC}"
else
    echo -e "${YELLOW}⚠️  Auth endpoint returned unexpected: $AUTH_RESP${NC}"
fi

# ── 8. Cloudflare Tunnel ──────────────────────────────────────
NO_TUNNEL="${NO_TUNNEL:-0}"
TUNNEL_URL=""
TUNNEL_PID=""

if [[ "$NO_TUNNEL" == "1" ]]; then
    echo -e "${YELLOW}⊘  NO_TUNNEL=1 — skipping Cloudflare tunnel${NC}"
else
    if ! command -v cloudflared >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  cloudflared not installed — API accessible on LAN only${NC}"
        echo "   Install: sudo apt install cloudflared"
    else
        echo -e "${CYAN}🌐 Starting Cloudflare Tunnel...${NC}"
        TUNNEL_LOG="$LOGS_DIR/tunnel-$(date +%Y%m%d-%H%M%S).log"

        cloudflared tunnel --url "http://127.0.0.1:$REMOTE_PORT" > "$TUNNEL_LOG" 2>&1 &
        TUNNEL_PID=$!
        echo "$TUNNEL_PID" > "$LOGS_DIR/tunnel.pid"

        echo -e "${YELLOW}⏳ Waiting for tunnel URL...${NC}"
        MAX_TUNNEL=30
        RETRY_T=0
        while [[ $RETRY_T -lt $MAX_TUNNEL ]]; do
            TUNNEL_URL=$(grep -oP 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -1 || true)
            if [[ -n "$TUNNEL_URL" ]]; then
                break
            fi
            RETRY_T=$((RETRY_T + 1))
            sleep 1
        done

        if [[ -n "$TUNNEL_URL" ]]; then
            echo "$TUNNEL_URL" > "$LOGS_DIR/tunnel.url"
            echo -e "${GREEN}✓ Tunnel URL: $TUNNEL_URL${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not extract tunnel URL from logs. Check: $TUNNEL_LOG${NC}"
        fi
    fi
fi

# ── 9. Summary ────────────────────────────────────────────────
LOCAL_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || echo '127.0.0.1')"

echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   TITANE∞ REMOTE GATEWAY — ACTIVE${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📡 Endpoints:${NC}"
echo "   Local:   http://127.0.0.1:$REMOTE_PORT"
echo "   LAN:     http://$LOCAL_IP:$REMOTE_PORT"
if [[ -n "$TUNNEL_URL" ]]; then
    echo "   Online:  $TUNNEL_URL"
fi
echo ""
echo -e "${CYAN}🔑 Your TITANE API Key:${NC}"
echo "   TITANE_REMOTE_SECRET = (the value you provided)"
echo ""
echo -e "${CYAN}📋 Test commands:${NC}"
BASE_URL="${TUNNEL_URL:-http://127.0.0.1:$REMOTE_PORT}"
echo ""
echo "  # 1. Get a JWT token:"
echo "  TOKEN=\$(curl -fsS -X POST '$BASE_URL/api/auth/token' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"secret\":\"YOUR_TITANE_REMOTE_SECRET\"}' | jq -r .access_token)"
echo ""
echo "  # 2. Chat with TITANE:"
echo "  curl -fsS -X POST '$BASE_URL/api/invoke' \\"
echo "    -H \"Authorization: Bearer \$TOKEN\" \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"command\":\"conversation_generate\",\"payload\":{\"message\":\"Bonjour TITANE!\",\"conversation_id\":\"mobile-001\",\"mode\":\"default\"}}'"
echo ""
echo -e "${CYAN}📂 Logs:${NC}"
echo "   TITANE:  $TITANE_LOG"
[[ -n "$TUNNEL_PID" ]] && echo "   Tunnel:  $LOGS_DIR/tunnel-*.log"
echo ""
echo -e "${YELLOW}🛑 To stop: bash scripts/remote/stop-titane-remote.sh${NC}"
echo ""

# Keep PIDs file
{
    echo "TITANE_PID=$TITANE_PID"
    echo "TUNNEL_PID=${TUNNEL_PID:-}"
    echo "REMOTE_PORT=$REMOTE_PORT"
    echo "STARTED_AT=$(date -Iseconds)"
    echo "TUNNEL_URL=${TUNNEL_URL:-}"
    echo "TITANE_LOG=$TITANE_LOG"
} > "$LOGS_DIR/session.env"

echo -e "${GREEN}✅ DONE — TITANE∞ is online and intelligent!${NC}"
