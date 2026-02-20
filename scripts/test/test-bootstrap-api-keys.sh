#!/usr/bin/env bash
# Test bootstrap API keys avec logs détaillés
set -euo pipefail

echo "🛑 Arrêt des processus existants..."
killall -9 titane-infinity 2>/dev/null || true
killall -9 pnpm 2>/dev/null || true
sleep 2

echo "🔨 Compilation Rust avec logs..."
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
cargo build --manifest-path src-tauri/Cargo.toml 2>&1 | grep -E "(Compiling titane|Finished|error)" | tail -10
echo ""

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build OK"
echo ""
echo "🚀 Lancement Tauri dev..."
echo "   Logs dans: /tmp/titane-bootstrap-test.log"
echo ""

# Lancer en background et capturer les logs
pnpm run dev:tauri > /tmp/titane-bootstrap-test.log 2>&1 &
TAURI_PID=$!

echo "   PID: $TAURI_PID"
echo "   Attente 25s pour le boot complet..."
sleep 25

echo ""
echo "═══════════════════════════════════════════"
echo "📊 ANALYSE DES LOGS BOOTSTRAP"
echo "═══════════════════════════════════════════"
echo ""

# Chercher les logs de bootstrap
echo "🔍 Logs bootstrap_api_keys:"
grep -E "(bootstrap|Chat.*orchestrator.*key|Gemini.*key.*loaded|OpenAI.*key.*loaded|Anthropic.*key.*loaded)" /tmp/titane-bootstrap-test.log 2>/dev/null || echo "   ❌ Aucun log de bootstrap trouvé"

echo ""
echo "🔍 Logs SecureSecretsEngine init:"
grep -E "SecretsEngine.*init|secrets.*engine.*init" /tmp/titane-bootstrap-test.log 2>/dev/null || echo "   ❌ Aucun log SecureSecretsEngine trouvé"

echo ""
echo "🔍 Logs Chat init:"
grep -E "(UnifiedMemory|Chat.*init)" /tmp/titane-bootstrap-test.log 2>/dev/null | head -5 || echo "   ❌ Aucun log Chat init trouvé"

echo ""
echo "═══════════════════════════════════════════"
echo "🧪 TEST IPC: chat_check_providers"
echo "═══════════════════════════════════════════"
echo ""
echo "📋 Pour tester manuellement:"
echo "1. Ouvre l'app TITANE (devrait être ouverte)"
echo "2. F12 → Console"
echo "3. Tape:"
echo ""
echo "   await window.__TAURI__.core.invoke('chat_check_providers')"
echo ""
echo "4. Tu devrais voir un tableau avec 4 providers"
echo "5. Si tu as entré une clé Gemini, vérifie que gemini.available === true"
echo ""
echo "═══════════════════════════════════════════"
echo "💡 Si toujours rien dans le footer:"
echo "═══════════════════════════════════════════"
echo "1. Vérifie que le menu est DÉPLIÉ (clic sur ☰)"
echo "2. Lance la commande manuellement dans le DevTools"
echo "3. Vérifie les logs complets: tail -100 /tmp/titane-bootstrap-test.log"
echo ""
echo "✅ Script terminé. Le runtime tourne en background (PID: $TAURI_PID)"
echo ""
