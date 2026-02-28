#!/bin/bash

set -euo pipefail

LOCK_FILE="${F2_LOCK_FILE:-/tmp/f2-rc-gates-x3.lock}"
PID_FILE="${F2_PID_FILE:-/tmp/f2_x3_fixed.pid}"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [F2-X3] STOP: runner déjà actif (lock=$LOCK_FILE)" >&2
  exit 99
fi

echo "$$" > "$PID_FILE"
cleanup_pid() {
  if [[ -f "$PID_FILE" ]] && [[ "$(cat "$PID_FILE" 2>/dev/null || true)" == "$$" ]]; then
    rm -f "$PID_FILE"
  fi
}

overall_fail=0

BASE_DIR="${1:-}"
if [[ -z "$BASE_DIR" ]]; then
  echo "Usage: $0 <evidence_dir>" >&2
  exit 2
fi

mkdir -p "$BASE_DIR/f2_gates"
rm -f "$BASE_DIR/f2_gates/run1.txt" "$BASE_DIR/f2_gates/run2.txt" "$BASE_DIR/f2_gates/run3.txt" "$BASE_DIR/f2_gates/summary_latest.txt"

write_summary() {
  if [[ "${SUMMARY_WRITTEN:-0}" -eq 1 ]]; then
    return 0
  fi
  local summary="$BASE_DIR/f2_gates/summary_latest.txt"
  {
    echo "F2_X3_SUMMARY $(date -Iseconds)"
    echo "OVERALL_FAIL_COUNT=${overall_fail}"
    for i in 1 2 3; do
      out="$BASE_DIR/f2_gates/run${i}.txt"
      if [[ -f "$out" ]]; then
        verdict=$(rg -n "^RC_VERDICT=" "$out" | tail -n1 | cut -d= -f2 || true)
        fails=$(rg -n "^RC_FAIL_COUNT=" "$out" | tail -n1 | cut -d= -f2 || true)
        echo "run${i}: VERDICT=${verdict:-UNKNOWN} FAILS=${fails:-UNKNOWN} FILE=${out}"
      else
        echo "run${i}: VERDICT=MISSING FAILS=MISSING FILE=${out}"
      fi
    done
  } > "$summary"
  SUMMARY_WRITTEN=1
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [F2-X3] summary généré -> ${summary}"
}

on_interrupt() {
  log "INTERRUPTED: génération du summary partiel avant sortie"
  write_summary
  exit 130
}

on_exit() {
  write_summary
  cleanup_pid
}

trap on_interrupt INT TERM
trap on_exit EXIT

F2_FRONTEND_TIMEOUT_SEC="${F2_FRONTEND_TIMEOUT_SEC:-120}"
F2_ALLOWLIST_TIMEOUT_SEC="${F2_ALLOWLIST_TIMEOUT_SEC:-120}"
F2_POLICY_TIMEOUT_SEC="${F2_POLICY_TIMEOUT_SEC:-180}"
F2_SCHEMA_TIMEOUT_SEC="${F2_SCHEMA_TIMEOUT_SEC:-300}"
F2_SECRETS_TIMEOUT_SEC="${F2_SECRETS_TIMEOUT_SEC:-180}"
F2_PROVIDER_TIMEOUT_SEC="${F2_PROVIDER_TIMEOUT_SEC:-180}"
F2_G6_TIMEOUT_SEC="${F2_G6_TIMEOUT_SEC:-5400}"

log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [F2-X3] $*"
}

run_gate() {
  local gate_name="$1"
  local timeout_sec="$2"
  shift 2

  echo "--- ${gate_name} ---"
  echo "START=$(date -Iseconds) TIMEOUT=${timeout_sec}s"
  set +e
  timeout "${timeout_sec}" "$@"
  local code=$?
  set -e
  echo "END=$(date -Iseconds) EXIT_CODE=${code}"
  return "$code"
}

for i in 1 2 3; do
  out="$BASE_DIR/f2_gates/run${i}.txt"
  fail=0
  state_file="/tmp/f2_x3_run${i}.state"
  echo "INIT" > "$state_file"

  heartbeat_pid=""
  (
    while true; do
      state="$(cat "$state_file" 2>/dev/null || echo UNKNOWN)"
      log "run${i} heartbeat: ${state}"
      sleep 15
    done
  ) &
  heartbeat_pid=$!

  {
    echo "===== F2 RC GATES RUN ${i} $(date -Iseconds) ====="

    echo "G_RC_FRONTEND_NO_OPEN_WEB" > "$state_file"
    run_gate "G_RC_FRONTEND_NO_OPEN_WEB" "$F2_FRONTEND_TIMEOUT_SEC" bash scripts/audit_no_frontend_network.sh || fail=$((fail+1))
    echo "G_RC_ALLOWLIST_DEFAULT_DENY" > "$state_file"
    run_gate "G_RC_ALLOWLIST_DEFAULT_DENY" "$F2_ALLOWLIST_TIMEOUT_SEC" bash scripts/gates/g7-tauri-allowlist-lock.sh || fail=$((fail+1))
    echo "G_RC_POLICY_ENGINE_REQUIRED" > "$state_file"
    run_gate "G_RC_POLICY_ENGINE_REQUIRED" "$F2_POLICY_TIMEOUT_SEC" bash scripts/guards/guard-network-policy.sh || fail=$((fail+1))
    echo "G_RC_SCHEMA_CONTRACT_REQUIRED" > "$state_file"
    run_gate "G_RC_SCHEMA_CONTRACT_REQUIRED" "$F2_SCHEMA_TIMEOUT_SEC" pnpm -s exec vitest run tests/contract/tauri-ipc-contract.test.ts || fail=$((fail+1))
    echo "G_RC_NO_SECRETS" > "$state_file"
    run_gate "G_RC_NO_SECRETS" "$F2_SECRETS_TIMEOUT_SEC" bash scripts/security/secret-scan.sh || fail=$((fail+1))
    echo "G_RC_PROVIDER_COMPLIANCE" > "$state_file"
    run_gate "G_RC_PROVIDER_COMPLIANCE" "$F2_PROVIDER_TIMEOUT_SEC" bash scripts/gates/g8-provider-api-only.sh || fail=$((fail+1))
    echo "G_RC_BUILD_REPRODUCIBLE_CHECK" > "$state_file"
    run_gate "G_RC_BUILD_REPRODUCIBLE_CHECK" "$F2_G6_TIMEOUT_SEC" bash scripts/gates/g6-build-reproducibility.sh || fail=$((fail+1))

    echo "RC_FAIL_COUNT=${fail}"
    if [[ "$fail" -eq 0 ]]; then
      echo "RC_VERDICT=PASS"
    else
      echo "RC_VERDICT=FAIL"
    fi
  } > "$out" 2>&1

  if [[ -n "$heartbeat_pid" ]] && ps -p "$heartbeat_pid" >/dev/null 2>&1; then
    kill "$heartbeat_pid" || true
  fi
  rm -f "$state_file"

  if [[ "$fail" -ne 0 ]]; then
    overall_fail=$((overall_fail + fail))
  fi

  log "run${i} terminé -> ${out}"
done

write_summary

if [[ "$overall_fail" -ne 0 ]]; then
  log "STOP_THE_LINE: F2_X3 en échec (OVERALL_FAIL_COUNT=${overall_fail})"
  exit 1
fi

log "F2_X3 PASS"
