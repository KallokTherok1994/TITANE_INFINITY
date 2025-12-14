#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

LOG_DIR="$ROOT_DIR/runtime/stable/logs"
mkdir -p "$LOG_DIR"

SMOKE_LOG="$LOG_DIR/smoke-stable-chat.log"
: > "$SMOKE_LOG"

printf "\n🧪 TITANE∞ — SMOKE STABLE CHAT\n" | tee -a "$SMOKE_LOG"
printf "================================\n" | tee -a "$SMOKE_LOG"

# Pré-check Ollama
if command -v curl >/dev/null 2>&1; then
  if curl -fsS "http://localhost:11434/api/tags" >/dev/null 2>&1; then
    echo "✅ Ollama reachable on http://localhost:11434" | tee -a "$SMOKE_LOG"
  else
    echo "⚠️  Ollama not reachable on http://localhost:11434 (le smoke peut fallback/échouer)" | tee -a "$SMOKE_LOG"
  fi
else
  echo "⚠️  curl absent: skip Ollama pre-check" | tee -a "$SMOKE_LOG"
fi

# Build stable si demandé (par défaut: oui)
BUILD_STABLE="${BUILD_STABLE:-1}"
if [[ "$BUILD_STABLE" == "1" ]]; then
  echo "\n🔵 Building Titan-Stable…" | tee -a "$SMOKE_LOG"
  TITANE_BUILD_ASSUME_YES=1 ./runtime/stable/build.sh 2>&1 | tee -a "$SMOKE_LOG"
fi

APPIMAGE=$(ls -1t "$ROOT_DIR"/runtime/stable/*.AppImage 2>/dev/null | head -n 1 || true)
if [[ -z "$APPIMAGE" ]]; then
  echo "❌ Aucun AppImage trouvé dans runtime/stable/" | tee -a "$SMOKE_LOG"
  exit 1
fi

chmod +x "$APPIMAGE" || true

# Lance l’app stable avec le hook smoke runtime.
# Le hook écrit sur stdout/stderr (println/eprintln) — on capture ici.
export TITANE_SMOKE_RUNTIME_CHAT=1

( "$APPIMAGE" 2>&1 | tee -a "$SMOKE_LOG" ) &
APP_PID=$!

cleanup() {
  echo "\n🧹 Stopping stable app (pid=$APP_PID)…" | tee -a "$SMOKE_LOG"
  kill -INT "$APP_PID" >/dev/null 2>&1 || true
  sleep 1
  kill "$APP_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

DEADLINE=$((SECONDS + 180))
while (( SECONDS < DEADLINE )); do
  if grep -q "\[SMOKE-RUNTIME-CHAT\] chat_send_message ok" "$SMOKE_LOG"; then
    if grep -q "UnifiedMemory init failed\|Failed to create LTM storage\|Read-only file system\|UnifiedMemory not initialized\|Failed to store in UnifiedMemory" "$SMOKE_LOG"; then
      echo "❌ SMOKE FAIL: UnifiedMemory/LTM errors detected" | tee -a "$SMOKE_LOG"
      exit 2
    fi
    echo "✅ SMOKE OK: [SMOKE-RUNTIME-CHAT] chat_send_message ok" | tee -a "$SMOKE_LOG"
    exit 0
  fi
  if grep -q "\[CHAT\] ✅ Ollama success" "$SMOKE_LOG"; then
    if grep -q "UnifiedMemory init failed\|Failed to create LTM storage\|Read-only file system\|UnifiedMemory not initialized\|Failed to store in UnifiedMemory" "$SMOKE_LOG"; then
      echo "❌ SMOKE FAIL: UnifiedMemory/LTM errors detected" | tee -a "$SMOKE_LOG"
      exit 2
    fi
    echo "✅ SMOKE OK: [CHAT] Ollama success" | tee -a "$SMOKE_LOG"
    exit 0
  fi
  if grep -q "\[SMOKE-RUNTIME-CHAT\] chat_send_message error" "$SMOKE_LOG"; then
    echo "❌ SMOKE FAIL: chat_send_message error" | tee -a "$SMOKE_LOG"
    exit 1
  fi
  sleep 1
done

echo "❌ SMOKE TIMEOUT: aucune preuve dans 180s" | tee -a "$SMOKE_LOG"
exit 1
