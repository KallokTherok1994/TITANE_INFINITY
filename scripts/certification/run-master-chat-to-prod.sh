#!/bin/bash
# run-master-chat-to-prod.sh — TITANE_INFINITY Master Certification Orchestrator
# Authorization: GO_MASTER_AUTOFIX_AUTOHEAL_CHAT_TO_PROD__TITANE_INFINITY
# Mode: CONSTITUTIONAL / PROOF-DRIVEN / STOP-THE-LINE / 100% AUTO

set -euo pipefail

REPO_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
MASTER_RUN_ID="MASTER_$(date -u +'%Y%m%dT%H%M%SZ')"
MASTER_DIR="$REPO_ROOT/deployment/latest/certification/master_runs/$MASTER_RUN_ID"
MASTER_LOG="$MASTER_DIR/MASTER.log"

# Import helpers
source "$REPO_ROOT/scripts/certification/lib_cert.sh"

# Track phase results
declare -A PHASE_RESULTS
declare -A PHASE_LOOPS
TOTAL_AUTOFIX_LOOPS=0
MAX_TOTAL_AUTOFIX_LOOPS=6

mkdir -p "$MASTER_DIR"
exec 1> >(tee "$MASTER_LOG")
exec 2>&1

# =========================================================
# MASTER PROLOGUE
# =========================================================

log_cmd "╔════════════════════════════════════════════════════════════╗"
log_cmd "║  MASTER RUN: CHAT TO PROD CERTIFICATION PIPELINE          ║"
log_cmd "╚════════════════════════════════════════════════════════════╝"
log_cmd ""
log_cmd "Master Run ID: $MASTER_RUN_ID"
log_cmd "Master Dir: $MASTER_DIR"
log_cmd "Repo Root: $REPO_ROOT"
log_cmd "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
log_cmd ""
log_cmd "Authorization: GO_MASTER_AUTOFIX_AUTOHEAL_CHAT_TO_PROD__TITANE_INFINITY ✅"
log_cmd "Mode: CONSTITUTIONAL / PROOF-DRIVEN / STOP-THE-LINE / 100% AUTO"
log_cmd ""

# =========================================================
# FLAGS PARSING
# =========================================================

DRY_RUN=0
STUB_MODE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --run) DRY_RUN=0 ;;
    --stub-mode|--framework-validation) STUB_MODE=1 ;;
    *) ;;
  esac
  shift
done

if [ $STUB_MODE -eq 1 ]; then
  log_cmd "⚠️ STUB MODE (Framework Validation Only)"
  log_cmd "   THIS RUN DOES NOT CERTIFY PRODUCTION"
  log_cmd "   Stub phases for orchestration testing only"
  log_cmd ""
fi

if [ $DRY_RUN -eq 1 ]; then
  log_cmd "⏳ DRY-RUN MODE: No execution, plan only"
  log_cmd ""
fi

# =========================================================
# PHASE RUNNER (with autoheal loop)
# =========================================================

