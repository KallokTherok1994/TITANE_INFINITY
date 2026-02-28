#!/usr/bin/env bash
# scripts/lib/run_x3.sh — Exécute une commande 3 fois et log les résultats
# Usage: bash scripts/lib/run_x3.sh <logfile> <cmd> [args...]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <logfile> <cmd> [args...]"
  exit 1
fi

LOGFILE="$1"; shift
CMD=("$@")
PASS_COUNT=0
FAIL_COUNT=0

mkdir -p "$(dirname "$LOGFILE")"

{
  echo "=== run_x3 START: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  echo "CMD: ${CMD[*]}"
  echo ""

  for RUN in 1 2 3; do
    echo "--- RUN ${RUN}/3: $(date -u +%H:%M:%SZ) ---"
    if "${CMD[@]}" 2>&1 | redact_secrets; then
      echo "--- RUN ${RUN}/3: PASS ---"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      echo "--- RUN ${RUN}/3: FAIL (exit $?) ---"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    echo ""
  done

  echo "=== run_x3 SUMMARY: PASS=${PASS_COUNT}/3 FAIL=${FAIL_COUNT}/3 ==="
  if [[ $FAIL_COUNT -gt 0 ]]; then
    echo "VERDICT: BLOCKED (${FAIL_COUNT} failure(s) in 3 runs)"
    exit 1
  else
    echo "VERDICT: PASS (3/3)"
  fi
} | tee -a "$LOGFILE"
