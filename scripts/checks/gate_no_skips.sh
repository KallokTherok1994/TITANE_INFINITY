#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"

logs=("$PROOF_PACK/09_TESTS_X3.log" "$PROOF_PACK/11_EVALS_X3.log")
for logf in "${logs[@]}"; do
  [[ -f "$logf" ]] || { echo "MISSING:$logf"; exit 1; }
  if grep -E -i '\b(skip|skipped)\b' "$logf" | grep -E -vi '\b0 skipped\b|no skipped' >/dev/null 2>&1; then
    echo "FAIL: skipped tests detected in $logf"
    exit 1
  fi
done

echo "PASS: no skips detected"
