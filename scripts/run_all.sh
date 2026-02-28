#!/usr/bin/env bash
# scripts/run_all.sh — Run all gate checks sequentially
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/run_all.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CHECKS_DIR="${ROOT}/checks"
export PROOF_PACKS_DIR="${PROOF_PACKS_DIR:-${ROOT}/proof_packs}"

echo "======================================================================"
echo " TITANE_INFINITY — run_all.sh — $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo " PROOF_PACKS_DIR: ${PROOF_PACKS_DIR}"
echo "======================================================================"

mkdir -p "${PROOF_PACKS_DIR}"

PASS=0
FAIL=0
BLOCKED=0
RESULTS=()

run_check() {
  local script="$1"
  local name
  name="$(basename "$script" .sh)"
  echo ""
  echo "--- $name ---"
  set +e
  bash "$script"
  local rc=$?
  set -e
  if [[ $rc -eq 0 ]]; then
    PASS=$((PASS+1))
    RESULTS+=("PASS  $name")
  else
    FAIL=$((FAIL+1))
    RESULTS+=("FAIL  $name")
  fi
  return $rc
}

OVERALL_FAIL=0
for check in "${CHECKS_DIR}"/check_G*.sh; do
  run_check "$check" || OVERALL_FAIL=1
done

echo ""
echo "======================================================================"
echo " SUMMARY"
echo "======================================================================"
for r in "${RESULTS[@]}"; do
  echo "  $r"
done
echo ""
echo "  PASS: $PASS  FAIL: $FAIL"
echo "======================================================================"

# Write summary JSONL
SUMMARY_FILE="${PROOF_PACKS_DIR}/run_all_summary.jsonl"
printf '{"ts":"%s","pass":%d,"fail":%d,"results":%s}\n' \
  "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$PASS" "$FAIL" \
  "$(printf '%s\n' "${RESULTS[@]}" | python3 -c 'import json,sys; print(json.dumps([l for l in sys.stdin.read().splitlines() if l]))')" \
  >> "$SUMMARY_FILE"

if [[ $OVERALL_FAIL -ne 0 ]]; then
  echo "STOP-THE-LINE: One or more gates FAILED"
  exit 1
fi
echo "ALL GATES PASSED"
exit 0
