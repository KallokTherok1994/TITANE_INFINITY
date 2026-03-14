#!/bin/bash
# run-all.sh — Master Gate Orchestrator
# Executes all gates G1-G9 sequentially with reporting

set -euo pipefail

ORCHESTRATOR_ID="run-all.sh"
TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
RUN_ID="${TIMESTAMP//:/-}"
GATES_DIR="scripts/gates"
REPORT_DIR="docs/_evidence/gate-runs"

log() {
  echo "[$TIMESTAMP] [ORCHESTRATOR] $*"
}

pass() {
  echo "✅ $*"
}

fail() {
  echo "❌ $*"
}

banner() {
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "$*"
  echo "════════════════════════════════════════════════════════════"
  echo ""
}

# Setup
mkdir -p "$REPORT_DIR"
banner "🔐 TITANE_INFINITY Gate Orchestrator (run-all.sh)"
log "Run ID: $RUN_ID"
log "Report directory: $REPORT_DIR"

# Gate definitions: (gate_num, gate_script)
GATES=(
  "1:g1-no-offline-without-reason.sh"
  "2:g2-no-force-local-in-prod.sh"
  "3:g3-legacy-divergence.sh"
  "4:g4-provider-decision-certified.sh"
  "5:g5-ci-wiring.sh"
  "6:g6-build-reproducibility.sh"
  "7:g7-tauri-allowlist-lock.sh"
  "8:g8-provider-api-only.sh"
  "9:g9-release-seal.sh"
)

TOTAL_GATES=${#GATES[@]}
PASSED_GATES=0
FAILED_GATES=0
declare -a GATE_RESULTS

# Execute each gate
banner "Running $TOTAL_GATES Gates (G1-G9)"

for gate_entry in "${GATES[@]}"; do
  GATE_NUM=$(echo "$gate_entry" | cut -d: -f1)
  GATE_SCRIPT=$(echo "$gate_entry" | cut -d: -f2)
  GATE_FILE="$GATES_DIR/$GATE_SCRIPT"
  GATE_LOG="$REPORT_DIR/G${GATE_NUM}_${RUN_ID}.log"
  
  log "────────────────────────────────────────"
  log "Executing G$GATE_NUM: $GATE_SCRIPT"
  log "────────────────────────────────────────"
  
  if [[ ! -f "$GATE_FILE" ]]; then
    fail "Gate file NOT FOUND: $GATE_FILE"
    GATE_RESULTS+=("G$GATE_NUM:MISSING")
    FAILED_GATES=$((FAILED_GATES + 1))
    continue
  fi
  
  if [[ ! -x "$GATE_FILE" ]]; then
    log "Making gate executable: $GATE_FILE"
    chmod +x "$GATE_FILE"
  fi
  
  # Execute gate with output capture
  if bash "$GATE_FILE" 2>&1 | tee "$GATE_LOG"; then
    pass "G$GATE_NUM PASS"
    GATE_RESULTS+=("G$GATE_NUM:PASS")
    PASSED_GATES=$((PASSED_GATES + 1))
  else
    fail "G$GATE_NUM FAIL"
    GATE_RESULTS+=("G$GATE_NUM:FAIL")
    FAILED_GATES=$((FAILED_GATES + 1))
  fi
  
  echo ""
done

# Generate summary report
banner "GATE RUN SUMMARY"

SUMMARY_FILE="$REPORT_DIR/RUN_${RUN_ID}_SUMMARY.md"
cat > "$SUMMARY_FILE" << EOF
# Gate Orchestrator Run — Summary

## Execution Details
- **Run ID**: $RUN_ID
- **Timestamp**: $TIMESTAMP
- **Total Gates**: $TOTAL_GATES
- **Passed**: $PASSED_GATES ✅
- **Failed**: $FAILED_GATES ❌

## Gate Results

| Gate | Status |
|------|--------|
EOF

for result in "${GATE_RESULTS[@]}"; do
  GATE=$(echo "$result" | cut -d: -f1)
  STATUS=$(echo "$result" | cut -d: -f2)
  ICON=$([ "$STATUS" = "PASS" ] && echo "✅" || echo "❌")
  echo "| $GATE | $ICON $STATUS |" >> "$SUMMARY_FILE"
done

cat >> "$SUMMARY_FILE" << EOF

## Detailed Logs
- G1: [Run Details]($REPORT_DIR/G1_${RUN_ID}.log)
- G2: [Run Details]($REPORT_DIR/G2_${RUN_ID}.log)
- G3: [Run Details]($REPORT_DIR/G3_${RUN_ID}.log)
- G4: [Run Details]($REPORT_DIR/G4_${RUN_ID}.log)
- G5: [Run Details]($REPORT_DIR/G5_${RUN_ID}.log)
- G6: [Run Details]($REPORT_DIR/G6_${RUN_ID}.log)
- G7: [Run Details]($REPORT_DIR/G7_${RUN_ID}.log)
- G8: [Run Details]($REPORT_DIR/G8_${RUN_ID}.log)
- G9: [Run Details]($REPORT_DIR/G9_${RUN_ID}.log)

## Overall Status

$([ $FAILED_GATES -eq 0 ] && echo "### ✅ ALL GATES PASS" || echo "### ❌ GATES FAILED: $FAILED_GATES")"

$([ $FAILED_GATES -eq 0 ] && echo "**Ready for production release.**" || echo "**Blocking issues detected. Review failed gates above.**")"

EOF

pass "Summary report generated: $SUMMARY_FILE"

# Final status
banner "ORCHESTRATOR COMPLETE"
log "Passed: $PASSED_GATES/$TOTAL_GATES"
log "Failed: $FAILED_GATES/$TOTAL_GATES"

if [[ $FAILED_GATES -eq 0 ]]; then
  banner "✅ ALL GATES PASS — READY FOR PRODUCTION"
  exit 0
else
  banner "❌ GATES FAILED — REVIEW REQUIRED"
  exit 1
fi
