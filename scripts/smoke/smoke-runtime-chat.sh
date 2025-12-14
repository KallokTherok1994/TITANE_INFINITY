#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

LOG_DIR="$ROOT_DIR/runtime/dev/logs"
mkdir -p "$LOG_DIR"

# Source de vérité: Titan-Dev écrit dans ce fichier.
TAURI_LOG="$LOG_DIR/tauri.log"

printf "\n🧪 TITANE∞ — SMOKE RUNTIME CHAT\n"
printf "================================\n"

# Pré-check Ollama (optionnel mais utile)
if command -v curl >/dev/null 2>&1; then
  if curl -fsS "http://localhost:11434/api/tags" >/dev/null 2>&1; then
    echo "✅ Ollama reachable on http://localhost:11434"
  else
    echo "⚠️  Ollama not reachable on http://localhost:11434 (le smoke peut fallback/échouer)"
  fi
else
  echo "⚠️  curl absent: skip Ollama pre-check"
fi

# Clean state before run
./runtime/dev/cleanup.sh >/dev/null

# Reset logs pour ce run (sinon grep peut matcher un ancien succès)
: > "$TAURI_LOG"

# Lance Titan-Dev avec le hook smoke runtime.
# Important: run-dev reste vivant; on stop dès qu'on voit la preuve dans tauri.log.
export TITANE_SMOKE_RUNTIME_CHAT=1

./runtime/dev/run-dev.sh >/dev/null 2>&1 &
RUN_PID=$!

cleanup() {
  echo "\n🧹 Stopping smoke run (pid=$RUN_PID)..."
  # Tente un stop soft, puis hard si nécessaire
  kill -INT "$RUN_PID" >/dev/null 2>&1 || true
  sleep 1
  kill "$RUN_PID" >/dev/null 2>&1 || true
  pkill -f "tauri dev" >/dev/null 2>&1 || true
  pkill -f "target/debug/titane-infinity" >/dev/null 2>&1 || true
  ./runtime/dev/cleanup.sh >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Attendre la preuve de succès max 120s
DEADLINE=$((SECONDS + 120))

while (( SECONDS < DEADLINE )); do
  if [[ -f "$TAURI_LOG" ]] && grep -q "\[SMOKE-RUNTIME-CHAT\] chat_send_message ok" "$TAURI_LOG"; then
    echo "✅ SMOKE OK: [SMOKE-RUNTIME-CHAT] chat_send_message ok"
    echo "\n--- tail tauri.log (preuves) ---"
    tail -n 80 "$TAURI_LOG" || true
    exit 0
  fi

  if [[ -f "$TAURI_LOG" ]] && grep -q "\[SMOKE-RUNTIME-CHAT\] chat_send_message error" "$TAURI_LOG"; then
    echo "❌ SMOKE FAIL: chat_send_message error"
    echo "\n--- tail tauri.log (erreurs) ---"
    tail -n 120 "$TAURI_LOG" || true
    exit 1
  fi

  sleep 1
done

echo "❌ SMOKE TIMEOUT: aucune preuve dans 120s"
echo "\n--- tail tauri.log (debug) ---"
tail -n 120 "$TAURI_LOG" || true
exit 1
