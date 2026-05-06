#!/usr/bin/env bash
# verify_agent_effectiveness_scorecard.sh
# Lock D0 — Agent Effectiveness System validator
# Checks: contract, scorecard, policy, tests, registry entries, desktop lane
set -euo pipefail

PASS=0
FAIL=0
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

check() {
  local label="$1"
  local condition="$2"
  if eval "$condition" &>/dev/null; then
    echo "  PASS: $label"
    PASS=$((PASS+1))
  else
    echo "  FAIL: $label"
    FAIL=$((FAIL+1))
  fi
}

echo "=== verify_agent_effectiveness_scorecard.sh ==="
echo "REPO_ROOT: $REPO_ROOT"
echo ""

echo "-- Contract surface --"
check "AgentEffectivenessContract.ts exists" \
  "[ -f '$REPO_ROOT/src/services/agent_effectiveness/AgentEffectivenessContract.ts' ]"

check "AgentEffectivenessScorecardSchema exported" \
  "grep -q 'AgentEffectivenessScorecardSchema' '$REPO_ROOT/src/services/agent_effectiveness/AgentEffectivenessContract.ts'"

check "isAgentMeasurable exported" \
  "grep -q 'isAgentMeasurable' '$REPO_ROOT/src/services/agent_effectiveness/AgentEffectivenessContract.ts'"

check "canClaimPass exported" \
  "grep -q 'canClaimPass' '$REPO_ROOT/src/services/agent_effectiveness/AgentEffectivenessContract.ts'"

check "detectAgentScopeDrift exported" \
  "grep -q 'detectAgentScopeDrift' '$REPO_ROOT/src/services/agent_effectiveness/AgentEffectivenessContract.ts'"

check "buildAgentEffectivenessSummary exported" \
  "grep -q 'buildAgentEffectivenessSummary' '$REPO_ROOT/src/services/agent_effectiveness/AgentEffectivenessContract.ts'"

check "RUNTIME_AUTHORITY_MINIMUM_RISK exported" \
  "grep -q 'RUNTIME_AUTHORITY_MINIMUM_RISK' '$REPO_ROOT/src/services/agent_effectiveness/AgentEffectivenessContract.ts'"

echo ""
echo "-- Test surface --"
check "AgentEffectivenessContract.test.ts exists" \
  "[ -f '$REPO_ROOT/src/services/agent_effectiveness/__tests__/AgentEffectivenessContract.test.ts' ]"

check "D0-UNIT-01 present in tests" \
  "grep -q 'D0-UNIT-01' '$REPO_ROOT/src/services/agent_effectiveness/__tests__/AgentEffectivenessContract.test.ts'"

check "D0-UNIT-05 (known_limitations) present in tests" \
  "grep -q 'D0-UNIT-05' '$REPO_ROOT/src/services/agent_effectiveness/__tests__/AgentEffectivenessContract.test.ts'"

check "D0-UNIT-07 (scope drift) present in tests" \
  "grep -q 'D0-UNIT-07' '$REPO_ROOT/src/services/agent_effectiveness/__tests__/AgentEffectivenessContract.test.ts'"

check "D0-UNIT-10 (registry UNKNOWN) present in tests" \
  "grep -q 'D0-UNIT-10' '$REPO_ROOT/src/services/agent_effectiveness/__tests__/AgentEffectivenessContract.test.ts'"

echo ""
echo "-- Docs surface --"
check "docs/agents/AGENT_EFFECTIVENESS_SCORECARD.md exists" \
  "[ -f '$REPO_ROOT/docs/agents/AGENT_EFFECTIVENESS_SCORECARD.md' ]"

check "docs/agents/AGENT_EFFECTIVENESS_POLICY.md exists" \
  "[ -f '$REPO_ROOT/docs/agents/AGENT_EFFECTIVENESS_POLICY.md' ]"

check "scorecard lists architect-guardian" \
  "grep -q 'architect-guardian' '$REPO_ROOT/docs/agents/AGENT_EFFECTIVENESS_SCORECARD.md'"

check "scorecard lists titane-conductor" \
  "grep -q 'titane-conductor' '$REPO_ROOT/docs/agents/AGENT_EFFECTIVENESS_SCORECARD.md'"

echo ""
echo "-- Registry surface --"
check "AI-DESKTOP-14 in TITANE_DESKTOP_E2E_REGISTRY.md" \
  "grep -q 'AI-DESKTOP-14' '$REPO_ROOT/docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md'"

check "FF-D0 or D0 T1/T2 note in TITANE_RUNTIME_FEATURE_FLAGS.md" \
  "grep -qE 'D0|FF-D0|agent.effectiveness' '$REPO_ROOT/docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md'"

check "TREG-011 in TITANE_TEST_REGISTRY.md" \
  "grep -q 'TREG-011' '$REPO_ROOT/docs/registry/TITANE_TEST_REGISTRY.md'"

check "REG-AI-D0 in TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md" \
  "grep -q 'REG-AI-D0' '$REPO_ROOT/docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md'"

echo ""
echo "-- Proof surface --"
check "proof_packs/LOCK_D0_AGENT_EFFECTIVENESS_2026-05-06/ exists" \
  "[ -d '$REPO_ROOT/proof_packs/LOCK_D0_AGENT_EFFECTIVENESS_2026-05-06' ]"

echo ""
echo "=== RESULT ==="
echo "PASS=$PASS FAIL=$FAIL"
if [ "$FAIL" -eq 0 ]; then
  echo "VERDICT: PASS"
  exit 0
else
  echo "VERDICT: FAIL"
  exit 1
fi