run_phase() {
  local phase_id="$1"
  local phase_script="$2"
  local phase_prerequisite="${3:-}" # e.g., "P10_4"
  
  log_cmd ""
  log_cmd "╔════════════════════════════════════════════════════════════╗"
  log_cmd "║  PHASE: $phase_id"
  log_cmd "╚════════════════════════════════════════════════════════════╝"
  
  # Check prerequisite
  if [ -n "$phase_prerequisite" ]; then
    local prereq_status="${PHASE_RESULTS[$phase_prerequisite]:-UNKNOWN}"
    if [ "$prereq_status" != "PASS" ]; then
      log_cmd "❌ BLOCKED: Prerequisite $phase_prerequisite = $prereq_status"
      PHASE_RESULTS[$phase_id]="BLOCKED"
      PHASE_LOOPS[$phase_id]=0
      return 90  # BLOCKED_AUTOFIX_LIMIT_REACHED
    fi
  fi
  
  # Create phase pack
  local pack_dir=$(mk_pack_dir "$phase_id")
  PHASE_LOOPS[$phase_id]=0
  
  log_cmd "Pack Dir: $pack_dir"
  
  # Autofix loop (MAX 2 per phase)
  while [ "${PHASE_LOOPS[$phase_id]}" -lt 2 ]; do
    local loop_num=$((${PHASE_LOOPS[$phase_id]} + 1))
    PHASE_LOOPS[$phase_id]=$loop_num
    TOTAL_AUTOFIX_LOOPS=$((TOTAL_AUTOFIX_LOOPS + 1))
    
    log_cmd ""
    log_cmd "▶ AUTOFIX LOOP $loop_num / 2 (Total: $TOTAL_AUTOFIX_LOOPS / $MAX_TOTAL_AUTOFIX_LOOPS)"
    
    if [ $DRY_RUN -eq 1 ]; then
      log_cmd "[DRY-RUN] Would execute: $phase_script $pack_dir"
      PHASE_RESULTS[$phase_id]="PASS"
      seal_pack "$pack_dir" "$phase_id" "PASS"
      append_registry "$pack_dir" "$phase_id" "PASS" "DRY-RUN"
      return 0
    fi
    
    # Execute phase
    if bash "$phase_script" "$pack_dir" > "$pack_dir/PHASE_LOG.txt" 2>&1; then
      log_cmd "✅ PHASE PASS"
      PHASE_RESULTS[$phase_id]="PASS"
      seal_pack "$pack_dir" "$phase_id" "PASS"
      append_registry "$pack_dir" "$phase_id" "PASS"
      commit_and_push "$pack_dir" "$phase_id" "PASS" "Phase passed on loop $loop_num"
      return 0
    else
      local exit_code=$?
      log_cmd "❌ PHASE FAIL (exit $exit_code, loop $loop_num)"
      
      # Classify failure
      local failure_class=$(classify_failure "$(cat "$pack_dir/PHASE_LOG.txt" 2>/dev/null || echo '')")
      log_cmd "Failure Class: $failure_class"
      
      # Decision: retry or stop?
      if [ "$loop_num" -lt 2 ] && [ $TOTAL_AUTOFIX_LOOPS -lt $MAX_TOTAL_AUTOFIX_LOOPS ]; then
        log_cmd "⏳ Autofix opportunity remaining. Retrying..."
        sleep 2
      elif [ $TOTAL_AUTOFIX_LOOPS -ge $MAX_TOTAL_AUTOFIX_LOOPS ]; then
        log_cmd "❌ AUTOFIX LIMIT REACHED ($MAX_TOTAL_AUTOFIX_LOOPS total loops)"
        PHASE_RESULTS[$phase_id]="FAIL"
        seal_pack "$pack_dir" "$phase_id" "FAIL"
        append_registry "$pack_dir" "$phase_id" "FAIL" "$failure_class (autofix limit)"
        commit_and_push "$pack_dir" "$phase_id" "FAIL" "Autofix limit reached"
        return 90
      else
        log_cmd "❌ STOPPING: Phase failed, no retry"
        PHASE_RESULTS[$phase_id]="FAIL"
        seal_pack "$pack_dir" "$phase_id" "FAIL"
        append_registry "$pack_dir" "$phase_id" "FAIL" "$failure_class"
        commit_and_push "$pack_dir" "$phase_id" "FAIL" "Phase execution failed"
        return 30  # Generic FAIL
      fi
    fi
  done
}

# =========================================================
# PHASE SEQUENCE (NO SKIPS, STOP-THE-LINE)
# =========================================================

log_cmd "PHASE SEQUENCE:"
log_cmd "  P10.4  → Infra IPC Stabilization (E2E prerequisite)"
log_cmd "  P10.3.2R → Desktop E2E x3 Full Cert (requires P10.4 PASS)"
log_cmd "  P10.5  → Chat Functional + Soak (requires P10.3.2R PASS)"
log_cmd "  P10.6  → Production Build Cert (requires P10.5 PASS)"
log_cmd "  P10.7  → Packaging Field Smoke (requires P10.6 PASS)"
log_cmd "  P10.8  → Ops Support Cert (requires P10.7 PASS)"
log_cmd "  P11    → Final Human Acceptance (requires P10.8 PASS)"
log_cmd ""

if [ $DRY_RUN -eq 1 ]; then
  log_cmd "DRY-RUN: Phases would execute in above order."
  log_cmd "         Use --run to execute."
  log_cmd ""
  exit 0
fi

# Phase script paths (with STUB override)
if [ $STUB_MODE -eq 1 ]; then
  P10_4_SCRIPT="$REPO_ROOT/scripts/certification/phases_stub/p10_4_infra_stub.sh"
  P10_3_2R_SCRIPT="$REPO_ROOT/scripts/certification/phases_stub/p10_3_2r_e2e_stub.sh"
  P10_5_SCRIPT="$REPO_ROOT/scripts/certification/phases_stub/p10_5_chat_stub.sh"
  P10_6_SCRIPT="$REPO_ROOT/scripts/certification/phases_stub/p10_6_build_stub.sh"
  P10_7_SCRIPT="$REPO_ROOT/scripts/certification/phases_stub/p10_7_pkg_stub.sh"
  P10_8_SCRIPT="$REPO_ROOT/scripts/certification/phases_stub/p10_8_ops_stub.sh"
else
  P10_4_SCRIPT="$REPO_ROOT/scripts/certification/p10_4_infra_ipc.sh"
  P10_3_2R_SCRIPT="$REPO_ROOT/scripts/certification/p10_3_2r_e2e_full.sh"
  P10_5_SCRIPT="$REPO_ROOT/scripts/certification/p10_5_chat_functional.sh"
  P10_6_SCRIPT="$REPO_ROOT/scripts/certification/p10_6_prod_build.sh"
  P10_7_SCRIPT="$REPO_ROOT/scripts/certification/p10_7_packaging_smoke.sh"
  P10_8_SCRIPT="$REPO_ROOT/scripts/certification/p10_8_ops_support.sh"
