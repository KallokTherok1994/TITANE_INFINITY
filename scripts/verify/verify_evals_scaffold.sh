#!/usr/bin/env bash
# verify_evals_scaffold.sh
# Gate: G_EVAL_DATASET_VERSIONED + G_SCORECARDS_PRESENT
# Verifies the evals/ anti-regression scaffold is present and structurally valid.
# Does NOT require Node.js. Purely file-system checks.
#
# Usage: bash scripts/verify/verify_evals_scaffold.sh
# Exit code: 0 = PASS, 1 = FAIL
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0

ok()  { echo "PASS: $1"; PASS=$((PASS+1)); }
ko()  { echo "FAIL: $1"; FAIL=$((FAIL+1)); }
warn(){ echo "WARN: $1"; }

echo "=== TITANE∞ — verify_evals_scaffold ==="
echo "Root: $ROOT"
echo ""

# ── G_EVAL_DIRECTORY ──────────────────────────────────────────────
echo "--- G_EVAL_DIRECTORY ---"
[[ -d "evals" ]]                     && ok "evals/ directory exists"         || ko "evals/ directory MISSING"
[[ -f "evals/README.md" ]]           && ok "evals/README.md present"         || ko "evals/README.md MISSING"

# ── G_EVAL_DATASET_VERSIONED ──────────────────────────────────────
echo ""
echo "--- G_EVAL_DATASET_VERSIONED ---"
[[ -d "evals/datasets/v1" ]]         && ok "evals/datasets/v1/ present"      || ko "evals/datasets/v1/ MISSING"
[[ -f "evals/datasets/v1/DATASET_INDEX.md" ]]     && ok "DATASET_INDEX.md present"      || ko "DATASET_INDEX.md MISSING"
[[ -f "evals/datasets/v1/lane_a_golden_tasks.jsonl" ]]  && ok "lane_a_golden_tasks.jsonl present"   || ko "lane_a MISSING"
[[ -f "evals/datasets/v1/lane_b_critical_chains.jsonl" ]] && ok "lane_b_critical_chains.jsonl present" || ko "lane_b MISSING"
[[ -f "evals/datasets/v1/lane_c_regression.jsonl" ]]     && ok "lane_c_regression.jsonl present"    || ko "lane_c MISSING"
[[ -f "evals/datasets/v1/lane_d_honesty.jsonl" ]]        && ok "lane_d_honesty.jsonl present"       || ko "lane_d MISSING"
[[ -f "evals/datasets/v1/lane_e_stability.jsonl" ]]      && ok "lane_e_stability.jsonl present"     || ko "lane_e MISSING"
[[ -f "evals/datasets/v1/lane_f_shadow.jsonl" ]]         && ok "lane_f_shadow.jsonl present"        || ko "lane_f MISSING"

# Verify datasets are valid JSONL (each line is parseable JSON, if python3 or jq available)
if command -v python3 >/dev/null 2>&1; then
  for f in evals/datasets/v1/lane_*.jsonl; do
    if python3 -c "
import sys, json
lines = open('$f').readlines()
for i, line in enumerate(lines):
    line = line.strip()
    if line:
        try: json.loads(line)
        except: sys.exit(1)
" 2>/dev/null; then
      ok "JSONL valid: $(basename $f)"
    else
      ko "JSONL invalid: $(basename $f)"
    fi
  done
else
  warn "python3 not found — JSONL validation skipped"
fi

# ── G_SCORECARDS_PRESENT ──────────────────────────────────────────
echo ""
echo "--- G_SCORECARDS_PRESENT ---"
[[ -d "evals/scorecards/v1" ]] && ok "evals/scorecards/v1/ present" || ko "evals/scorecards/v1/ MISSING"

REQUIRED_SCORECARDS=(
  "RESPONSE_QUALITY_SCORECARD.json"
  "MEMORY_TRUTH_SCORECARD.json"
  "ROUTER_TRUTH_SCORECARD.json"
  "HONESTY_SCORECARD.json"
  "AUTOHEAL_TRUTH_SCORECARD.json"
  "DESKTOP_CRITICAL_FLOW_SCORECARD.json"
)
for sc in "${REQUIRED_SCORECARDS[@]}"; do
  [[ -f "evals/scorecards/v1/$sc" ]] && ok "scorecard present: $sc" || ko "scorecard MISSING: $sc"
done

# Verify scorecards are valid JSON
if command -v python3 >/dev/null 2>&1; then
  for sc in "${REQUIRED_SCORECARDS[@]}"; do
    f="evals/scorecards/v1/$sc"
    if [[ -f "$f" ]]; then
      if python3 -c "import json; json.load(open('$f'))" 2>/dev/null; then
        ok "JSON valid: $sc"
      else
        ko "JSON invalid: $sc"
      fi
    fi
  done
else
  warn "python3 not found — JSON validation skipped"
fi

# ── G_RUBRICS_PRESENT ─────────────────────────────────────────────
echo ""
echo "--- G_RUBRICS_PRESENT ---"
[[ -d "evals/rubrics/v1" ]]                                      && ok "evals/rubrics/v1/ present"              || ko "evals/rubrics/v1/ MISSING"
[[ -f "evals/rubrics/v1/response_quality_rubric.md" ]]           && ok "response_quality_rubric.md present"     || ko "response_quality_rubric.md MISSING"
[[ -f "evals/rubrics/v1/honesty_rubric.md" ]]                    && ok "honesty_rubric.md present"              || ko "honesty_rubric.md MISSING"

# ── G_BASELINES_PRESENT ───────────────────────────────────────────
echo ""
echo "--- G_BASELINES_PRESENT ---"
[[ -d "evals/baselines/v1" ]]                                    && ok "evals/baselines/v1/ present"            || ko "evals/baselines/v1/ MISSING"
[[ -f "evals/baselines/v1/champion_baseline.json" ]]             && ok "champion_baseline.json present"         || ko "champion_baseline.json MISSING"
if command -v python3 >/dev/null 2>&1 && [[ -f "evals/baselines/v1/champion_baseline.json" ]]; then
  python3 -c "import json; json.load(open('evals/baselines/v1/champion_baseline.json'))" 2>/dev/null \
    && ok "champion_baseline.json is valid JSON" || ko "champion_baseline.json invalid JSON"
fi

# ── G_REPORTS_DIR ─────────────────────────────────────────────────
echo ""
echo "--- G_REPORTS_DIR ---"
[[ -d "evals/reports" ]] && ok "evals/reports/ present" || ko "evals/reports/ MISSING"

# ── SUMMARY ───────────────────────────────────────────────────────
echo ""
echo "=============================="
echo "PASS: $PASS"
echo "FAIL: $FAIL"
echo "=============================="

if [[ "$FAIL" -eq 0 ]]; then
  echo "VERDICT: PASS — evals scaffold valid"
  exit 0
else
  echo "VERDICT: FAIL — $FAIL check(s) failed"
  exit 1
fi
