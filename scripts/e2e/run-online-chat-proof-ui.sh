#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${TITANE_E2E_ARTIFACTS_DIR:-reports/ui_research_e2e/$STAMP}"
mkdir -p "$OUT_DIR"
export TITANE_E2E_ARTIFACTS_DIR="$OUT_DIR"

SPEC_PATH="${TITANE_E2E_SPEC_PATH:-e2e/desktop/online-chat-proof-ui.wdio.test.js}"
DRIVER_LOG="$OUT_DIR/tauri-driver.log"
WDIO_LOG="$OUT_DIR/${TITANE_E2E_WDIO_LOG_BASENAME:-wdio-online-chat-proof-ui.log}"

if [[ -n "${TAURI_DEV_SERVER_URL:-}" ]]; then
  export TITANE_E2E_EXPECT_SOURCE="${TITANE_E2E_EXPECT_SOURCE:-dev-server}"
  export TITANE_E2E_USE_TAURI_DEV="${TITANE_E2E_USE_TAURI_DEV:-1}"
else
  export TITANE_E2E_EXPECT_SOURCE="${TITANE_E2E_EXPECT_SOURCE:-embedded}"
  export TITANE_E2E_USE_TAURI_DEV="${TITANE_E2E_USE_TAURI_DEV:-0}"
fi
export TITANE_E2E_ENFORCE_SOURCE="${TITANE_E2E_ENFORCE_SOURCE:-0}"

# E2E stability profile: prefer a lightweight local model and cap backend turn timeout
# to avoid long-running UI hangs that can invalidate the WRY WebDriver session.
export OLLAMA_DEFAULT_MODEL="${TITANE_E2E_OLLAMA_MODEL:-gemma2:2b}"
export TITANE_CONVERSATION_TIMEOUT_SECS="${TITANE_CONVERSATION_TIMEOUT_SECS:-30}"

echo "[E2E_CHAT_PROOF] OUT_DIR=$OUT_DIR"
echo "[E2E_CHAT_PROOF] EXPECT_SOURCE=$TITANE_E2E_EXPECT_SOURCE"
echo "[E2E_CHAT_PROOF] ENFORCE_SOURCE=$TITANE_E2E_ENFORCE_SOURCE"
echo "[E2E_CHAT_PROOF] USE_TAURI_DEV=$TITANE_E2E_USE_TAURI_DEV"
echo "[E2E_CHAT_PROOF] OLLAMA_DEFAULT_MODEL=$OLLAMA_DEFAULT_MODEL"
echo "[E2E_CHAT_PROOF] TITANE_CONVERSATION_TIMEOUT_SECS=$TITANE_CONVERSATION_TIMEOUT_SECS"

pkill -f 'tauri-driver|WebKitWebDriver' >/dev/null 2>&1 || true
sleep 1

tauri-driver --port 4444 > "$DRIVER_LOG" 2>&1 &
DRIVER_PID=$!

cleanup() {
  kill "$DRIVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 20); do
  if ss -ltn | grep -q ':4444'; then
    break
  fi
  sleep 1
done

if [[ -n "${TAURI_DEV_SERVER_URL:-}" ]]; then
  TITANE_E2E_URL_DEFAULT="${TAURI_DEV_SERVER_URL%/}/#/chat"
else
  TITANE_E2E_URL_DEFAULT="tauri://localhost/#/chat"
fi

TITANE_E2E_URL="${TITANE_E2E_URL:-$TITANE_E2E_URL_DEFAULT}" \
pnpm exec wdio run wdio.desktop.conf.cjs --spec "$SPEC_PATH" 2>&1 | tee "$WDIO_LOG"
STATUS=${PIPESTATUS[0]}

echo "[E2E_CHAT_PROOF] STATUS=$STATUS"
echo "[E2E_CHAT_PROOF] DRIVER_LOG=$DRIVER_LOG"
echo "[E2E_CHAT_PROOF] WDIO_LOG=$WDIO_LOG"

exit "$STATUS"
