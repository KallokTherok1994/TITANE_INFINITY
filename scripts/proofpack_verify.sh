#!/usr/bin/env bash
# scripts/proofpack_verify.sh — Verify proof pack completeness and integrity
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/proofpack_verify.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
export PROOF_PACKS_DIR="${PROOF_PACKS_DIR:-${ROOT}/proof_packs}"

echo "======================================================================"
echo " proofpack_verify.sh — $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo " PROOF_PACKS_DIR: ${PROOF_PACKS_DIR}"
echo "======================================================================"

FAIL=0

# Check proof_packs dir exists
if [[ ! -d "$PROOF_PACKS_DIR" ]]; then
  echo "FAIL: proof_packs directory does not exist: $PROOF_PACKS_DIR"
  exit 1
fi

# Run G0 check (proof pack template completeness)
bash "${SCRIPT_DIR}/../checks/check_G0_PROOF_PACK_COMPLETE.sh" || FAIL=1

# Check run_all_summary.jsonl
SUMMARY="${PROOF_PACKS_DIR}/run_all_summary.jsonl"
if [[ -f "$SUMMARY" ]]; then
  echo "PASS: run_all_summary.jsonl present ($(wc -l < "$SUMMARY") entries)"
else
  echo "WARN: run_all_summary.jsonl missing — run scripts/run_all.sh first"
fi

# Check all JSONL files are valid JSON lines
JSONL_ERRORS=0
while IFS= read -r -d '' jsonl_file; do
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    echo "$line" | python3 -c "import json,sys; json.loads(sys.stdin.read())" 2>/dev/null || {
      echo "WARN: Invalid JSONL in $jsonl_file: $line"
      JSONL_ERRORS=$((JSONL_ERRORS+1))
    }
  done < "$jsonl_file"
done < <(find "$PROOF_PACKS_DIR" -name "*.jsonl" -print0 2>/dev/null)

if [[ $JSONL_ERRORS -eq 0 ]]; then
  echo "PASS: All JSONL files are valid"
else
  echo "WARN: $JSONL_ERRORS invalid JSONL line(s)"
fi

printf '{"ts":"%s","event":"proofpack_verify","fail":%d,"jsonl_errors":%d}\n' \
  "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$FAIL" "$JSONL_ERRORS" \
  >> "${PROOF_PACKS_DIR}/proofpack_verify.jsonl"

if [[ $FAIL -eq 0 ]]; then
  echo ""
  echo "proofpack_verify: PASS"
  exit 0
else
  echo ""
  echo "proofpack_verify: FAIL — stop-the-line"
  exit 1
fi
