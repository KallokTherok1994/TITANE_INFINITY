#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

check_contains() {
  local file="$1"
  local pattern="$2"
  if _rg -n -- "$pattern" "$file" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

check_not_contains() {
  local file="$1"
  local pattern="$2"
  if _rg -n -- "$pattern" "$file" >/dev/null 2>&1; then
    return 1
  fi
  return 0
}

assert_file() {
  local id="$1"
  local file="$2"
  if [[ -f "$file" ]]; then
    pass "$id"
  else
    fail "$id"
  fi
}

assert_ui_event_reference() {
  local agent="$1"
  local selector="$2"
  local dashboard_file="$3"
  if _rg -n -- "$selector|$dashboard_file" registry/ui-events.jsonl >/dev/null 2>&1; then
    pass "AGENT_UI_EVENT_PRESENT $agent"
  else
    fail "AGENT_UI_EVENT_MISSING $agent selector=$selector"
  fi
}

assert_e2e_not_minimal() {
  local agent="$1"
  local e2e_file="$2"
  local expect_count
  expect_count=$(grep -o "expect(" "$e2e_file" | wc -l | tr -d ' ')
  if [[ "$expect_count" -ge 2 ]]; then
    pass "AGENT_E2E_NON_MINIMAL $agent"
  else
    fail "AGENT_E2E_MINIMAL_ONLY $agent"
  fi
}

assert_dashboard_selector() {
  local agent="$1"
  local dashboard_file="$2"
  local selector="$3"
  if check_contains "$dashboard_file" "data-testid=\"$selector\"|data-testid='$selector'"; then
    pass "AGENT_SELECTOR_ALIGNED $agent"
  else
    fail "AGENT_SELECTOR_MISMATCH $agent expected=$selector file=$dashboard_file"
  fi
}

assert_service_not_stub() {
  local agent="$1"
  local service_file="$2"
  if check_not_contains "$service_file" "prevue sur cette surface|prévue sur cette surface|Implémentation de l'agent|Implémentation de l'orchestrateur|Implémentation de l'agent explainability|Implémentation de l'agent de sécurité active"; then
    pass "AGENT_SERVICE_NOT_STUB $agent"
  else
    fail "AGENT_SERVICE_STUB $agent"
  fi
}

assert_dashboard_not_stub() {
  local agent="$1"
  local dashboard_file="$2"
  if check_not_contains "$dashboard_file" "\(stub\)|Surface reservee|Surface réservée|prevue sur cette surface|prévue sur cette surface"; then
    pass "AGENT_DASHBOARD_NOT_STUB $agent"
  else
    fail "AGENT_DASHBOARD_STUB $agent"
  fi
}

assert_e2e_selector() {
  local agent="$1"
  local e2e_file="$2"
  local selector="$3"
  if check_contains "$e2e_file" "$selector"; then
    pass "AGENT_E2E_SELECTOR_PRESENT $agent"
  else
    fail "AGENT_E2E_SELECTOR_MISSING $agent selector=$selector"
  fi
}

assert_mapping_selector() {
  local agent="$1"
  local selector="$2"
  if _rg -n -- "$selector" UI_SURFACE_MAP.md >/dev/null 2>&1; then
    pass "AGENT_UI_SURFACE_MAPPED $agent"
  else
    fail "AGENT_UI_SURFACE_UNMAPPED $agent selector=$selector"
  fi
}

assert_panel_import() {
  local agent="$1"
  local dashboard_file="$2"
  local import_token
  import_token=$(basename "$dashboard_file" .tsx)
  if _rg -n -- "$import_token" src/components/AgentDashboardsPanel.tsx >/dev/null 2>&1; then
    pass "AGENT_PANEL_IMPORT_PRESENT $agent"
  else
    fail "AGENT_PANEL_IMPORT_MISSING $agent"
  fi
}

declare -a AGENTS=(
  "monitoring|src/services/monitoring/index.ts|src/services/monitoring/MonitoringDashboard.tsx|e2e/agents/monitoring-dashboard.e2e.ts|monitoring-dashboard"
  "diagnostic|src/services/diagnostic/index.ts|src/services/diagnostic/DiagnosticDashboard.tsx|e2e/agents/diagnostic-panel.e2e.ts|diagnostic-panel"
  "explainability|src/services/explainability/index.ts|src/services/explainability/ExplainabilityDashboard.tsx|e2e/agents/explainability-dashboard.e2e.ts|explainability-dashboard"
  "orchestrator|src/services/orchestrator/index.ts|src/services/orchestrator/OrchestratorDashboard.tsx|e2e/agents/orchestrator-dashboard.e2e.ts|orchestrator-dashboard"
  "security_active|src/services/security_active/index.ts|src/services/security_active/SecurityDashboard.tsx|e2e/agents/security-dashboard.e2e.ts|security-dashboard"
)

assert_file "AGENT_PANEL_EXISTS" "src/components/AgentDashboardsPanel.tsx"

for row in "${AGENTS[@]}"; do
  IFS='|' read -r agent service_file dashboard_file e2e_file selector <<< "$row"
  assert_file "AGENT_SERVICE_FILE_PRESENT $agent" "$service_file"
  assert_file "AGENT_DASHBOARD_FILE_PRESENT $agent" "$dashboard_file"
  assert_file "AGENT_E2E_FILE_PRESENT $agent" "$e2e_file"
  assert_mapping_selector "$agent" "$selector"
  assert_dashboard_selector "$agent" "$dashboard_file" "$selector"
  assert_e2e_selector "$agent" "$e2e_file" "$selector"
  assert_service_not_stub "$agent" "$service_file"
  assert_dashboard_not_stub "$agent" "$dashboard_file"
  assert_e2e_not_minimal "$agent" "$e2e_file"
  assert_ui_event_reference "$agent" "$selector" "$dashboard_file"
  assert_panel_import "$agent" "$dashboard_file"
done

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi