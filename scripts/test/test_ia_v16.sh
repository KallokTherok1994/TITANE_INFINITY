#!/usr/bin/env bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   🧪 TITANE∞ v16 — TEST IA COMPLET (Gemini + Ollama)"
echo "════════════════════════════════════════════════════════════════"
echo ""

PROJECT_ROOT="$(pwd)"
LOG_FILE="$PROJECT_ROOT/test_ia_v16.log"
echo "" > "$LOG_FILE"

log() {
  echo "[TEST_IA] $1" | tee -a "$LOG_FILE"
}

log "🕒 $(date '+%Y-%m-%d %H:%M:%S') — Démarrage tests IA"
echo ""

# ─────────────────────────────────────────────────────────────────────
# 1. VÉRIFICATION ENVIRONNEMENT
# ─────────────────────────────────────────────────────────────────────
log "🔍 Vérification configuration .env..."

if [ -f "$PROJECT_ROOT/.env" ]; then
  GEMINI_KEY=$(grep "GEMINI_API_KEY=" .env | cut -d'=' -f2)
  GEMINI_MODEL=$(grep "GEMINI_MODEL=" .env | cut -d'=' -f2)
  OLLAMA_MODEL=$(grep "OLLAMA_DEFAULT_MODEL=" .env | cut -d'=' -f2)

  log "✔ .env trouvé"
  log "  → Gemini Model: $GEMINI_MODEL"
  log "  → Gemini Key: ${GEMINI_KEY:0:20}..."
  log "  → Ollama Model: $OLLAMA_MODEL"
else
  log "❌ .env manquant"
  exit 1
fi
echo ""

# ─────────────────────────────────────────────────────────────────────
# 2. TEST GEMINI API
# ─────────────────────────────────────────────────────────────────────
log "🤖 Test Gemini API (Google Generative AI)..."

GEMINI_URL="https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}"
GEMINI_RESPONSE=$(curl -s --max-time 10 "$GEMINI_URL" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Réponds en 1 mot: êtes-vous opérationnel?"}]}]}' \
  | jq -r '.candidates[0].content.parts[0].text // .error.message // "ERROR"')

if [[ "$GEMINI_RESPONSE" =~ "ERROR" ]] || [[ "$GEMINI_RESPONSE" =~ "error" ]]; then
  log "❌ Gemini API: ÉCHEC"
  log "   Réponse: $GEMINI_RESPONSE"
else
  log "✅ Gemini API: OPÉRATIONNEL"
  log "   Réponse: ${GEMINI_RESPONSE:0:80}..."
fi
echo ""

# ─────────────────────────────────────────────────────────────────────
# 3. TEST OLLAMA (Local)
# ─────────────────────────────────────────────────────────────────────
log "🦙 Test Ollama (IA Locale)..."

OLLAMA_RUNNING=$(curl -s --max-time 2 http://localhost:11434/api/version 2>/dev/null || echo "")

if [[ -z "$OLLAMA_RUNNING" ]]; then
  log "❌ Ollama: NON ACTIF (service non démarré)"
  log "   Commande pour démarrer: ollama serve"
else
  OLLAMA_VERSION=$(echo "$OLLAMA_RUNNING" | jq -r '.version // "unknown"')
  log "✔ Ollama service actif (version $OLLAMA_VERSION)"

  # Test query
  OLLAMA_RESPONSE=$(curl -s --max-time 15 http://localhost:11434/api/generate \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$OLLAMA_MODEL\",\"prompt\":\"Reply in 1 word: are you working?\",\"stream\":false}" \
    | jq -r '.response // "ERROR"' 2>/dev/null)

  if [[ "$OLLAMA_RESPONSE" =~ "ERROR" ]] || [[ -z "$OLLAMA_RESPONSE" ]]; then
    log "⚠️  Ollama: Modèle $OLLAMA_MODEL peut-être non installé"
    log "   Commande: ollama pull $OLLAMA_MODEL"
  else
    log "✅ Ollama: OPÉRATIONNEL"
    log "   Modèle: $OLLAMA_MODEL"
    log "   Réponse: ${OLLAMA_RESPONSE:0:80}..."
  fi
fi
echo ""

# ─────────────────────────────────────────────────────────────────────
# 4. TEST MODÈLES OLLAMA INSTALLÉS
# ─────────────────────────────────────────────────────────────────────
log "📦 Modèles Ollama installés:"
ollama list 2>/dev/null | tail -n +2 | while read -r line; do
  log "   → $line"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# 5. RÉSUMÉ FINAL
# ─────────────────────────────────────────────────────────────────────
log "════════════════════════════════════════════════════════════════"
log "   ✅ TESTS IA TERMINÉS — Voir $LOG_FILE"
log "════════════════════════════════════════════════════════════════"

echo ""
echo "📊 RÉSUMÉ:"
echo "   → Gemini API: Vérifie ci-dessus"
echo "   → Ollama Local: Vérifie ci-dessus"
echo "   → Log complet: $LOG_FILE"
echo ""
echo "🚀 Prêt pour lancer: pnpm run tauri:dev"
echo ""
