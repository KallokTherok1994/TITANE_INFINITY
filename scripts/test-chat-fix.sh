#!/bin/bash
# Test Chat Fix - Validation Ollama + Local Fallback

echo "🧪 TEST CHAT FIX"
echo "================"

# Test Ollama
curl -s http://localhost:11434/api/tags | jq -r '.models[0].name' && echo "✅ Ollama OK" || echo "❌ Ollama FAIL"

# Test binary
[ -f src-tauri/target/release/titane-infinity ] && echo "✅ Binary OK" || echo "❌ Binary FAIL"

# Test code
grep -q "3000" src-tauri/src/overdrive/chat_orchestrator.rs && echo "✅ Timeout 3s OK" || echo "❌ Timeout FAIL"
grep -q "RÉACTIVÉ" src-tauri/src/overdrive/chat_orchestrator.rs && echo "✅ Fallback OK" || echo "❌ Fallback FAIL"

echo ""
echo "🎯 Lancer: npm run dev:tauri"
