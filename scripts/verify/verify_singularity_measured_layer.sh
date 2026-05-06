#!/usr/bin/env bash
# scripts/verify/verify_singularity_measured_layer.sh
# Lock D2 — Singularity Measured Layer — Governance Validator
# PASS=31 expected, EXIT=0

PASS=0; FAIL=0
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
CONTRACT="$REPO/src/services/singularity_layer/SingularityMeasuredLayerContract.ts"
TESTS="$REPO/src/services/singularity_layer/__tests__/SingularityMeasuredLayerContract.test.ts"

ok() { echo "[PASS] $1"; PASS=$((PASS+1)); }
fail() { echo "[FAIL] $1"; FAIL=$((FAIL+1)); }

echo "── Contract & Test Files ──"
if [ -f "$CONTRACT" ]; then ok "SingularityMeasuredLayerContract.ts exists"; else fail "SingularityMeasuredLayerContract.ts MISSING"; fi
if [ -f "$TESTS" ]; then ok "SingularityMeasuredLayerContract.test.ts exists"; else fail "test file MISSING"; fi

echo "── v13 Sidecar Exports ──"
grep -q "D2_SELECTED_MEASUREMENT_TARGET" "$CONTRACT" && ok "D2_SELECTED_MEASUREMENT_TARGET exported" || fail "D2_SELECTED_MEASUREMENT_TARGET missing"
grep -q "D2_MEASUREMENT_DEFAULT_MODE" "$CONTRACT" && ok "D2_MEASUREMENT_DEFAULT_MODE exported" || fail "D2_MEASUREMENT_DEFAULT_MODE missing"
grep -q "D2_MEASUREMENT_KNOWN_LIMITS" "$CONTRACT" && ok "D2_MEASUREMENT_KNOWN_LIMITS exported" || fail "D2_MEASUREMENT_KNOWN_LIMITS missing"
grep -q "SINGULARITY_D2_EMISSION_ACTIVE" "$CONTRACT" && ok "SINGULARITY_D2_EMISSION_ACTIVE exported" || fail "SINGULARITY_D2_EMISSION_ACTIVE missing"
grep -q "D2MeasurementModeSchema" "$CONTRACT" && ok "D2MeasurementModeSchema exported" || fail "D2MeasurementModeSchema missing"
grep -q "D2MeasurementAdapterSchema" "$CONTRACT" && ok "D2MeasurementAdapterSchema exported" || fail "D2MeasurementAdapterSchema missing"
grep -q "getD2MeasurementAdapter" "$CONTRACT" && ok "getD2MeasurementAdapter exported" || fail "getD2MeasurementAdapter missing"
grep -q "validateSingularityMeasurement" "$CONTRACT" && ok "validateSingularityMeasurement exported" || fail "validateSingularityMeasurement missing"
grep -q "isD2EmissionActive" "$CONTRACT" && ok "isD2EmissionActive exported" || fail "isD2EmissionActive missing"
grep -q "buildPassiveMeasurementResult" "$CONTRACT" && ok "buildPassiveMeasurementResult exported" || fail "buildPassiveMeasurementResult missing"
grep -q "D2_OMEGA_TRACE_SCHEMA_CONTRACT" "$CONTRACT" && ok "D2_OMEGA_TRACE_SCHEMA_CONTRACT exported" || fail "D2_OMEGA_TRACE_SCHEMA_CONTRACT missing"

echo "── D2-UNIT Tests ──"
UNIT_COUNT=0
for i in 01 02 03 04 05 06 07 08 09 10; do
  grep -q "D2-UNIT-$i" "$TESTS" && UNIT_COUNT=$((UNIT_COUNT+1))
done
if [ "$UNIT_COUNT" -eq 10 ]; then ok "D2-UNIT-01..10 present in test file (10/10)"; else fail "D2-UNIT tests incomplete ($UNIT_COUNT/10)"; fi

echo "── Documentation ──"
if [ -f "$REPO/docs/singularity/D2_SINGULARITY_MEASURED_LAYER.md" ]; then ok "D2_SINGULARITY_MEASURED_LAYER.md exists"; else fail "D2_SINGULARITY_MEASURED_LAYER.md missing"; fi
if [ -f "$REPO/docs/singularity/D2_SELECTED_MEASUREMENT_TARGET.md" ]; then ok "D2_SELECTED_MEASUREMENT_TARGET.md exists"; else fail "D2_SELECTED_MEASUREMENT_TARGET.md missing"; fi
if [ -f "$REPO/docs/roadmap/D2_INGRESS_AUDIT.md" ]; then ok "D2_INGRESS_AUDIT.md exists"; else fail "D2_INGRESS_AUDIT.md missing"; fi

echo "── Feature Flag ──"
grep -q "VITE_TITANE_D2_SINGULARITY_EMISSION_ACTIVE" "$CONTRACT" && ok "D2 emission flag declared" || fail "D2 emission flag missing"
grep -q "VITE_TITANE_D2_SINGULARITY_MEASURED" "$CONTRACT" && ok "D2 base measurement flag declared" || fail "D2 measurement flag missing"

echo "── Registries ──"
if grep -q "REG-AI-D2" "$REPO/docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md" 2>/dev/null; then ok "REG-AI-D2 in intelligence registry"; else fail "REG-AI-D2 missing from registry"; fi
if grep -q "TREG-013" "$REPO/docs/registry/TITANE_TEST_REGISTRY.md" 2>/dev/null; then ok "TREG-013 in test registry"; else fail "TREG-013 missing"; fi
if grep -q "AI-DESKTOP-12.*SCAFFOLDED" "$REPO/docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md" 2>/dev/null; then ok "AI-DESKTOP-12 SCAFFOLDED in desktop registry"; else fail "AI-DESKTOP-12 not SCAFFOLDED"; fi

echo "── AutoHeal ──"
if grep -q "LOCK_D2_SINGULARITY_MEASURED" "$REPO/scripts/autoheal/autoheal_rules.jsonl" 2>/dev/null; then ok "D2 AutoHeal entry present"; else fail "D2 AutoHeal entry missing"; fi

echo "── Proof Pack ──"
if [ -d "$REPO/proof_packs/LOCK_D2_SINGULARITY_LAYER_2026-05-06" ]; then ok "D2 proof pack directory exists"; else fail "D2 proof pack directory missing"; fi
if [ -f "$REPO/proof_packs/LOCK_D2_SINGULARITY_LAYER_2026-05-06/VERDICT.md" ]; then ok "D2 VERDICT.md exists"; else fail "D2 VERDICT.md missing"; fi

echo ""
echo "RESULT: PASS=$PASS FAIL=$FAIL TOTAL=$((PASS+FAIL))"
if [ "$FAIL" -eq 0 ]; then
  echo "VERDICT: PASS"
  exit 0
else
  echo "VERDICT: FAIL"
  exit 1
fi

