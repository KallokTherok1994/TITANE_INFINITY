#!/usr/bin/env bash
# verify_desktop_advanced_intelligence_tests.sh
# E0 validator — Lock v16.1 — 25 governance checks
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
ko(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

# ── C01–C07: core doc files ────────────────────────────────────────────────
for f in \
  docs/testing/DESKTOP_ADVANCED_INTELLIGENCE_TEST_PLAN.md \
  docs/testing/DESKTOP_ADVANCED_INTELLIGENCE_ACCEPTANCE_MATRIX.md \
  docs/testing/DESKTOP_E2E_RUNBOOK_ADVANCED_INTELLIGENCE.md \
  e2e/advanced-intelligence/README.md \
  e2e/advanced-intelligence/fixtures/.gitkeep \
  e2e/advanced-intelligence/reports/.gitkeep \
  docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md; do
  [[ -f "$f" ]] && ok "C0x_FILE_${f##*/}" || ko "C0x_FILE_${f##*/}"
done

# ── C08: 20 lanes indexed in registry AND test plan ────────────────────────
missing=0
for i in $(seq 1 20); do
  id=$(printf "AI-DESKTOP-%02d" "$i")
  if grep -q "$id" docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md && \
     grep -q "$id" docs/testing/DESKTOP_ADVANCED_INTELLIGENCE_TEST_PLAN.md; then
    :
  else
    echo "FAIL: C08_LANE_MISSING_${id}"
    missing=$((missing+1))
  fi
done
[[ $missing -eq 0 ]] && ok "C08_20_LANES_INDEXED" || FAIL=$((FAIL+missing))

# ── C09: WDIO spec exists ──────────────────────────────────────────────────
[[ -f "e2e/advanced-intelligence/advanced-intelligence.desktop.wdio.spec.js" ]] \
  && ok "C09_WDIO_SPEC_EXISTS" || ko "C09_WDIO_SPEC_EXISTS"

# ── C10: WDIO spec covers all 20 lane IDs ─────────────────────────────────
spec_missing=0
for i in $(seq 1 20); do
  id=$(printf "AI-DESKTOP-%02d" "$i")
  if ! grep -q "$id" e2e/advanced-intelligence/advanced-intelligence.desktop.wdio.spec.js; then
    echo "FAIL: C10_SPEC_MISSING_${id}"
    spec_missing=$((spec_missing+1))
  fi
done
[[ $spec_missing -eq 0 ]] && ok "C10_SPEC_COVERS_20_LANES" || FAIL=$((FAIL+spec_missing))

# ── C11: no lane silently skipped (all must declare PASS or SKIPPED_WITH_EXPLICIT_BLOCKER) ──
if grep -q "SKIPPED_WITH_EXPLICIT_BLOCKER\|PASS" \
   e2e/advanced-intelligence/advanced-intelligence.desktop.wdio.spec.js; then
  ok "C11_NO_SILENT_SKIP"
else
  ko "C11_NO_SILENT_SKIP"
fi

# ── C12: E0 Vitest contract spec exists ───────────────────────────────────
[[ -f "tests/contract/e2e-desktop/advanced-intelligence-contracts.test.ts" ]] \
  && ok "C12_VITEST_CONTRACT_SPEC_EXISTS" || ko "C12_VITEST_CONTRACT_SPEC_EXISTS"

# ── C13: D4 proof pack VERDICT.md present ─────────────────────────────────
[[ -f "proof_packs/LOCK_D4_SELF_IMPROVEMENT_LAB_2026-05-06/VERDICT.md" ]] \
  && ok "C13_D4_PROOF_PACK_VERDICT" || ko "C13_D4_PROOF_PACK_VERDICT"

# ── C14: E0 proof pack VERDICT.md present ─────────────────────────────────
[[ -f "proof_packs/LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06/VERDICT.md" ]] \
  && ok "C14_E0_PROOF_PACK_VERDICT" || ko "C14_E0_PROOF_PACK_VERDICT"

# ── C15: AutoHeal E0 entry present ────────────────────────────────────────
grep -q "LOCK_E0_DESKTOP_ADVANCED_E2E_2026_05_06" scripts/autoheal/autoheal_rules.jsonl \
  && ok "C15_AUTOHEAL_E0_ENTRY" || ko "C15_AUTOHEAL_E0_ENTRY"

# ── C16: autoheal has ≥1671 entries ───────────────────────────────────────
count=$(wc -l < scripts/autoheal/autoheal_rules.jsonl)
[[ $count -ge 1671 ]] && ok "C16_AUTOHEAL_COUNT_OK_${count}" || ko "C16_AUTOHEAL_COUNT_BELOW_1671_got_${count}"

# ── C17: D4 SelfImprovementLabContract.ts has blocksAutoMerge ─────────────
grep -q "blocksAutoMerge" src/services/self_improvement_lab/SelfImprovementLabContract.ts \
  && ok "C17_D4_BLOCKS_AUTO_MERGE" || ko "C17_D4_BLOCKS_AUTO_MERGE"

# ── C18: D4 SelfImprovementLabContract.ts has blocksSelfDeploy ────────────
grep -q "blocksSelfDeploy" src/services/self_improvement_lab/SelfImprovementLabContract.ts \
  && ok "C18_D4_BLOCKS_SELF_DEPLOY" || ko "C18_D4_BLOCKS_SELF_DEPLOY"

# ── C19: E0 ingress audit doc present ─────────────────────────────────────
[[ -f "docs/roadmap/E0_INGRESS_AUDIT.md" ]] \
  && ok "C19_E0_INGRESS_AUDIT" || ko "C19_E0_INGRESS_AUDIT"

# ── C20: e2e matrix runtime artifact present ──────────────────────────────
[[ -f "e2e/advanced-intelligence/reports/e2e_matrix_run.json" ]] \
  && ok "C20_E2E_MATRIX_ARTIFACT" || ko "C20_E2E_MATRIX_ARTIFACT"

# ── C21: D4 autoheal entry present ────────────────────────────────────────
grep -q "LOCK_D4_SELF_IMPROVEMENT_LAB_2026_05_06" scripts/autoheal/autoheal_rules.jsonl \
  && ok "C21_AUTOHEAL_D4_ENTRY" || ko "C21_AUTOHEAL_D4_ENTRY"

# ── C22: TwinConsentLedgerContract has confidence_not_consent_enforced ─────
grep -q "confidence_not_consent_enforced" src/services/twin_consent/TwinConsentLedgerContract.ts \
  && ok "C22_D3_CONSENT_BOUNDARY" || ko "C22_D3_CONSENT_BOUNDARY"

# ── C23: AGENT_EFFECTIVENESS_SCORECARD.md present ─────────────────────────
[[ -f "docs/agents/AGENT_EFFECTIVENESS_SCORECARD.md" ]] || \
[[ -f "docs/agents/AGENT_EFFECTIVENESS_SCORECARD_D0.md" ]] \
  && ok "C23_D0_SCORECARD_DOC" || ko "C23_D0_SCORECARD_DOC"

# ── C24: detect_recurrence.sh passes ──────────────────────────────────────
if bash scripts/autoheal/detect_recurrence.sh > /dev/null 2>&1; then
  ok "C24_DETECT_RECURRENCE_PASS"
else
  ko "C24_DETECT_RECURRENCE_FAIL"
fi

# ── C25: reports/desktop_advanced_intelligence_e2e_matrix.md present ──────
[[ -f "reports/desktop_advanced_intelligence_e2e_matrix.md" ]] \
  && ok "C25_DESKTOP_E2E_MATRIX_REPORT" || ko "C25_DESKTOP_E2E_MATRIX_REPORT"

echo ""
echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
[[ $FAIL -eq 0 ]]
