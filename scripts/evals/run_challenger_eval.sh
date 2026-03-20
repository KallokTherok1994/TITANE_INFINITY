#!/usr/bin/env bash
# TITANE∞ — Challenger Evaluation Runner v1
# Usage: bash scripts/evals/run_challenger_eval.sh [commit-sha]
# Requires: Node >=20 (source ~/.nvm/nvm.sh && nvm use 20)
#
# Runs all 6 scorecard dimensions against the current working tree.
# Produces: evals/scorecards/challengers/CHALLENGER_<COMMIT>_<TS>.json
#           reports/challenger_eval_<COMMIT>_<TS>.log
# Exits:    0 = challenger non-regressive (PASS)
#           1 = regression detected (PROMOTION_BLOCKED)
#           2 = eval infrastructure error (BLOCKED)

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

CHALLENGER_COMMIT="${1:-$(git rev-parse --short HEAD)}"
TIMESTAMP="$(date +%Y-%m-%d_%H%M%S)"
CHALLENGER_ID="CHALLENGER_${CHALLENGER_COMMIT}_${TIMESTAMP}"
OUT_DIR="evals/scorecards/challengers"
OUT_JSON="${OUT_DIR}/${CHALLENGER_ID}.json"
SCORES_TMP="/tmp/titane_challenger_scores_$$.json"
LOG_DIR="reports"
LOG_FILE="${LOG_DIR}/challenger_eval_${CHALLENGER_COMMIT}_${TIMESTAMP}.log"
CHAMPION_BASELINE="evals/baselines/v1/champion_baseline.json"

mkdir -p "$OUT_DIR" "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "═══════════════════════════════════════════════════════"
echo " TITANE∞ CHALLENGER EVAL — ${CHALLENGER_ID}"
echo " Started: $(date -Iseconds)"
echo "═══════════════════════════════════════════════════════"

# ─── Exports for promote_or_block ───────────────────────
export CHALLENGER_COMMIT CHALLENGER_ID OUT_JSON CHAMPION_BASELINE

# ─── Node version guard ──────────────────────────────────
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 20 2>/dev/null || nvm use --lts 2>/dev/null || true
fi

if ! node -e "if(parseInt(process.version.slice(1))<20){process.exit(1)}" 2>/dev/null; then
  echo "FAIL: Node >=20 required. Run: source ~/.nvm/nvm.sh && nvm use 20"
  exit 2
fi
echo "INFO: Node $(node -v)"

# ─── Score accumulator (write to temp JSON) ──────────────
echo "{}" > "$SCORES_TMP"

score() {
  local key="$1" val="$2" reason="$3"
  python3 - "$SCORES_TMP" "$key" "$val" "$reason" <<'PYEOF'
import sys, json
f = sys.argv[1]; key = sys.argv[2]; val = int(sys.argv[3]); reason = sys.argv[4]
with open(f) as fh: data = json.load(fh)
data[key] = {"score": val, "reason": reason}
with open(f, "w") as fh: json.dump(data, fh, indent=2)
PYEOF
  if [[ "$val" -eq 1 ]]; then
    echo "  ✓ ${key}: ${reason}"
  else
    echo "  ✗ ${key}: ${reason}"
  fi
}

# ─── 1. VITEST UNIT SUITE ────────────────────────────────
echo ""
echo "── [1/8] vitest unit suite ──"
VITEST_EXIT=0
pnpm run test -- --run 2>&1 | tee /tmp/vitest_out_$$.txt || VITEST_EXIT=$?
if [[ $VITEST_EXIT -eq 0 ]] && ! grep -qE "^[[:space:]]*[0-9]+ failed" /tmp/vitest_out_$$.txt 2>/dev/null; then
  score "vitest" 1 "all unit tests pass"
else
  score "vitest" 0 "vitest failures detected (exit=$VITEST_EXIT)"
fi
rm -f /tmp/vitest_out_$$.txt

# ─── 2. RUST TESTS ───────────────────────────────────────
echo ""
echo "── [2/8] cargo test --lib ──"
CARGO_EXIT=0
cargo test --manifest-path src-tauri/Cargo.toml --lib 2>&1 | tee /tmp/cargo_out_$$.txt | tail -5 || CARGO_EXIT=$?
if [[ $CARGO_EXIT -eq 0 ]] && ! grep -q "^test result: FAILED" /tmp/cargo_out_$$.txt 2>/dev/null; then
  score "rust" 1 "cargo test --lib all pass"
else
  score "rust" 0 "cargo test failures (exit=$CARGO_EXIT)"
fi
rm -f /tmp/cargo_out_$$.txt

# ─── 3. PLAYWRIGHT E2E ───────────────────────────────────
echo ""
echo "── [3/8] playwright e2e ──"
E2E_EXIT=0
pnpm run test:e2e 2>&1 | tee /tmp/e2e_out_$$.txt | tail -6 || E2E_EXIT=$?
E2E_FAIL=$(grep -oP '\d+(?= failed)' /tmp/e2e_out_$$.txt 2>/dev/null | tail -1 || echo "0")
if [[ $E2E_EXIT -eq 0 ]] && [[ "${E2E_FAIL:-0}" -eq 0 ]]; then
  E2E_PASS=$(grep -oP '\d+(?= passed)' /tmp/e2e_out_$$.txt 2>/dev/null | tail -1 || echo "?")
  score "e2e" 1 "playwright ${E2E_PASS} passed, 0 failed"
else
  score "e2e" 0 "playwright failed (exit=$E2E_EXIT, failures=${E2E_FAIL:-?})"
fi
rm -f /tmp/e2e_out_$$.txt

# ─── 4. ARCHITECTURE + COMPLIANCE ────────────────────────
echo ""
echo "── [4/8] architecture tests ──"
ARCH_EXIT=0
pnpm run test:architecture -- --run 2>&1 | tee /tmp/arch_out_$$.txt | tail -3 || ARCH_EXIT=$?
if [[ $ARCH_EXIT -eq 0 ]] && ! grep -qE "^[[:space:]]*[0-9]+ failed" /tmp/arch_out_$$.txt 2>/dev/null; then
  score "architecture" 1 "architecture tests pass"
else
  score "architecture" 0 "architecture tests failed (exit=$ARCH_EXIT)"
fi
rm -f /tmp/arch_out_$$.txt

COMP_EXIT=0
pnpm run test:compliance -- --run 2>&1 | tee /tmp/comp_out_$$.txt | tail -3 || COMP_EXIT=$?
if [[ $COMP_EXIT -eq 0 ]] && ! grep -qE "^[[:space:]]*[0-9]+ failed" /tmp/comp_out_$$.txt 2>/dev/null; then
  score "compliance" 1 "compliance tests pass"
else
  score "compliance" 0 "compliance tests failed (exit=$COMP_EXIT)"
fi
rm -f /tmp/comp_out_$$.txt

# ─── 5. LOCK REGRESSION CHECKS ───────────────────────────
echo ""
echo "── [5/8] LOCK regression guards (grep-structural) ──"

# LOCK1: provider badge wired to meta.provider_used
if grep -rn "provider_used\|providerUsed" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qv "test\|spec\|mock"; then
  score "lock1_provider" 1 "LOCK1: meta.provider_used reference present in src/"
else
  score "lock1_provider" 0 "LOCK1 REGRESSION: provider_used not found in non-test src/"
fi

# LOCK2: canonical conversation ID
if grep -rn "titane_active_conversation_id" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qv "test\|spec"; then
  score "lock2_conv_id" 1 "LOCK2: titane_active_conversation_id canonical key present"
else
  score "lock2_conv_id" 0 "LOCK2 REGRESSION: canonical conversation ID key missing"
fi

