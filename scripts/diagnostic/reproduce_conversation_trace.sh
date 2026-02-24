#!/usr/bin/env bash
# TITANE∞ — Script de Test Reproductible (SECTION 2)
# Objectif: Capturer logs complets conversation_generate + gate decision

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

TRACE_DIR="runs/super_prompt_audit_v1/traces"
mkdir -p "$TRACE_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TRACE_LOG="$TRACE_DIR/trace_${TIMESTAMP}.log"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee "$TRACE_LOG"
echo "TITANE∞ — DIAGNOSTIC REPRODUCTIBLE (SECTION 2)" | tee -a "$TRACE_LOG"
echo "Timestamp: $TIMESTAMP" | tee -a "$TRACE_LOG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$TRACE_LOG"
echo "" | tee -a "$TRACE_LOG"

# PHASE A: Vérifier état initial
echo "[PHASE A] État Vite actuel..." | tee -a "$TRACE_LOG"
if curl -fsS http://127.0.0.1:5173 >/dev/null 2>&1; then
    echo "✅ Vite déjà actif sur :5173" | tee -a "$TRACE_LOG"
else
    echo "❌ Vite NON actif — lancer 'pnpm run dev:tauri' d'abord" | tee -a "$TRACE_LOG"
    exit 1
fi

# PHASE B: Vérifier backend Tauri
echo "[PHASE B] Backend Tauri..." | tee -a "$TRACE_LOG"
if pgrep -f "titane-infinity" >/dev/null 2>&1; then
    TAURI_PID=$(pgrep -f "titane-infinity" | head -1)
    echo "✅ Backend Tauri actif (PID: $TAURI_PID)" | tee -a "$TRACE_LOG"
else
    echo "❌ Backend Tauri NON actif — lancer 'pnpm run dev:tauri' d'abord" | tee -a "$TRACE_LOG"
    exit 1
fi

# PHASE C: Capture état .env
echo "[PHASE C] Configuration .env..." | tee -a "$TRACE_LOG"
{
    echo "VITE_ENABLE_EXTERNAL_AI:"
    grep -E "^VITE_ENABLE_EXTERNAL_AI" .env 2>/dev/null || echo "  (non défini)"
    echo ""
    echo "Provider API Keys:"
    grep -E "^(GEMINI|OPENAI|ANTHROPIC)_API_KEY" .env 2>/dev/null | sed 's/=.*/=***MASKED***/' || echo "  (aucune clé active)"
} | tee -a "$TRACE_LOG"
echo "" | tee -a "$TRACE_LOG"

# PHASE D: Check Ollama
echo "[PHASE D] Ollama status..." | tee -a "$TRACE_LOG"
if curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama actif (localhost:11434)" | tee -a "$TRACE_LOG"
    OLLAMA_MODELS=$(curl -s http://127.0.0.1:11434/api/tags | jq -r '.models[].name' 2>/dev/null | head -3 || echo "gemma2:2b")
    echo "Models: $OLLAMA_MODELS" | tee -a "$TRACE_LOG"
else
    echo "⚠️  Ollama NON actif (optionnel)" | tee -a "$TRACE_LOG"
fi
echo "" | tee -a "$TRACE_LOG"

# PHASE E: Test de génération (nécessite l'app ouverte)
echo "[PHASE E] Test conversation_generate..." | tee -a "$TRACE_LOG"
echo "⚠️  MANUEL: Ouvrez l'app Tauri et envoyez un message test" | tee -a "$TRACE_LOG"
echo "   Message suggéré: 'Test diagnostic section 2'" | tee -a "$TRACE_LOG"
echo "   Attendez 3 secondes puis appuyez sur Entrée..." | tee -a "$TRACE_LOG"
read -t 30 -p "Press Enter après avoir envoyé le message..." || echo "(timeout)"

# PHASE F: Capture logs backend (dernières 100 lignes)
echo "[PHASE F] Capture logs backend Rust..." | tee -a "$TRACE_LOG"
if [ -f "runtime/dev/logs/vite.log" ]; then
    echo "=== Vite Logs (tail -50) ===" >> "$TRACE_LOG"
    tail -50 runtime/dev/logs/vite.log >> "$TRACE_LOG" 2>&1 || true
fi

# Capture journalctl si accessible
echo "=== System Logs (journalctl titane-infinity, last 50 lines) ===" >> "$TRACE_LOG"
journalctl --user -u "titane*" -n 50 --no-pager >> "$TRACE_LOG" 2>&1 || echo "(journalctl not available)" >> "$TRACE_LOG"

# PHASE G: Résumé
echo "" | tee -a "$TRACE_LOG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$TRACE_LOG"
echo "✅ Trace capturée: $TRACE_LOG" | tee -a "$TRACE_LOG"
echo "" | tee -a "$TRACE_LOG"
echo "ANALYSE REQUISE:" | tee -a "$TRACE_LOG"
echo "  1. Chercher '[CONV_SEND] External AI gate' (frontend)" | tee -a "$TRACE_LOG"
echo "  2. Chercher '[Ω:CMD] conversation_generate' (backend)" | tee -a "$TRACE_LOG"
echo "  3. Chercher 'mode.*reason.*provider' (metadata)" | tee -a "$TRACE_LOG"
echo "  4. Chercher 'TIMEOUT' ou 'fallback' (error handling)" | tee -a "$TRACE_LOG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$TRACE_LOG"

# Afficher le fichier pour inspection immédiate
cat "$TRACE_LOG"
