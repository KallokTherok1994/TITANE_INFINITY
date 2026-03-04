#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

RUNS="${1:-1}"
PACK_DIR="${2:-${TITANE_PROOF_PACK_DIR:-reports/e2e_tauri_runtime}}"
MAX_TIMEOUT_SECONDS="${MAX_TIMEOUT_SECONDS:-1800}"

mkdir -p "$PACK_DIR"
LOG_FILE="$PACK_DIR/e2e_tauri_runtime.log"
STATUS_FILE="$PACK_DIR/e2e_tauri_runtime.status"

echo "[E2E_TAURI] start $(date -Iseconds)" | tee "$LOG_FILE"
echo "[E2E_TAURI] runs=$RUNS" | tee -a "$LOG_FILE"
echo "[E2E_TAURI] pack_dir=$PACK_DIR" | tee -a "$LOG_FILE"
echo "[E2E_TAURI] max_timeout_seconds=$MAX_TIMEOUT_SECONDS" | tee -a "$LOG_FILE"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "BLOCKED_E2E_RUNTIME: pnpm introuvable" | tee -a "$LOG_FILE"
  echo "BLOCKED_E2E_RUNTIME" > "$STATUS_FILE"
  exit 42
fi

if ! command -v tauri-driver >/dev/null 2>&1; then
  echo "BLOCKED_E2E_RUNTIME: tauri-driver introuvable" | tee -a "$LOG_FILE"
  echo "BLOCKED_E2E_RUNTIME" > "$STATUS_FILE"
  exit 43
fi

if [[ "$RUNS" -lt 1 ]]; then
  RUNS=1
fi

if [[ "$RUNS" -gt 3 ]]; then
  RUNS=3
fi

run_one() {
  local idx="$1"
  echo "[E2E_TAURI] run=${idx} begin $(date -Iseconds)" | tee -a "$LOG_FILE"

  set +e
  timeout "$MAX_TIMEOUT_SECONDS" pnpm run e2e:desktop >> "$LOG_FILE" 2>&1
  local rc=$?
  set -e

  if [[ "$rc" -eq 124 ]]; then
    echo "BLOCKED_E2E_RUNTIME: timeout run=${idx}" | tee -a "$LOG_FILE"
    echo "BLOCKED_E2E_RUNTIME" > "$STATUS_FILE"
    return 124
  fi

  if [[ "$rc" -ne 0 ]]; then
    echo "FAIL_E2E_RUNTIME: run=${idx} rc=${rc}" | tee -a "$LOG_FILE"
    echo "FAIL_E2E_RUNTIME" > "$STATUS_FILE"
    return "$rc"
  fi

  echo "[E2E_TAURI] run=${idx} PASS" | tee -a "$LOG_FILE"
  return 0
}

for i in $(seq 1 "$RUNS"); do
  if ! run_one "$i"; then
    exit $?
  fi
done

echo "PASS_E2E_RUNTIME" | tee -a "$LOG_FILE"
echo "PASS_E2E_RUNTIME" > "$STATUS_FILE"
