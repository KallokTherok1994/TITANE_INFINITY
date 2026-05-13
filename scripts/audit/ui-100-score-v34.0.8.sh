#!/usr/bin/env bash
# UI 100/100 audit runner v2 — UI 100/100 plan v34.0.8 (Phase S)
#
# Runs all 9 UI gates introduced by v34.0.7 (phases A-D) + v34.0.8 phases
# (L/M/N/O/P/Q/R), aggregates pass/fail counts into a single weighted score
# (100 max), and writes a Markdown report.
#
# Score model v34.0.8 (100 points total):
#   Phase A  (50 surfaces E2E capture)           12 pts
#   Phase B  (a11y WCAG 2.1 AA, 10 routes)       12 pts
#   Phase C  (responsive 7x3 = 21)               12 pts
#   Phase D  (agent dashboards, 6 canonical)     12 pts
#   Phase N  (keyboard navigation, 7 routes)     10 pts
#   Phase O  (theme dark/light, 5x2)             10 pts
#   Phase P  (i18n fr/en, 5x2)                   10 pts
#   Phase Q  (web vitals, 4 routes)              10 pts
#   Phase LMR (live hook + memo + 3 agent svc)   12 pts (Vitest)
#
# Exit code: 0 if total >= 100, 1 otherwise.

set -uo pipefail

cd "$(dirname "$0")/../.."
REPORT="reports/UI_100_SCORE_v34.0.8.md"

mkdir -p reports

declare -A GATE_NAME=(
  [A]="Phase A - UI prod capture (50 surfaces)"
  [B]="Phase B - a11y WCAG 2.1 AA (10 routes)"
  [C]="Phase C - responsive matrix (7x3)"
  [D]="Phase D - agent dashboards (6 canonical)"
  [N]="Phase N - keyboard navigation (7 routes)"
  [O]="Phase O - theme dark/light (5x2)"
  [P]="Phase P - i18n fr/en (5x2)"
  [Q]="Phase Q - web vitals (4 routes)"
  [LMR]="Phase L+M+R - live hook + memo + agent services"
)
declare -A GATE_SPEC=(
  [A]="e2e/critical/ui-prod-capture-v34_0_7.spec.ts"
  [B]="e2e/a11y/wcag-aa-core.spec.ts"
  [C]="e2e/responsive/viewport-matrix.spec.ts"
  [D]="e2e/critical/advanced-agent-dashboards.spec.ts"
  [N]="e2e/a11y/keyboard-navigation.spec.ts"
  [O]="e2e/a11y/theme-switching.spec.ts"
  [P]="e2e/a11y/i18n-coverage.spec.ts"
  [Q]="e2e/performance/web-vitals.spec.ts"
)
declare -A GATE_POINTS=(
  [A]=12 [B]=12 [C]=12 [D]=12
  [N]=10 [O]=10 [P]=10 [Q]=10
  [LMR]=12
)
declare -A GATE_RESULT
declare -A GATE_OUTPUT

TOTAL=0
PHASES_PASSED=0

# Playwright phases
for phase in A B C D N O P Q; do
  echo "::group::Running gate $phase - ${GATE_NAME[$phase]}"
  if out=$(pnpm exec playwright test "${GATE_SPEC[$phase]}" --reporter=line 2>&1); then
    GATE_RESULT[$phase]="PASS"
    TOTAL=$((TOTAL + GATE_POINTS[$phase]))
    PHASES_PASSED=$((PHASES_PASSED + 1))
  else
    GATE_RESULT[$phase]="FAIL"
  fi
  GATE_OUTPUT[$phase]=$(echo "$out" | tail -3 | tr '\n' ' ' | sed 's/|/\\|/g' | head -c 200)
  echo "  -> ${GATE_RESULT[$phase]}"
  echo "::endgroup::"
done

# Vitest phase L+M+R: hook + 3 agent service suites
echo "::group::Running gate LMR (Vitest hook + 3 agent services)"
if vout=$(pnpm vitest run src/__tests__/hooks/useAgentLiveSnapshot.test.tsx src/services/orchestrator/__tests__/ src/services/explainability/__tests__/ src/services/security_active/__tests__/ 2>&1); then
  GATE_RESULT[LMR]="PASS"
  TOTAL=$((TOTAL + GATE_POINTS[LMR]))
  PHASES_PASSED=$((PHASES_PASSED + 1))
else
  GATE_RESULT[LMR]="FAIL"
fi
GATE_OUTPUT[LMR]=$(echo "$vout" | tail -3 | tr '\n' ' ' | sed 's/|/\\|/g' | head -c 200)
echo "  -> ${GATE_RESULT[LMR]}"
echo "::endgroup::"

VERDICT="FAIL"
if [[ $TOTAL -ge 100 ]]; then
  VERDICT="PASS"
fi

{
  echo "# UI 100/100 Audit Score - v34.0.8"
  echo
  echo "**Date** : $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "**Verdict** : $VERDICT ($TOTAL / 100)"
  echo "**Phases passed** : $PHASES_PASSED / 9"
  echo
  echo "## Per-phase results"
  echo
  echo "| Phase | Description | Points | Result |"
  echo "| :---: | :--- | :---: | :---: |"
  for phase in A B C D N O P Q LMR; do
    echo "| $phase | ${GATE_NAME[$phase]} | ${GATE_POINTS[$phase]} | ${GATE_RESULT[$phase]} |"
  done
  echo
  echo "## Score breakdown"
  echo
  for phase in A B C D N O P Q LMR; do
    echo "- ${GATE_NAME[$phase]}: ${GATE_POINTS[$phase]} pts (${GATE_RESULT[$phase]})"
  done
  echo "- **Total** : $TOTAL / 100"
  echo
  echo "## Specs canoniques"
  echo
  for phase in A B C D N O P Q; do
    echo "- \`${GATE_SPEC[$phase]}\`"
  done
  echo "- \`src/__tests__/hooks/useAgentLiveSnapshot.test.tsx\`"
  echo "- \`src/services/{orchestrator,explainability,security_active}/__tests__/\`"
  echo
  echo "## Proof packs"
  echo
  echo "- \`proof_packs/v34.0.7-ui-prod-capture/\` (50 screenshots)"
  echo "- \`proof_packs/v34.0.7-a11y/\` (10 route reports + aggregate)"
  echo "- \`proof_packs/v34.0.7-responsive/\` (21 screenshots)"
  echo "- \`proof_packs/v34.0.7-agent-dashboards/\` (panel + log-analysis)"
  echo "- \`proof_packs/v34.0.8-keyboard/\` (7 focus traces)"
  echo "- \`proof_packs/v34.0.8-theme/\` (10 screenshots + axe reports)"
  echo "- \`proof_packs/v34.0.8-i18n/\` (10 fr/en proofs)"
  echo "- \`proof_packs/v34.0.8-perf/\` (4 web vitals JSON)"
} > "$REPORT"

echo
echo "================================================================"
echo "UI 100/100 v34.0.8 SCORE: $TOTAL / 100  ($VERDICT)"
echo "Report: $REPORT"
echo "================================================================"

if [[ "$VERDICT" == "PASS" ]]; then
  exit 0
fi
exit 1
