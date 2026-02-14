#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

LOG_DIR="$ROOT_DIR/runtime/dev/logs"
mkdir -p "$LOG_DIR"

TAURI_LOG="$LOG_DIR/tauri.log"

printf "\n🧪 TITANE∞ — SMOKE IPC conversation_generate\n"
printf "================================================\n"

if command -v curl >/dev/null 2>&1; then
  if curl -fsS "http://localhost:11434/api/tags" >/dev/null 2>&1; then
    echo "✅ Ollama reachable"
  else
    echo "⚠️  Ollama not reachable (smoke will error explicitly)"
  fi
else
  echo "⚠️  curl absent"
fi

./runtime/dev/cleanup.sh >/dev/null 2>&1 || true
: > "$TAURI_LOG"

export TITANE_SMOKE_IPC_CONVERSATION_GENERATE=1
./runtime/dev/run-dev.sh >/dev/null 2>&1 &
RUN_PID=$!

cleanup() {
  echo ""
  echo "🧹 Stopping smoke..."
  kill -INT "$RUN_PID" >/dev/null 2>&1 || true
  sleep 2
  kill "$RUN_PID" >/dev/null 2>&1 || true
  pkill -f "tauri dev" >/dev/null 2>&1 || true
  pkill -f "target/debug/titane-infinity" >/dev/null 2>&1 || true
  ./runtime/dev/cleanup.sh >/dev/null 2>&1 || true
}
trap cleanup EXIT

DEADLINE=$((SECONDS + 90))

while (( SECONDS < DEADLINE )); do
  if [[ -f "$TAURI_LOG" ]] && grep -q "\[SMOKE-IPC\] conversation_generate ok" "$TAURI_LOG"; then
    echo "✅ SMOKE OK"
    echo ""
    tail -n 80 "$TAURI_LOG" || true
    exit 0
  fi

  if [[ -f "$TAURI_LOG" ]] && grep -q "\[SMOKE-IPC\] conversation_generate error" "$TAURI_LOG"; then
    echo "❌ SMOKE FAIL (explicit error)"
    echo ""
    tail -n 120 "$TAURI_LOG" || true
    exit 1
  fi

  sleep 2
done

echo "❌ SMOKE TIMEOUT"
tail -n 120 "$TAURI_LOG" || true
exit 1