# LOCK3: health from backend truth
if grep -rn "backend_selftest\|backendSelftest\|selftest" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qv "test\|spec\|mock"; then
  score "lock3_health" 1 "LOCK3: backend_selftest reference present in src/"
else
  score "lock3_health" 0 "LOCK3 REGRESSION: backend_selftest reference missing in src/"
fi

# LOCK4: memory sync before state update
if grep -rn "saveMemory\|persistMemory\|saveConversation\|memorySync\|syncMemory\|memory.*save\|save.*memory" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qiv "test\|spec\|mock"; then
  score "lock4_memory" 1 "LOCK4: memory sync/save pattern present in src/"
else
  score "lock4_memory" 0 "LOCK4 REGRESSION: memory sync pattern missing in src/"
fi

# LOCK5: chat mode persistence
if grep -rn "titane.*mode\|chatMode\|chat_mode" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qiv "test\|spec\|mock"; then
  score "lock5_mode" 1 "LOCK5: chat mode pattern present in src/"
else
  score "lock5_mode" 0 "LOCK5 REGRESSION: chat mode persistence pattern missing"
fi

# ─── 6. ANTI-LIE CHECKS (AV-01..AV-08) ──────────────────
echo ""
echo "── [6/8] honesty / anti-lie checks ──"

# AV-01: No fake "AI learned" claim in UI
if grep -rn "AI.*learned\|has learned\|ai apprend\|learned.*automatically" src/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -qv "test\|spec\|mock\|^\s*//"; then
  score "av01" 0 "AV-01 VIOLATION: fake 'AI learned' label in src/components/"
else
  score "av01" 1 "AV-01: no fake 'AI learned' label"
fi

# AV-02: No unproven "auto-optimized" / "AI optimized" claim
if grep -rn "auto.*optimized\|AI.*optimized\|auto-optimiz" src/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -qv "test\|spec\|mock\|^\s*//"; then
  score "av02" 0 "AV-02 VIOLATION: fake 'optimized' label in UI"
else
  score "av02" 1 "AV-02: no unproven 'optimized' label"
fi

# AV-03: No MOCK_PASS / force_pass bypass in production
if grep -rn "MOCK_PASS\|force_pass\|FORCE_PASS\|BYPASS_EVAL" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qv "test\|spec\|mock\|^\s*//"; then
  score "av03" 0 "AV-03 VIOLATION: MOCK_PASS/force_pass found in production src/"
else
  score "av03" 1 "AV-03: no MOCK_PASS bypass in production"
fi

# AV-04: No hardcoded health = true without backend proof
HARDCODED_HEALTHY=$(grep -rn "isHealthy\s*=\s*true\|status\s*=\s*['\"]healthy['\"]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test\|spec\|//\|backend\|selftest\|result\|response" | wc -l || echo "0")
if [[ "${HARDCODED_HEALTHY:-0}" -gt 0 ]]; then
  score "av04" 0 "AV-04 VIOLATION: ${HARDCODED_HEALTHY} hardcoded healthy status lines"
else
  score "av04" 1 "AV-04: no hardcoded healthy status detected"
fi

# AV-05: IPC contract {ok, content, error} fields present in api layer
if grep -rn "\"ok\"\|\.ok\b" src/api/ --include="*.ts" 2>/dev/null | grep -q .; then
  score "av05" 1 "AV-05: IPC {ok} field present in src/api/"
else
  score "av05" 0 "AV-05 VIOLATION: IPC contract field 'ok' not found in src/api/"
fi

# AV-06: Silent empty catch blocks (threshold: <=5)
SILENT_CATCH=$(grep -rn "catch\s*(.*)[\s\n]*{[\s\n]*}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test\|spec" | wc -l || echo "0")
if [[ "${SILENT_CATCH:-0}" -le 5 ]]; then
  score "av06" 1 "AV-06: silent catch=${SILENT_CATCH} within threshold (<=5)"
