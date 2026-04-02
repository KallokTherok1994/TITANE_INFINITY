#!/bin/bash
# test-chat-ui-auto.sh - Test automatique du chat UI (v20.5.1)

set -e

echo "🧪 TITANE∞ Chat UI - Test Automatique"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }
info() { echo -e "${YELLOW}ℹ${NC} $1"; }

# Test 1: Ollama disponible
echo "1️⃣ Vérification Ollama..."
if curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  MODEL=$(curl -s http://127.0.0.1:11434/api/tags | jq -r '.models[0].name' 2>/dev/null || echo "unknown")
  pass "Ollama actif (modèle: $MODEL)"
else
  fail "Ollama non disponible sur port 11434"
fi

# Test 2: Tauri process
echo ""
echo "2️⃣ Vérification TITANE∞..."
TAURI_PID=$(ps aux | grep "titane-infinity" | grep -v grep | awk '{print $2}' | head -1)
if [ -n "$TAURI_PID" ]; then
  UPTIME=$(ps -p "$TAURI_PID" -o etime= | tr -d ' ')
  MEM=$(ps -p "$TAURI_PID" -o rss= | awk '{printf "%.0fMB", $1/1024}')
  pass "TITANE∞ actif (PID: $TAURI_PID, Uptime: $UPTIME, Mem: $MEM)"
else
  fail "TITANE∞ non démarré"
fi

# Test 3: TypeScript
echo ""
echo "3️⃣ Vérification TypeScript..."
TS_ERRORS=$(pnpm exec tsc --noEmit 2>&1 | grep -E "^(src|error TS)" | wc -l)
if [ "$TS_ERRORS" -eq 0 ]; then
  pass "TypeScript: 0 erreurs"
else
  fail "TypeScript: $TS_ERRORS erreurs détectées"
fi

# Test 4: Fichiers critiques
echo ""
echo "4️⃣ Vérification fichiers chat..."
FILES=(
  "src/utils/ollamaFallback.ts"
  "src/utils/tauriProtector.ts"
  "src/services/conversationEngine.ts"
)
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    pass "$file présent"
  else
    fail "$file manquant"
  fi
done

# Test 5: Test HTTP Ollama
echo ""
echo "5️⃣ Test génération Ollama..."
RESPONSE=$(curl -s http://127.0.0.1:11434/api/generate \
  -d '{"model":"llama3.1:latest","prompt":"Réponds SYSTEMOK en un mot","stream":false}' \
  | jq -r '.response' 2>/dev/null | head -c 50)

if [ -n "$RESPONSE" ]; then
  pass "Réponse Ollama: ${RESPONSE:0:30}..."
else
  fail "Aucune réponse d'Ollama"
fi

# Test 6: Logs récents
echo ""
echo "6️⃣ Analyse logs récents..."
LATEST_LOG=$(ls -t /tmp/titan-*.log 2>/dev/null | head -1)
if [ -n "$LATEST_LOG" ]; then
  ERRORS=$(grep -i "ERROR\|FATAL\|panic" "$LATEST_LOG" 2>/dev/null | tail -3 | wc -l)
  if [ "$ERRORS" -eq 0 ]; then
    pass "Logs propres (aucune erreur récente)"
  else
    info "⚠️  $ERRORS erreurs trouvées dans logs (vérification recommandée)"
  fi
  info "Log: $LATEST_LOG"
else
  info "Aucun log trouvé dans /tmp/"
fi

# Test 7: Validation chat architecture
echo ""
echo "7️⃣ Validation architecture chat..."
if grep -q "callOllamaDirectly" src/utils/ollamaFallback.ts 2>/dev/null; then
  pass "ollamaFallback.ts: fonction callOllamaDirectly présente"
else
  fail "ollamaFallback.ts: fonction callOllamaDirectly manquante"
fi

if grep -q "Using Ollama fallback" src/utils/tauriProtector.ts 2>/dev/null; then
  pass "tauriProtector.ts: fallback Ollama intégré"
else
  fail "tauriProtector.ts: fallback Ollama non détecté"
fi

# Résumé
echo ""
echo "======================================"
echo -e "${GREEN}🎉 TOUS LES TESTS AUTOMATIQUES PASSÉS !${NC}"
echo ""
echo "📋 Prochaine étape:"
echo "   → Tester MANUELLEMENT dans l'UI:"
echo "     1. Ouvrir TITANE∞"
echo "     2. Aller dans Chat"
echo "     3. Envoyer un message test"
echo "     4. F12 → Console → Chercher '[TauriProtector] 🤖 Using Ollama fallback'"
echo "     5. Vérifier la réponse d'Ollama dans l'UI"
echo ""
echo "💡 Si le chat fonctionne dans l'UI, le fix v20.5.1 est validé ✓"
