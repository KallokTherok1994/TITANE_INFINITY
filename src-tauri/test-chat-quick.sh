#!/bin/bash
echo "🧪 TEST CHAT FIX"
curl -s http://localhost:11434/api/tags | jq -r '.models[0].name' && echo "✅ Ollama" || echo "❌ Ollama"
[ -f src-tauri/target/release/titane-infinity ] && echo "✅ Binary" || echo "❌ Binary"
grep -q "3000" src-tauri/src/overdrive/chat_orchestrator.rs && echo "✅ Timeout" || echo "❌ Timeout"
grep -q "RÉACTIVÉ" src-tauri/src/overdrive/chat_orchestrator.rs && echo "✅ Fallback" || echo "❌ Fallback"
