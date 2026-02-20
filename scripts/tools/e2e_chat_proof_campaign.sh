#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
PROOF_DIR="$ROOT/docs/_evidence/ONLINE_CHAT_FIX_20260220_115300"
RUNS_DIR="$PROOF_DIR/runs"
SPEC="e2e/desktop/online-chat-proof-ui.wdio.test.js"
WDIO_CFG="wdio.desktop.conf.cjs"

if [[ ! -d "$PROOF_DIR" ]]; then
  echo "Proof pack not found: $PROOF_DIR" >&2
  exit 1
fi

command -v pnpm >/dev/null 2>&1 || { echo "pnpm missing" >&2; exit 1; }
command -v tauri-driver >/dev/null 2>&1 || { echo "tauri-driver missing" >&2; exit 1; }
command -v rg >/dev/null 2>&1 || { echo "rg missing" >&2; exit 1; }

PNPM_BIN=""
if [[ -x "$ROOT/.tools/node/current/bin/pnpm" ]]; then
  PNPM_BIN="$ROOT/.tools/node/current/bin/pnpm"
elif command -v corepack >/dev/null 2>&1; then
  PNPM_BIN="corepack pnpm"
elif command -v pnpm >/dev/null 2>&1; then
  PNPM_BIN="pnpm"
else
  echo "pnpm executable not resolvable" >&2
  exit 1
fi

mkdir -p "$RUNS_DIR"

TITANE_BINARY_PATH="$(command -v titane-infinity 2>/dev/null || true)"

run_one() {
  local scenario="$1"
  local run="$2"
  local run_dir="$RUNS_DIR/$scenario/$run"
  local ts cmd ec status reason

  mkdir -p "$run_dir"
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  echo "$ts" > "$run_dir/TS.txt"

  cmd="TITANE_PROOF_SCENARIO=$scenario TITANE_PROOF_RUN=$run TAURI_BINARY_PATH=${TITANE_BINARY_PATH:-} $PNPM_BIN exec wdio run $WDIO_CFG --spec $SPEC"
  echo "$cmd" > "$run_dir/CMD.txt"

  pushd "$ROOT" >/dev/null

  if [[ "$scenario" == "S2" ]]; then
    export OFFLINE_SIM=1
  else
    unset OFFLINE_SIM || true
  fi

  : > "$run_dir/RAW.log"

  set +e
  timeout 300s bash -lc "set -euo pipefail; tauri-driver --port 4444 > '$run_dir/TAURI_DRIVER.log' 2>&1 & DRIVER_PID=\$!; trap 'kill \$DRIVER_PID >/dev/null 2>&1 || true' EXIT; sleep 1; $cmd" > "$run_dir/RAW.log" 2>&1
  ec=$?
  set -e

  {
    rg -n "CHAT_DECISION" "$run_dir/RAW.log" || true
    rg -n "CHAT_DECISION" "$run_dir/TAURI_DRIVER.log" || true
  } > "$run_dir/EXTRACT_CHAT_DECISION.txt"
  if [[ ! -s "$run_dir/EXTRACT_CHAT_DECISION.txt" ]]; then
    echo "NO_MATCHES" > "$run_dir/EXTRACT_CHAT_DECISION.txt"
  fi

  {
    rg -n "Réponse en mode hors ligne|Reponse en mode hors ligne" "$run_dir/RAW.log" || true
    rg -n "Réponse en mode hors ligne|Reponse en mode hors ligne" "$run_dir/TAURI_DRIVER.log" || true
  } > "$run_dir/EXTRACT_OFFLINE_TEXT.txt"
  if [[ ! -s "$run_dir/EXTRACT_OFFLINE_TEXT.txt" ]]; then
    echo "NO_MATCHES" > "$run_dir/EXTRACT_OFFLINE_TEXT.txt"
  fi

  {
    rg -n "CRITICAL_CONTRADICTION|NO_FALSE_OFFLINE" "$run_dir/RAW.log" || true
    rg -n "CRITICAL_CONTRADICTION|NO_FALSE_OFFLINE" "$run_dir/TAURI_DRIVER.log" || true
  } > "$run_dir/EXTRACT_NO_FALSE_OFFLINE.txt"
  if [[ ! -s "$run_dir/EXTRACT_NO_FALSE_OFFLINE.txt" ]]; then
    echo "NO_MATCHES" > "$run_dir/EXTRACT_NO_FALSE_OFFLINE.txt"
  fi

  status="FAIL"
  reason="criteria_not_met"

  if [[ $ec -ne 0 ]]; then
    status="BLOCKED"
    reason="wdio_or_driver_failed_exit_$ec"
  else
    case "$scenario" in
      S1)
        if rg -q "CHAT_DECISION\] online=true reason(_code)?=ONLINE_OK" "$run_dir/EXTRACT_CHAT_DECISION.txt" && ! rg -q "Réponse en mode hors ligne|Reponse en mode hors ligne" "$run_dir/EXTRACT_OFFLINE_TEXT.txt"; then
          status="PASS"
          reason="online_ok_no_offline_text"
        else
          status="FAIL"
          reason="missing_online_ok_or_offline_text_present"
        fi
        ;;
      S2)
        if rg -q "CHAT_DECISION\] online=false reason(_code)?=OFFLINE_" "$run_dir/EXTRACT_CHAT_DECISION.txt" && rg -q "Réponse en mode hors ligne|Reponse en mode hors ligne" "$run_dir/EXTRACT_OFFLINE_TEXT.txt"; then
          status="PASS"
          reason="offline_real_confirmed"
        else
          status="FAIL"
          reason="missing_offline_decision_or_offline_text"
        fi
        ;;
      S3)
        if rg -q "CHAT_DECISION\] online=true reason(_code)?=ONLINE_OK" "$run_dir/EXTRACT_CHAT_DECISION.txt" && ! rg -q "Réponse en mode hors ligne|Reponse en mode hors ligne" "$run_dir/EXTRACT_OFFLINE_TEXT.txt"; then
          status="PASS"
          reason="recovery_online_ok"
        else
          status="FAIL"
          reason="recovery_not_confirmed"
        fi
        ;;
    esac
  fi

  {
    echo "RESULT=$status"
    echo "reason=$reason"
    echo "exit_code=$ec"
  } > "$run_dir/NOTES.txt"

  popd >/dev/null

  sleep 1
}

for s in S1 S2 S3; do
  for r in run1 run2 run3; do
    run_one "$s" "$r"
  done
done

echo "Campaign complete: $RUNS_DIR"
