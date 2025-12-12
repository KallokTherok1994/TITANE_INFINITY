#!/bin/bash
# TITANE∞ Network Dev Tunnel - Stop Script v1.0
# Stop cloudflared tunnel and cleanup

set -e

echo "🛑 TITANE∞ NETWORK DEV TUNNEL - STOP"
echo "====================================="
echo ""

# Check if tunnel is running
if [ ! -f logs/network/tunnel.pid ]; then
    echo "⚠️  No active tunnel found"
    exit 0
fi

TUNNEL_PID=$(cat logs/network/tunnel.pid)
TUNNEL_URL=$(cat logs/network/tunnel.url 2>/dev/null || echo "unknown")
TUNNEL_START=$(cat logs/network/tunnel.start 2>/dev/null || echo "unknown")

echo "📝 Tunnel Info:"
echo "   PID: $TUNNEL_PID"
echo "   URL: $TUNNEL_URL"
echo "   Started: $TUNNEL_START"
echo ""

# Kill tunnel process
if kill -0 $TUNNEL_PID 2>/dev/null; then
    echo "🔪 Stopping tunnel (PID $TUNNEL_PID)..."
    kill $TUNNEL_PID
    sleep 2
    
    # Force kill if still running
    if kill -0 $TUNNEL_PID 2>/dev/null; then
        echo "⚠️  Force killing..."
        kill -9 $TUNNEL_PID 2>/dev/null || true
    fi
    
    echo "✅ Tunnel stopped"
else
    echo "⚠️  Tunnel process already stopped"
fi

# Cleanup
rm -f logs/network/tunnel.pid
rm -f logs/network/tunnel.url
rm -f logs/network/tunnel.start

echo ""
echo "📊 Logs preserved: logs/network/tunnel.log"
echo "🔒 Remote access disabled"
echo ""
echo "✅ Cleanup complete"
