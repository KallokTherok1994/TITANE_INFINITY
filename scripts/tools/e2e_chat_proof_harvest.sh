#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
PROOF_DIR="$ROOT/docs/_evidence/ONLINE_CHAT_FIX_20260220_115300"
RUNS_DIR="$PROOF_DIR/runs"
DISCOVERY_DIR="$RUNS_DIR/DISCOVERY"

if [[ ! -d "$PROOF_DIR" ]]; then
  echo "Proof pack not found: $PROOF_DIR" >&2
  exit 1
fi

mkdir -p "$RUNS_DIR" "$DISCOVERY_DIR"

timestamp_utc() {
  date -u +%Y-%m-%dT%H:%M:%SZ
}

PHASE_A_FILE="$DISCOVERY_DIR/PHASE_A.txt"
: > "$PHASE_A_FILE"

echo "ts_utc=$(timestamp_utc)" >> "$PHASE_A_FILE"

echo "" >> "$PHASE_A_FILE"
echo "## A1 launcher discovery" >> "$PHASE_A_FILE"
echo "pwd: $(pwd)" >> "$PHASE_A_FILE"

echo "git rev-parse HEAD:" >> "$PHASE_A_FILE"
if command -v git >/dev/null 2>&1; then
  git rev-parse HEAD >> "$PHASE_A_FILE" 2>&1 || true
else
  echo "git: missing" >> "$PHASE_A_FILE"
fi

echo "pnpm -v && node -v:" >> "$PHASE_A_FILE"
if command -v pnpm >/dev/null 2>&1; then
  pnpm -v >> "$PHASE_A_FILE" 2>&1 || true
else
  echo "pnpm: missing" >> "$PHASE_A_FILE"
fi
if command -v node >/dev/null 2>&1; then
  node -v >> "$PHASE_A_FILE" 2>&1 || true
else
  echo "node: missing" >> "$PHASE_A_FILE"
fi

echo "rustc -V && cargo -V:" >> "$PHASE_A_FILE"
if command -v rustc >/dev/null 2>&1; then
  rustc -V >> "$PHASE_A_FILE" 2>&1 || true
else
  echo "rustc: missing" >> "$PHASE_A_FILE"
fi
if command -v cargo >/dev/null 2>&1; then
  cargo -V >> "$PHASE_A_FILE" 2>&1 || true
else
  echo "cargo: missing" >> "$PHASE_A_FILE"
fi

echo "pnpm run -l | rg -n 'tauri|dev|build|e2e|test':" >> "$PHASE_A_FILE"
if command -v pnpm >/dev/null 2>&1 && command -v rg >/dev/null 2>&1; then
  pnpm run -l | rg -n "tauri|dev|build|e2e|test" >> "$PHASE_A_FILE" 2>&1 || true
else
  echo "pnpm or rg missing" >> "$PHASE_A_FILE"
fi

A2_FILE="$DISCOVERY_DIR/A2_rg.log"
: > "$A2_FILE"

echo "" >> "$PHASE_A_FILE"
echo "## A2 log source discovery" >> "$PHASE_A_FILE"
if command -v rg >/dev/null 2>&1; then
  rg -n "CHAT_DECISION|CRITICAL_CONTRADICTION|NO_FALSE_OFFLINE|Reponse en mode hors ligne|Réponse en mode hors ligne" src src-tauri -S > "$A2_FILE" 2>&1 || true
  echo "rg output: $A2_FILE" >> "$PHASE_A_FILE"
else
  echo "rg: missing" >> "$PHASE_A_FILE"
fi

E2E_CMD=""
E2E_CMD_NOTE=""

if [[ -f "$ROOT/scripts/e2e/run-ui-chat-360-autofix.cjs" ]]; then
  E2E_CMD="node scripts/e2e/run-ui-chat-360-autofix.cjs"
  E2E_CMD_NOTE="blocked_by_policy: requires Vite dev server (Tauri-only invariant)"
elif [[ -f "$ROOT/scripts/e2e/run-desktop-suite.js" ]]; then
  E2E_CMD="node scripts/e2e/run-desktop-suite.js"
  E2E_CMD_NOTE="coverage_unknown: chat flow not guaranteed"
elif [[ -f "$ROOT/scripts/run-e2e-tests.sh" ]]; then
  E2E_CMD="bash scripts/run-e2e-tests.sh"
  E2E_CMD_NOTE="coverage_unknown: chat flow not guaranteed"
else
  E2E_CMD=""
  E2E_CMD_NOTE="no_e2e_driver_found"
fi

write_blocked_run() {
  local scenario="$1"
  local run="$2"
  local run_dir="$RUNS_DIR/$scenario/$run"
  local ts

  mkdir -p "$run_dir"
  ts=$(timestamp_utc)
  echo "$ts" > "$run_dir/TS.txt"

  if [[ -n "$E2E_CMD" ]]; then
    echo "$E2E_CMD" > "$run_dir/CMD.txt"
  else
    echo "<none>" > "$run_dir/CMD.txt"
  fi

  {
    echo "[HARVEST] BLOCKED"
    echo "reason=$E2E_CMD_NOTE"
    echo "policy=Tauri-only; no web server/preview"
    echo "note=No automated chat E2E run executed"
  } > "$run_dir/RAW.log"

  echo "NO_MATCHES" > "$run_dir/EXTRACT_CHAT_DECISION.txt"
  echo "NO_MATCHES" > "$run_dir/EXTRACT_OFFLINE_TEXT.txt"
  echo "NO_MATCHES" > "$run_dir/EXTRACT_NO_FALSE_OFFLINE.txt"

  {
    echo "RESULT=BLOCKED"
    echo "reason=$E2E_CMD_NOTE"
  } > "$run_dir/NOTES.txt"
}

for scenario in S1 S2 S3; do
  for run in run1 run2 run3; do
    write_blocked_run "$scenario" "$run"
  done
done

echo "Harvest complete: $RUNS_DIR"