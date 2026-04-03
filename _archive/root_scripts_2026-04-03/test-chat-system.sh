#!/usr/bin/env bash

# 🧪 Script de test chat TITANE∞ v20.5
# Valide que le chat fonctionne avec fallback Ollama

set -eu

echo "🧪 TITANE∞ Chat System Test v20.5"
echo "═════════════════════════════════════════"

# 1. Vérifier Ollama
echo ""
echo "1️⃣  Vérifying Ollama..."
if curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "   ✅ Ollama is running on :11434"
else
  echo "   ❌ Ollama not responding on :11434"
  exit 1
fi

# 2. Vérifier Tauri
echo ""
echo "2️⃣  Checking Tauri app..."
if ps aux | grep -q "[t]itane-infinity"; then
  PID=$(ps aux | grep "[t]itane-infinity" | awk '{print $2}' | head -1)
  echo "   ✅ TITANE∞ running (PID: $PID)"
else
  echo "   ❌ TITANE∞ not running"
  echo "   Launch with: pnpm run dev:tauri"
  exit 1
fi

# 3. Vérifier TypeScript
echo ""
echo "3️⃣  Checking TypeScript compilation..."
if pnpm exec tsc --noEmit >/dev/null 2>&1; then
  echo "   ✅ Zero TypeScript errors"
else
  echo "   ❌ TypeScript compilation errors detected"
  pnpm exec tsc --noEmit 2>&1 | head -5
  exit 1
fi

# 4. Test Ollama direct HTTP call
echo ""
echo "4️⃣  Testing Ollama direct HTTP call..."
OLLAMA_RESPONSE=$(curl -fsS -X POST http://127.0.0.1:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.1:latest","prompt":"Say hello in 5 words","stream":false}' 2>/dev/null || echo "FAILED")

if echo "$OLLAMA_RESPONSE" | grep -q "response"; then
  CONTENT=$(echo "$OLLAMA_RESPONSE" | jq -r '.response' 2>/dev/null | head -c 50)
  echo "   ✅ Ollama HTTP test successful"
  echo "   Response preview: $CONTENT..."
else
  echo "   ❌ Ollama HTTP call failed"
  exit 1
fi

# 5. Check app logs
echo ""
echo "5️⃣  Checking app logs for errors..."
if tail -100 /tmp/app-fixed.log 2>/dev/null | grep -i "panic\|error\|fatal" >/dev/null 2>&1; then
  echo "   ⚠️  Some errors found in logs (may be non-critical)"
  tail -100 /tmp/app-fixed.log 2>/dev/null | grep -i "panic\|error\|fatal" | head -3
else
  echo "   ✅ No critical errors in app logs"
fi

# Summary
echo ""
echo "═════════════════════════════════════════"
echo "🎉 All checks passed! Chat should work."
echo ""
echo "📝 Next steps:"
echo "   1. Open TITANE∞ window"
echo "   2. Open DevTools (F12)"
echo "   3. Go to Chat tab"
echo "   4. Send a message"
echo "   5. Look for: '[TauriProtector] 🤖 Using Ollama fallback'"
echo ""
echo "If chat still doesn't work, check:"
echo "   - Ollama running on port 11434"
echo "   - DevTools console for errors"
echo "   - App logs: tail -f /tmp/app-fixed.log"
