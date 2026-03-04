#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"

required=(
  00_EXEC_SUMMARY.md 01_INVARIANTS.md 02_DISCOVERY_MAP.md 03_ENV_REPORT.md
  04_COMMANDS_USED.md 05_TRUTH_MANIFEST.md 06_NETWORK_SURFACES.md 07_ALLOWLIST_AUDIT.md
  08_TRUTH_AUDIT.md 09_TESTS_X3.log 10_BUILD_X3.log 11_EVALS_X3.log 12_REDTTEAM_X3.log
  13_NO_SKIPS_REPORT.md 14_DRIFT_REPORT.md 15_SECRETS_HYGIENE_REPORT.md 16_SECURITY_REPORT.md
  17_PERF_REPORT.md 18_SCORECARDS.md 19_GATES_REPORT.md 20_CHANGELOG.md 21_ROLLBACKS.md
  22_PR_READY_REPORT.md 23_RC_SEAL.md 24_RISK_LEDGER.md 25_KNOWN_LIMITS.md
  VERDICT_GLOBAL.md ROOT_CAUSE.md NEXT_ACTION.md
)

missing=0
for f in "${required[@]}"; do
  [[ -f "$PROOF_PACK/$f" ]] || { echo "MISSING:$f"; missing=1; }
done

for n in $(seq 1 9); do
  d="$PROOF_PACK/OPT-$n"
  for f in PLAN.md PROOFS.md VERDICT.md DIFF.md ROLLBACK.md GATE_MATRIX.md; do
    [[ -f "$d/$f" ]] || { echo "MISSING:OPT-$n/$f"; missing=1; }
  done
done

if [[ $missing -ne 0 ]]; then
  exit 1
fi

echo "PASS: RC hardline proof pack complete"
