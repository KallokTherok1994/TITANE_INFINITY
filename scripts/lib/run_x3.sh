#!/usr/bin/env bash
# scripts/lib/run_x3.sh — Exécute une commande 3 fois et stop au premier échec
# Usage:
#   bash scripts/lib/run_x3.sh <logfile> <cmd> [args...]
#   bash scripts/lib/run_x3.sh <logfile> <timeout_sec> <cmd> [args...]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <logfile> [timeout_sec] <cmd> [args...]"
  exit 1
fi

LOGFILE="$1"; shift
TIMEOUT_SECS=""
if [[ $# -ge 2 && "$1" =~ ^[0-9]+$ ]]; then
  TIMEOUT_SECS="$1"
  shift
fi

CMD=("$@")
PASS_COUNT=0

mkdir -p "$(dirname "$LOGFILE")"

{
  echo "=== run_x3 START: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  if [[ -n "$TIMEOUT_SECS" ]]; then
    echo "TIMEOUT_PER_RUN: ${TIMEOUT_SECS}s"
  fi
  echo "CMD: ${CMD[*]}"
  echo ""

  for RUN in 1 2 3; do
    echo "--- RUN ${RUN}/3: $(date -u +%H:%M:%SZ) ---"
    set +e
    if [[ -n "$TIMEOUT_SECS" ]]; then
      timeout "$TIMEOUT_SECS" "${CMD[@]}" 2>&1 | redact_secrets
      EXIT_CODE=${PIPESTATUS[0]}
    else
      "${CMD[@]}" 2>&1 | redact_secrets
      EXIT_CODE=${PIPESTATUS[0]}
    fi
    set -e

    if [[ $EXIT_CODE -eq 0 ]]; then
      echo "--- RUN ${RUN}/3: PASS ---"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      echo "--- RUN ${RUN}/3: FAIL (exit ${EXIT_CODE}) ---"
      echo "=== run_x3 SUMMARY: PASS=${PASS_COUNT}/3 FAIL=1+/3 ==="
      echo "VERDICT: FAIL"
      exit "$EXIT_CODE"
    fi
    echo ""
  done

  echo "=== run_x3 SUMMARY: PASS=${PASS_COUNT}/3 FAIL=0/3 ==="
  echo "VERDICT: PASS (3/3)"
} | tee -a "$LOGFILE"
