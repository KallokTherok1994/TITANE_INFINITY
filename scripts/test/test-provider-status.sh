#!/usr/bin/env bash
# Test provider status via Tauri IPC
# v27 FIX verification script

set -euo pipefail

echo "🧪 Test Provider Status v27"
echo "═══════════════════════════════════════"

# Check if runtime is running
if ! pgrep -f "target/debug/titane-infinity" > /dev/null 2>&1; then
    echo "❌ Runtime not running. Start with: pnpm run dev:tauri"
    exit 1
fi

echo "✅ Runtime is active"

# Use curl to test if Vite is running
if ! curl -fsS http://127.0.0.1:5173 >/dev/null 2>&1; then
    echo "⚠️  Vite frontend not responding on :5173"
else
    echo "✅ Vite frontend is active"
fi

echo ""
echo "📋 Manual test steps:"
echo "1. Open TITANE app (should be running)"
echo "2. Open browser DevTools (F12)"
echo "3. Run in console:"
echo ""
echo "   await window.__TAURI__.core.invoke('chat_check_providers')"
echo ""
echo "4. Expected output:"
echo "   ["
echo "     { provider: 'openai', available: true|false, ... },"
echo "     { provider: 'anthropic', available: true|false, ... },"
echo "     { provider: 'gemini', available: true|false, ... },"
echo "     { provider: 'ollama', available: true|false, ... }"
echo "   ]"
echo ""
echo "5. Check footer in Menu (bottom left):"
echo "   Should display: 'IA online: X% (N/4)'"
echo ""
echo "═══════════════════════════════════════"
echo "🔍 Diagnostic checks:"
echo ""

# Try to read from runtime logs if available
if [ -f "$HOME/.local/share/titane-infinity/logs/app.log" ]; then
    echo "📄 Recent app logs:"
    tail -20 "$HOME/.local/share/titane-infinity/logs/app.log" | grep -E "(bootstrap|API key|provider)" || echo "  (no relevant logs)"
fi

# Check if SecureSecretsEngine has keys
SECRETS_DIR="$HOME/.local/share/titane-infinity/secrets"
if [ -d "$SECRETS_DIR" ]; then
    echo ""
    echo "🔐 SecureSecretsEngine status:"
    ls -lh "$SECRETS_DIR"/*.enc 2>/dev/null || echo "  No encrypted secrets found"
fi

echo ""
echo "✅ Test script complete. Follow manual steps above to verify."
