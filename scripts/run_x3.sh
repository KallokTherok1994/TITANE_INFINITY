#!/usr/bin/env bash
# scripts/run_x3.sh — Run all gates x3 for reproducibility proof
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/run_x3.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
export PROOF_PACKS_DIR="${PROOF_PACKS_DIR:-${ROOT}/proof_packs}"

echo "======================================================================"
echo " TITANE_INFINITY — run_x3.sh — Reproducibility x3"
echo " $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "======================================================================"

FAIL=0
for RUN in 1 2 3; do
  echo ""
  echo ">>> RUN $RUN/3 <<<"
  export PROOF_PACKS_RUN="${PROOF_PACKS_DIR}/run_x3_${RUN}"
  PROOF_PACKS_DIR_ORIG="$PROOF_PACKS_DIR"
  export PROOF_PACKS_DIR="$PROOF_PACKS_RUN"
  bash "${SCRIPT_DIR}/run_all.sh" || FAIL=$((FAIL+1))
  export PROOF_PACKS_DIR="$PROOF_PACKS_DIR_ORIG"
done

echo ""
echo "======================================================================"
if [[ $FAIL -eq 0 ]]; then
  echo " x3 REPRODUCIBILITY: PASS (0 failures across 3 runs)"
  printf '{"ts":"%s","x3":"PASS","fail_runs":0}\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    >> "${PROOF_PACKS_DIR}/run_x3_summary.jsonl"
  exit 0
else
  echo " x3 REPRODUCIBILITY: FAIL ($FAIL run(s) failed) — STOP-THE-LINE"
  printf '{"ts":"%s","x3":"FAIL","fail_runs":%d}\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$FAIL" \
    >> "${PROOF_PACKS_DIR}/run_x3_summary.jsonl"
  exit 1
fi
