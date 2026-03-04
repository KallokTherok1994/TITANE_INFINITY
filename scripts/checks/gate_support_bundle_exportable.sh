#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"

for f in 03_ENV_REPORT.md 19_GATES_REPORT.md VERDICT_GLOBAL.md 22_PR_READY_REPORT.md; do
  [[ -f "$PROOF_PACK/$f" ]] || { echo "MISSING:$f"; exit 1; }
done

echo "PASS: support bundle exportable"
