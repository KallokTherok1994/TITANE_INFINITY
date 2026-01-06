#!/bin/bash
# TITANE∞ Network Dev Tunnel - Start Script v1.0
# Expose TITANE∞ dev server on LAN + Internet via Cloudflare Tunnel

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Non-interactive console controls
# - NON_INTERACTIVE=1 : no prompts
# - AUTO_START_WEB=1  : start web dev server automatically if not running
# - AUTO_INSTALL_CLOUDFLARED=1 : attempt install (requires sudo)
NON_INTERACTIVE="${NON_INTERACTIVE:-0}"
AUTO_START_WEB="${AUTO_START_WEB:-1}"
AUTO_INSTALL_CLOUDFLARED="${AUTO_INSTALL_CLOUDFLARED:-0}"

echo "🌐 TITANE∞ NETWORK DEV TUNNEL - START"
echo "======================================"
echo ""

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')
DEV_PORT=5173

echo "📍 Local IP: $LOCAL_IP"
echo "🔌 Dev Port: $DEV_PORT"
echo ""

# Check if Vite dev server is running
if ! curl -s http://localhost:$DEV_PORT > /dev/null 2>&1; then
    echo "⚠️  Vite dev server not detected on port $DEV_PORT"
    echo "💡 Suggested: start web dev server (no Tauri)"
    echo "   bash ./deploy-http-server-pure.sh"
    echo ""

    if [[ "$AUTO_START_WEB" == "1" ]]; then
        echo "🚀 Starting web dev server (Vite standalone)..."
        NON_INTERACTIVE=1 AUTO_KILL_PORT=1 ENABLE_TUNNEL=0 bash ./deploy-http-server-pure.sh >/dev/null 2>&1 || true
        echo "⏳ Waiting for Vite server..."
        sleep 4
    fi

    if ! curl -s http://localhost:$DEV_PORT > /dev/null 2>&1; then
        if [[ "$NON_INTERACTIVE" == "1" ]]; then
            echo "❌ Dev server still not running. Start it first:" 
            echo "   bash ./deploy-http-server-pure.sh"
            exit 1
        fi

        read -p "Start web dev server now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🚀 Starting web dev server..."
            bash ./deploy-http-server-pure.sh
            echo "⏳ Waiting for Vite server..."
            sleep 4
        else
            echo "❌ Tunnel requires running dev server. Exiting."
            exit 1
        fi
    fi
fi

echo "✅ Vite dev server detected"
echo ""

# LAN Access
echo "📡 LAN ACCESS:"
echo "   Local:  http://localhost:$DEV_PORT"
echo "   LAN:    http://$LOCAL_IP:$DEV_PORT"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "⚠️  cloudflared not installed"
    echo "💡 Install: wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared-linux-amd64.deb"
    echo ""
    if [[ "$NON_INTERACTIVE" == "1" && "$AUTO_INSTALL_CLOUDFLARED" != "1" ]]; then
        echo "❌ NON_INTERACTIVE: cloudflared manquant. Installez-le puis relancez."
        exit 1
    fi

    if [[ "$AUTO_INSTALL_CLOUDFLARED" == "1" ]]; then
        REPLY="y"
    else
        read -p "Install cloudflared now? (y/n) " -n 1 -r
        echo
    fi

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📥 Installing cloudflared..."
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -O /tmp/cloudflared.deb
        sudo dpkg -i /tmp/cloudflared.deb
        rm /tmp/cloudflared.deb
        echo "✅ cloudflared installed"
    else
        echo "⏭️  Skipping internet tunnel (LAN only)"
        echo ""
        echo "🎯 ACCESS URLS:"
        echo "   Local:  http://localhost:$DEV_PORT"
        echo "   LAN:    http://$LOCAL_IP:$DEV_PORT"
        exit 0
    fi
fi

# Start cloudflared tunnel
echo "🌍 INTERNET TUNNEL:"
echo "   Starting cloudflared tunnel..."
echo ""

# Create logs directory
mkdir -p "$ROOT_DIR/logs/network"

# Start tunnel in background and capture URL
cloudflared tunnel --url http://localhost:$DEV_PORT > "$ROOT_DIR/logs/network/tunnel.log" 2>&1 &
TUNNEL_PID=$!

echo "⏳ Waiting for tunnel URL..."
sleep 5

# Extract tunnel URL from logs
TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$ROOT_DIR/logs/network/tunnel.log" | head -1)

if [ -n "$TUNNEL_URL" ]; then
    echo "✅ Tunnel active"
    echo ""
    echo "🎯 ACCESS URLS:"
    echo "   Local:     http://localhost:$DEV_PORT"
    echo "   LAN:       http://$LOCAL_IP:$DEV_PORT"
    echo "   Internet:  $TUNNEL_URL"
    echo ""
    echo "📝 Tunnel PID: $TUNNEL_PID"
    echo "📊 Logs: logs/network/tunnel.log"
    echo ""
    echo "⚠️  SECURITY WARNING:"
    echo "   - Dev mode only (CSP relaxed)"
    echo "   - Don't share URL publicly"
    echo "   - Stop tunnel when done: ./scripts/network/stop-tunnel.sh"
    echo ""
    
    # Save tunnel info
    echo "$TUNNEL_PID" > "$ROOT_DIR/logs/network/tunnel.pid"
    echo "$TUNNEL_URL" > "$ROOT_DIR/logs/network/tunnel.url"
    echo "$(date '+%Y-%m-%d %H:%M:%S')" > "$ROOT_DIR/logs/network/tunnel.start"
    
    echo "✅ Tunnel started successfully"
else
    echo "❌ Failed to get tunnel URL"
    echo "📊 Check logs: logs/network/tunnel.log"
    kill $TUNNEL_PID 2>/dev/null || true
    exit 1
fi
