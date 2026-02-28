#!/usr/bin/env bash
# checks/_lib.sh — Fonctions communes: logging, JSONL, exit codes
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/_lib.sh

set -euo pipefail

PROOF_PACKS_DIR="${PROOF_PACKS_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo ".")/proof_packs}"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

lib_log() {
  local level="$1"; shift
  echo "[${level}] $(date -u +"%H:%M:%SZ") $*" >&1
}

lib_log_jsonl() {
  local gate="$1" status="$2" message="$3"
  local pack_dir="${PROOF_PACKS_DIR}/${gate}"
  mkdir -p "$pack_dir"
  printf '{"ts":"%s","gate":"%s","status":"%s","message":%s}\n' \
    "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$gate" "$status" "$(printf '%s' "$message" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" \
    >> "${pack_dir}/run.jsonl"
}

lib_pass() {
  local gate="$1" message="$2"
  lib_log "PASS" "[$gate] $message"
  lib_log_jsonl "$gate" "PASS" "$message"
  return 0
}

lib_fail() {
  local gate="$1" message="$2"
  lib_log "FAIL" "[$gate] $message"
  lib_log_jsonl "$gate" "FAIL" "$message"
  return 1
}

lib_blocked_runner() {
  local gate="$1" cause="$2" next_action="$3"
  lib_log "BLOCKED_RUNNER" "[$gate] cause=$cause next_action=$next_action"
  lib_log_jsonl "$gate" "BLOCKED_RUNNER" "cause=$cause next_action=$next_action"
  return 0
}

lib_blocked_instrumentation() {
  local gate="$1" cause="$2" next_action="$3"
  lib_log "BLOCKED_INSTRUMENTATION" "[$gate] cause=$cause next_action=$next_action"
  lib_log_jsonl "$gate" "BLOCKED_INSTRUMENTATION" "cause=$cause next_action=$next_action"
  return 0
}

lib_require_file() {
  local gate="$1" path="$2"
  if [[ -f "$path" ]]; then
    lib_pass "$gate" "required file present: $path"
    return 0
  else
    lib_fail "$gate" "required file MISSING: $path"
    return 1
  fi
}

lib_repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}
