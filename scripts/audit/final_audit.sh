#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"

NO_SKIPS_STATUS="PASS"
if ! bash scripts/checks/gate_no_skips.sh > "$PROOF_PACK/.audit_no_skips.log" 2>&1; then
  NO_SKIPS_STATUS="FAIL"
fi
cat > "$PROOF_PACK/13_NO_SKIPS_REPORT.md" <<EOF
# 13_NO_SKIPS_REPORT
- Status: $NO_SKIPS_STATUS
- Log: .audit_no_skips.log
EOF

DRIFT_STATUS="PASS"
if ! bash scripts/checks/gate_drift_zero.sh > "$PROOF_PACK/.audit_drift.log" 2>&1; then
  DRIFT_STATUS="FAIL"
fi
cat > "$PROOF_PACK/14_DRIFT_REPORT.md" <<EOF
# 14_DRIFT_REPORT
- Status: $DRIFT_STATUS
- Log: .audit_drift.log
EOF

SECRETS_STATUS="PASS"
if ! bash scripts/checks/gate_secrets_hygiene.sh > "$PROOF_PACK/.audit_secrets.log" 2>&1; then
  SECRETS_STATUS="FAIL"
fi
cat > "$PROOF_PACK/15_SECRETS_HYGIENE_REPORT.md" <<EOF
# 15_SECRETS_HYGIENE_REPORT
- Status: $SECRETS_STATUS
- Log: .audit_secrets.log
EOF

cat > "$PROOF_PACK/16_SECURITY_REPORT.md" <<'EOF'
# 16_SECURITY_REPORT
- Redteam gate: see 19_GATES_REPORT.md (G14)
- Policy gates: G4/G6/G10/G13
EOF

cat > "$PROOF_PACK/17_PERF_REPORT.md" <<'EOF'
# 17_PERF_REPORT
- Instrumentation mode: baseline command timing from x3 logs.
EOF

cat > "$PROOF_PACK/18_SCORECARDS.md" <<'EOF'
# 18_SCORECARDS
- Evals and redteam summary derived from 11_EVALS_X3.log and 12_REDTTEAM_X3.log.
EOF

cat > "$PROOF_PACK/24_RISK_LEDGER.md" <<'EOF'
# 24_RISK_LEDGER
- Residual risk: runner-level nondeterminism due shared CI/local environment.
- Mitigation: bounded timeouts + x3 replay + append-only evidence.
- Owner: release/qa
EOF