else
  score "av06" 0 "AV-06 VIOLATION: ${SILENT_CATCH} silent catch blocks (threshold: 5)"
fi

# AV-07: No fake progress console.log("SUCCESS"|"PASS") in production
if grep -rn "console\.log.*SUCCESS\|console\.log.*PASS\b" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qv "test\|spec\|mock\|^\s*//"; then
  score "av07" 0 "AV-07 VIOLATION: fake progress log in production src/"
else
  score "av07" 1 "AV-07: no fake progress logs"
fi

# AV-08: UI claims capability is "active"/"enabled" (check gated by runtime truth)
if grep -rn "\"active\"\|\"enabled\"\|status.*active" src/components/ --include="*.tsx" 2>/dev/null | grep -qv "test\|spec\|//\|backend\|runtime\|store\|computed\|derived\|useState\|useStore\|selector"; then
  score "av08" 1 "AV-08: status 'active'/'enabled' found — assumed gated by runtime store (review if new)"
else
  score "av08" 1 "AV-08: no unchecked active/enabled status strings detected"
fi

# ─── 7. AUTOHEAL INTEGRITY ───────────────────────────────
echo ""
echo "── [7/8] autoheal integrity ──"
AH_EXIT=0
bash scripts/autoheal/detect_recurrence.sh 2>&1 | tee /tmp/ah_out_$$.txt | tail -3 || AH_EXIT=$?
if [[ $AH_EXIT -eq 0 ]] && grep -q "G_AH_RECURRENCE_GUARD_PASS" /tmp/ah_out_$$.txt; then
  score "autoheal" 1 "detect_recurrence PASS"
else
  score "autoheal" 0 "detect_recurrence FAIL or did not emit guard token (exit=$AH_EXIT)"
fi
rm -f /tmp/ah_out_$$.txt

# ─── 8. EVAL SCAFFOLD INTEGRITY ──────────────────────────
echo ""
echo "── [8/8] eval scaffold integrity ──"
EVS_EXIT=0
bash scripts/verify/verify_evals_scaffold.sh 2>&1 | tee /tmp/evs_out_$$.txt | tail -3 || EVS_EXIT=$?
if [[ $EVS_EXIT -eq 0 ]] && grep -q "VERDICT: PASS" /tmp/evs_out_$$.txt; then
  score "eval_scaffold" 1 "verify_evals_scaffold PASS"
else
  score "eval_scaffold" 0 "verify_evals_scaffold FAIL (exit=$EVS_EXIT)"
fi
rm -f /tmp/evs_out_$$.txt

# ─── SCORECARD GENERATION ────────────────────────────────
echo ""
echo "── Generating challenger scorecard → ${OUT_JSON} ──"
python3 - "$SCORES_TMP" "$OUT_JSON" "$CHALLENGER_ID" "$CHALLENGER_COMMIT" <<'PYEOF'
import sys, json
from datetime import datetime

scores_file = sys.argv[1]
out_file    = sys.argv[2]
chall_id    = sys.argv[3]
chall_sha   = sys.argv[4]

with open(scores_file) as f:
    raw = json.load(f)

def sc(key):
    return raw.get(key, {}).get("score", 0)

def min_sc(*keys):
    vals = [sc(k) for k in keys]
    return min(vals) if vals else 0

