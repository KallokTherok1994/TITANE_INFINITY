#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${TITANE_E2E_ARTIFACTS_DIR:-reports/ui_research_e2e/$STAMP}"
mkdir -p "$OUT_DIR"
export TITANE_E2E_ARTIFACTS_DIR="$OUT_DIR"

SPEC_PATH="e2e/desktop/online-chat-proof-ui.wdio.test.js"
DRIVER_LOG="$OUT_DIR/tauri-driver.log"
WDIO_LOG="$OUT_DIR/wdio-online-chat-proof-ui.log"

echo "[E2E_CHAT_PROOF] OUT_DIR=$OUT_DIR"

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

TITANE_E2E_URL="${TITANE_E2E_URL:-tauri://localhost/#/chat}" \
pnpm exec wdio run wdio.desktop.conf.cjs --spec "$SPEC_PATH" 2>&1 | tee "$WDIO_LOG"
STATUS=${PIPESTATUS[0]}

echo "[E2E_CHAT_PROOF] STATUS=$STATUS"
echo "[E2E_CHAT_PROOF] DRIVER_LOG=$DRIVER_LOG"
echo "[E2E_CHAT_PROOF] WDIO_LOG=$WDIO_LOG"

exit "$STATUS"
