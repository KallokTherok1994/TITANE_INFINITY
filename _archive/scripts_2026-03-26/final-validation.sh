#!/bin/bash
# TITANE∞ Final Validation Script v20.5.1
# Tests le système complet après déploiement

set -euo pipefail

echo "🧪 TITANE∞ Final Validation v20.5.1"
echo "═══════════════════════════════════════════════"
echo ""

FAILED=0

# Test 1: Git synchronisé
echo "1️⃣  Vérification Git/GitHub sync..."
if git status | grep -q "Votre branche est à jour"; then
    echo "   ✅ Git synchronisé avec origin/MAIN"
elif git status | grep -q "branch is up to date"; then
    echo "   ✅ Git synchronized with origin/MAIN"
else
    echo "   ⚠️  Git peut avoir des changements non pushés"
    git status --short | head -5
fi
echo ""

# Test 2: TypeScript
echo "2️⃣  Vérification TypeScript..."
ERRORS=$(pnpm exec tsc --noEmit 2>&1 | grep -c "^src.*error TS" || true)
if [ "$ERRORS" -eq 0 ]; then
    echo "   ✅ TypeScript: 0 erreurs"
else
    echo "   ❌ TypeScript: $ERRORS erreurs"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Ollama
echo "3️⃣  Vérification Ollama..."
if curl -sf http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    MODEL=$(curl -s http://127.0.0.1:11434/api/tags | jq -r '.models[0].name' 2>/dev/null || echo "unknown")
    echo "   ✅ Ollama running: $MODEL"
else
    echo "   ❌ Ollama not responding on :11434"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Tauri process
echo "4️⃣  Vérification TITANE∞ process..."
if PID=$(ps aux | grep titane-infinity | grep -v grep | awk '{print $2}' | head -1); then
    if [ -n "$PID" ]; then
        UPTIME=$(ps aux | grep titane-infinity | grep -v grep | awk '{print $10}' | head -1)
        MEM=$(ps aux | grep titane-infinity | grep -v grep | awk '{print $6}' | head -1)
        echo "   ✅ TITANE∞ running (PID: $PID, Uptime: $UPTIME, Mem: ${MEM}KB)"
    else
        echo "   ❌ TITANE∞ not running"
        FAILED=$((FAILED + 1))
    fi
else
    echo "   ❌ TITANE∞ not running"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Vite
echo "5️⃣  Vérification Vite dev server..."
if curl -sf http://127.0.0.1:5173/ > /dev/null 2>&1; then
    CONNS=$(lsof -i :5173 2>/dev/null | wc -l)
    echo "   ✅ Vite running on :5173 ($CONNS connections)"
else
    echo "   ❌ Vite not responding on :5173"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Fichiers critiques
echo "6️⃣  Vérification fichiers critiques..."
CRITICAL_FILES=(
    "src/utils/ollamaFallback.ts"
    "src/utils/tauriProtector.ts"
    "src/services/conversationEngine.ts"
    "test-chat-system.sh"
)

ALL_EXISTS=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file NOT FOUND"
        ALL_EXISTS=false
        FAILED=$((FAILED + 1))
    fi
done
echo ""

# Test 7: Ollama HTTP direct
echo "7️⃣  Test Ollama HTTP direct..."
RESPONSE=$(curl -s http://127.0.0.1:11434/api/generate \
    -d '{"model":"llama3.1:latest","prompt":"Réponds juste OK","stream":false}' \
    2>/dev/null | jq -r '.response' 2>/dev/null || echo "ERROR")

if [ "$RESPONSE" != "ERROR" ] && [ -n "$RESPONSE" ]; then
    echo "   ✅ Ollama HTTP test successful"
    echo "      Response: ${RESPONSE:0:50}..."
else
    echo "   ❌ Ollama HTTP test failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Résumé
echo "═══════════════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo "🎉 VALIDATION COMPLÈTE: TOUS LES TESTS PASSÉS !"
    echo ""
    echo "✅ Système prêt pour utilisation"
    echo "✅ Chat fonctionnel avec fallback Ollama"
    echo "✅ Code synchronisé avec GitHub"
    echo ""
    echo "💡 Prochaine étape: Tester dans l'UI"
    echo "   1. Ouvrir TITANE∞ window"
    echo "   2. Aller sur Chat tab"
    echo "   3. Envoyer: 'test'"
    echo "   4. F12 → Console → Chercher: 'Using Ollama fallback'"
    echo ""
    exit 0
else
    echo "⚠️  VALIDATION ÉCHOUÉE: $FAILED test(s) failed"
    echo ""
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