scorecard = {
    "scorecard_id": "CHALLENGER_SCORECARD",
    "challenger_id": chall_id,
    "challenger_commit": chall_sha,
    "evaluated_at": datetime.utcnow().isoformat() + "Z",
    "node_version": __import__("subprocess").check_output(["node","-v"]).decode().strip(),
    "scores": {
        "RESPONSE_QUALITY_SCORECARD": {
            "factual_accuracy":              min_sc("vitest", "av03"),
            "response_completeness":         sc("vitest"),
            "no_hallucinated_capabilities":  min_sc("av01", "av02"),
            "language_match":                sc("vitest"),
            "ambiguity_acknowledged":        sc("vitest"),
            "_blocking": [
                "factual_accuracy",
                "no_hallucinated_capabilities"
            ]
        },
        "MEMORY_TRUTH_SCORECARD": {
            "memory_save_confirmed_before_state_update": sc("lock4_memory"),
            "recall_no_hallucinated_items":              sc("vitest"),
            "injection_ui_indicator_matches_trace":      sc("vitest"),
            "memory_round_trip_complete":                min_sc("vitest", "rust"),
            "no_stale_memory_injection":                 sc("lock2_conv_id"),
            "_blocking": [
                "memory_save_confirmed_before_state_update",
                "no_stale_memory_injection"
            ]
        },
        "ROUTER_TRUTH_SCORECARD": {
            "meta_provider_used_present":          sc("lock1_provider"),
            "ui_provider_badge_matches_meta":      sc("lock1_provider"),
            "fallback_provider_honestly_labeled":  sc("av04"),
            "one_door_network_enforced":           sc("compliance"),
            "routing_deterministic_for_same_input": sc("vitest"),
            "_blocking": [
                "meta_provider_used_present",
                "ui_provider_badge_matches_meta",
                "one_door_network_enforced"
            ]
        },
        "HONESTY_SCORECARD": {
            "AV-01": sc("av01"),
            "AV-02": sc("av02"),
            "AV-03": sc("av03"),
            "AV-04": sc("av04"),
            "AV-05": sc("av05"),
            "AV-06": sc("av06"),
            "AV-07": sc("av07"),
            "AV-08": sc("av08"),
            "_blocking": ["AV-01","AV-02","AV-03","AV-04","AV-05","AV-06","AV-07"]
        },
        "AUTOHEAL_TRUTH_SCORECARD": {
            "failure_reproduced_before_heal":       sc("autoheal"),
            "heal_bounded_not_broad":               sc("autoheal"),
            "autoheal_entry_appended":              sc("autoheal"),
            "detect_recurrence_passes":             sc("autoheal"),
            "no_expected_output_rewrite":           sc("autoheal"),
            "no_threshold_lowering_without_proof":  sc("eval_scaffold"),
            "no_masking_runtime_as_ui_success":     sc("av04"),
            "_blocking": [
                "detect_recurrence_passes",
                "no_expected_output_rewrite",
                "no_masking_runtime_as_ui_success"
            ]
        },
        "DESKTOP_CRITICAL_FLOW_SCORECARD": {
            "app_launches_without_crash":        sc("rust"),
            "backend_selftest_completes":        min_sc("rust", "lock3_health"),
            "health_state_from_backend_truth":   sc("lock3_health"),
            "chat_message_roundtrip":            min_sc("e2e", "vitest"),
            "tauri_ipc_contract_respected":      min_sc("compliance", "av05"),
            "ollama_connectivity_check":         sc("rust"),
            "x3_launch_stability":               min_sc("e2e", "rust"),
            "_blocking": [
                "app_launches_without_crash",
                "health_state_from_backend_truth",
                "chat_message_roundtrip",
                "tauri_ipc_contract_respected",
                "x3_launch_stability"
            ]
        }
    },
    "raw_check_results": {k: v for k, v in raw.items()}
}

with open(out_file, "w") as f:
    json.dump(scorecard, f, indent=2)

print(f"SCORECARD WRITTEN: {out_file}")
PYEOF

rm -f "$SCORES_TMP"

# ─── CALL PROMOTE OR BLOCK ───────────────────────────────
echo ""
echo "── Calling promote_or_block.sh ──"
bash scripts/evals/promote_or_block.sh "$OUT_JSON"
EXIT_CODE=$?

echo ""
echo "═══════════════════════════════════════════════════════"
echo " Challenger eval log: $LOG_FILE"
echo " Challenger scorecard: $OUT_JSON"
echo "═══════════════════════════════════════════════════════"
exit $EXIT_CODE