fi

# P10.4
run_phase "P10_4" "$P10_4_SCRIPT" "" || {
  log_cmd "⏹ STOP-THE-LINE: P10.4 failed. Aborting."
  exit 40
}

# P10.3.2R
run_phase "P10_3_2R" "$P10_3_2R_SCRIPT" "P10_4" || {
  log_cmd "⏹ STOP-THE-LINE: P10.3.2R failed. Aborting."
  exit 30
}

# P10.5
run_phase "P10_5" "$P10_5_SCRIPT" "P10_3_2R" || {
  log_cmd "⏹ STOP-THE-LINE: P10.5 failed. Aborting."
  exit 30
}

# P10.6
run_phase "P10_6" "$P10_6_SCRIPT" "P10_5" || {
  log_cmd "⏹ STOP-THE-LINE: P10.6 failed. Aborting."
  exit 60
}

# P10.7
run_phase "P10_7" "$P10_7_SCRIPT" "P10_6" || {
  log_cmd "⏹ STOP-THE-LINE: P10.7 failed. Aborting."
  exit 70
}

# P10.8
run_phase "P10_8" "$P10_8_SCRIPT" "P10_7" || {
  log_cmd "⏹ STOP-THE-LINE: P10.8 failed. Aborting."
  exit 80
}

# P11 (Human acceptance — Kevin only, manual approval)
# This phase is non-executable by automation
log_cmd ""
log_cmd "╔════════════════════════════════════════════════════════════╗"
log_cmd "║  PHASE: P11 (FINAL HUMAN ACCEPTANCE)                      ║"
log_cmd "╚════════════════════════════════════════════════════════════╝"
log_cmd ""
log_cmd "⏸ AWAITING HUMAN DECISION (Kevin manual testing)"
log_cmd "   This phase requires explicit user approval and cannot be automated."
log_cmd "   Kevin will test manually and provide approval token."
PHASE_RESULTS["P11"]="PENDING_HUMAN"

# =========================================================
# MASTER EPILOGUE
# =========================================================

log_cmd ""
log_cmd "╔════════════════════════════════════════════════════════════╗"
log_cmd "║  MASTER RUN COMPLETE                                      ║"
log_cmd "╚════════════════════════════════════════════════════════════╝"
log_cmd ""

# Build master output
log_cmd "MASTER_RUN_ID: $MASTER_RUN_ID"
log_cmd ""
log_cmd "PHASE VERDICTS:"
for phase in P10_4 P10_3_2R P10_5 P10_6 P10_7 P10_8 P11; do
  local verdict="${PHASE_RESULTS[$phase]:-UNKNOWN}"
  local loops="${PHASE_LOOPS[$phase]:-0}"
  log_cmd "  $phase: $verdict (autofix loops: $loops)"
done
log_cmd ""
log_cmd "TOTAL AUTOFIX LOOPS: $TOTAL_AUTOFIX_LOOPS / $MAX_TOTAL_AUTOFIX_LOOPS"
log_cmd ""

# Determine final system status
local phases_pass=0
local phases_fail=0
for phase in P10_4 P10_3_2R P10_5 P10_6 P10_7 P10_8; do
  if [ "${PHASE_RESULTS[$phase]}" = "PASS" ]; then
    ((phases_pass++))
  elif [ "${PHASE_RESULTS[$phase]}" = "FAIL" ] || [ "${PHASE_RESULTS[$phase]}" = "BLOCKED" ]; then
    ((phases_fail++))
  fi
done

if [ $phases_fail -eq 0 ] && [ $phases_pass -eq 6 ]; then
  FINAL_SYSTEM_STATUS="READY_FOR_HUMAN_ACCEPTANCE"
  FINAL_EXIT_CODE=0
elif [ $phases_fail -gt 0 ]; then
  FINAL_SYSTEM_STATUS="NOT_READY"
  FINAL_EXIT_CODE=30
else
  FINAL_SYSTEM_STATUS="UNKNOWN"
  FINAL_EXIT_CODE=1
fi

log_cmd ""
log_cmd "PHASES_PASS: $phases_pass"
log_cmd "PHASES_FAIL: $phases_fail"
log_cmd "FINAL_SYSTEM_STATUS: $FINAL_SYSTEM_STATUS"
log_cmd ""
log_cmd "PROOF_PACK_INDEX_PATH: $MASTER_DIR"
log_cmd "MASTER_LOG: $MASTER_LOG"
log_cmd ""

if [ "$FINAL_SYSTEM_STATUS" = "READY_FOR_HUMAN_ACCEPTANCE" ]; then
  log_cmd "✅ ALL AUTOMATED PHASES PASS — READY FOR FINAL HUMAN ACCEPTANCE"
  log_cmd ""
  log_cmd "NEXT STEP: Kevin performs manual testing and provides approval."
else
  log_cmd "❌ SYSTEM NOT READY — See above for failure details"
fi

log_cmd ""
log_cmd "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"

exit $FINAL_EXIT_CODE
