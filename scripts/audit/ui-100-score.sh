#!/usr/bin/env bash
# UI 100/100 audit runner — UI 100/100 plan phase E
#
# Runs all 4 UI gates introduced by phases A-D, aggregates pass/fail
# counts into a single score, and writes a Markdown report.
#
# Score model (100 points total, phases A+B+C+D = 92, phase E +8):
#   - Phase A: 50 surfaces E2E (capture)        20 pts
#   - Phase B: 10 routes a11y WCAG 2.1 AA       18 pts
#   - Phase C: 21 responsive viewport tests     16 pts
#   - Phase D: 6 agent dashboards canonical     18 pts
#   - Phase E: aggregate audit + report         28 pts
#
# Exit code: 0 if all gates PASS, 1 otherwise.

set -uo pipefail

cd "$(dirname "$0")/../.."
ROOT="$PWD"
REPORT="reports/UI_100_SCORE_v34.0.7.md"

mkdir -p reports

declare -A GATE_NAME=(
  [A]="phase A — UI prod capture (50 surfaces)"
  [B]="phase B — a11y WCAG 2.1 AA (10 routes)"
  [C]="phase C — responsive matrix (7x3=21)"
  [D]="phase D — agent dashboards (6 canonical)"
)
declare -A GATE_SPEC=(
  [A]="e2e/critical/ui-prod-capture-v34_0_7.spec.ts"
  [B]="e2e/a11y/wcag-aa-core.spec.ts"
  [C]="e2e/responsive/viewport-matrix.spec.ts"
  [D]="e2e/critical/advanced-agent-dashboards.spec.ts"
)
declare -A GATE_POINTS=(
  [A]=20
  [B]=18
  [C]=16
  [D]=18
)
declare -A GATE_RESULT
declare -A GATE_OUTPUT

TOTAL=0
PHASES_PASSED=0

for phase in A B C D; do
  echo "::group::Running gate $phase — ${GATE_NAME[$phase]}"
  if out=$(pnpm playwright test "${GATE_SPEC[$phase]}" --project=chromium --reporter=line 2>&1); then
    GATE_RESULT[$phase]="PASS"
    TOTAL=$((TOTAL + GATE_POINTS[$phase]))
    PHASES_PASSED=$((PHASES_PASSED + 1))
  else
    GATE_RESULT[$phase]="FAIL"
  fi
  GATE_OUTPUT[$phase]=$(echo "$out" | tail -3)
  echo "  -> ${GATE_RESULT[$phase]}"
  echo "::endgroup::"
done

# Phase E points granted when phases A-D all PASS + report generated.
PHASE_E_POINTS=0
if [[ $PHASES_PASSED -eq 4 ]]; then
  PHASE_E_POINTS=28
  TOTAL=$((TOTAL + PHASE_E_POINTS))
fi

VERDICT="FAIL"
if [[ $TOTAL -ge 100 ]]; then
  VERDICT="PASS"
fi

{
  echo "# UI 100/100 Audit Score — v34.0.7"
  echo
  echo "**Date** : $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "**Verdict** : $VERDICT ($TOTAL / 100)"
  echo "**Phases passed** : $PHASES_PASSED / 4"
  echo
  echo "## Per-phase results"
  echo
  echo "| Phase | Description | Points | Result | Output (tail) |"
  echo "| :---: | :--- | :---: | :---: | :--- |"
  for phase in A B C D; do
    out_inline=$(echo "${GATE_OUTPUT[$phase]}" | tr '\n' ' ' | sed 's/|/\\|/g' | head -c 200)
    echo "| $phase | ${GATE_NAME[$phase]} | ${GATE_POINTS[$phase]} | ${GATE_RESULT[$phase]} | $out_inline |"
  done
  echo "| E | phase E — aggregate audit | 28 | $([[ $PHASE_E_POINTS -eq 28 ]] && echo PASS || echo FAIL) | granted when A-D all PASS |"
  echo
  echo "## Score breakdown"
  echo
  echo "- Phase A (50 surfaces E2E):        ${GATE_POINTS[A]} pts (${GATE_RESULT[A]})"
  echo "- Phase B (a11y WCAG 2.1 AA):       ${GATE_POINTS[B]} pts (${GATE_RESULT[B]})"
  echo "- Phase C (responsive 7x3):         ${GATE_POINTS[C]} pts (${GATE_RESULT[C]})"
  echo "- Phase D (agent dashboards x6):    ${GATE_POINTS[D]} pts (${GATE_RESULT[D]})"
  echo "- Phase E (aggregate audit):        $PHASE_E_POINTS pts"
  echo "- **Total** : $TOTAL / 100"
  echo
  echo "## Specs canoniques"
  echo
  for phase in A B C D; do
    echo "- [\`${GATE_SPEC[$phase]}\`](${GATE_SPEC[$phase]})"
  done
  echo
  echo "## Proof packs"
  echo
  echo "- \`proof_packs/v34.0.7-ui-prod-capture/\` (50 screenshots)"
  echo "- \`proof_packs/v34.0.7-a11y/\` (10 route reports + aggregate)"
  echo "- \`proof_packs/v34.0.7-responsive/\` (21 screenshots)"
  echo "- \`proof_packs/v34.0.7-agent-dashboards/\` (panel + log-analysis)"
} > "$REPORT"

echo
echo "================================================================"
echo "UI 100/100 SCORE: $TOTAL / 100  ($VERDICT)"
echo "Report: $REPORT"
echo "================================================================"

if [[ "$VERDICT" == "PASS" ]]; then
  exit 0
else
  exit 1
fi
