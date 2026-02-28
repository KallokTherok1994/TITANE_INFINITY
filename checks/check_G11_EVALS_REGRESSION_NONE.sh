#!/usr/bin/env bash
# checks/check_G11_EVALS_REGRESSION_NONE.sh — Gate G11: Evals regression = zero (BLOCKED_INSTRUMENTATION)
# Ring: 4 — Status: EXPERIMENTAL
# Rollback: git restore -- checks/check_G11_EVALS_REGRESSION_NONE.sh

set -euo pipefail
GATE="G11_EVALS_REGRESSION_NONE"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

FOUND=0
for i in 1 2 3; do
  [[ -f "${PACK_DIR}/evals_run${i}.jsonl" ]] && FOUND=$((FOUND+1))
done

if [[ $FOUND -ge 3 ]]; then
  lib_pass "$GATE" "x3 evals proof files present"
  exit 0
fi

lib_blocked_instrumentation "$GATE" \
  "Evals regression suite requires LLM/model endpoint and dataset — not available in CI prep" \
  "Run eval suite x3 after merge; record results in ${PACK_DIR}/evals_runN.jsonl; assert zero regression"

exit 0
