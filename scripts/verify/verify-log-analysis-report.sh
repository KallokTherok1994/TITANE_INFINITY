#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

assert_file() {
  local id="$1"
  local file="$2"
  if [[ -f "$file" ]]; then
    pass "$id"
  else
    fail "$id"
  fi
}

assert_contains() {
  local id="$1"
  local file="$2"
  local pattern="$3"
  if _rg -n -- "$pattern" "$file" >/dev/null 2>&1; then
    pass "$id"
  else
    fail "$id"
  fi
}

assert_file "LOG_ANALYSIS_SERVICE_PRESENT" "src/services/log_analysis/index.ts"
assert_file "LOG_ANALYSIS_DASHBOARD_PRESENT" "src/services/log_analysis/LogAnalysisDashboard.tsx"
assert_file "LOG_ANALYSIS_E2E_PRESENT" "e2e/agents/log-analysis-dashboard.e2e.ts"

assert_contains "LOG_ANALYSIS_REPORT_JSON_KEY" "src/services/log_analysis/index.ts" "titane_log_analysis_report_latest"
assert_contains "LOG_ANALYSIS_REPORT_MARKDOWN" "src/services/log_analysis/index.ts" "getLogAnalysisReportMarkdown"
assert_contains "LOG_ANALYSIS_DASHBOARD_SELECTOR" "src/services/log_analysis/LogAnalysisDashboard.tsx" "data-testid=\"log-analysis-dashboard\""
assert_contains "LOG_ANALYSIS_E2E_SELECTOR" "e2e/agents/log-analysis-dashboard.e2e.ts" "log-analysis-dashboard"
assert_contains "LOG_ANALYSIS_UI_SURFACE_MAPPED" "UI_SURFACE_MAP.md" "log-analysis-dashboard"

if [[ "$FAIL" -ne 0 ]]; then
  echo "SUMMARY: FAIL=1"
  exit 1
fi

echo "SUMMARY: FAIL=0"
