#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
ko(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

required_docs=(
  "docs/cartography/TITANE_ADVANCED_INTELLIGENCE_MAP.md"
  "docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md"
  "docs/registry/TITANE_TEST_REGISTRY.md"
  "docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md"
  "docs/registry/TITANE_AUTOHEAL_REGISTRY.md"
  "docs/registry/TITANE_PROOF_PACK_REGISTRY.md"
  "docs/registry/TITANE_SCORECARD_REGISTRY.md"
  "docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md"
)
for f in "${required_docs[@]}"; do
  if [[ -f "$f" ]]; then ok "REG_FILE_${f##*/}"; else ko "REG_FILE_${f##*/}"; fi
done

# Completed locks proof-pack entry checks (minimum required by B1.5)
if grep -q "LOCK_B1_COGNITIVE_CORE_TRUTH_MATRIX_2026-05-06" docs/registry/TITANE_PROOF_PACK_REGISTRY.md; then ok "REG_PROOFPACK_B1_INDEXED"; else ko "REG_PROOFPACK_B1_INDEXED"; fi
if grep -q "LOCK_B1_5_ADVANCED_INTELLIGENCE_CARTOGRAPHY_REGISTRY_2026-05-06" docs/registry/TITANE_PROOF_PACK_REGISTRY.md; then ok "REG_PROOFPACK_B1_5_INDEXED"; else ko "REG_PROOFPACK_B1_5_INDEXED"; fi

# Scorecards registry linkage checks
if grep -q "COGNITIVE_CORE_TRUTH_SCORECARD" docs/registry/TITANE_SCORECARD_REGISTRY.md; then ok "REG_SCORECARD_CCORE"; else ko "REG_SCORECARD_CCORE"; fi
if grep -q "RESEARCH_TRUTH_SCORECARD" docs/registry/TITANE_SCORECARD_REGISTRY.md; then ok "REG_SCORECARD_RESEARCH"; else ko "REG_SCORECARD_RESEARCH"; fi

# Desktop registry should include AI-DESKTOP-01..AI-DESKTOP-20
missing=0
for i in $(seq 1 20); do
  id=$(printf "AI-DESKTOP-%02d" "$i")
  if grep -q "$id" docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md; then :; else
    echo "FAIL: REG_DESKTOP_MISSING_$id"
    missing=$((missing+1))
  fi
done
if [[ $missing -eq 0 ]]; then ok "REG_DESKTOP_20_IDS_PRESENT"; else FAIL=$((FAIL+missing)); fi

# Feature flag registry checks
if grep -q "TITANE_D1_OMEGA_REAL_HANDLER" docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md; then ok "REG_FLAG_D1"; else ko "REG_FLAG_D1"; fi
if grep -q "TITANE_D5_INTELLIGENCE_SEAL" docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md; then ok "REG_FLAG_D5"; else ko "REG_FLAG_D5"; fi

# Program status should reference B1.5 in continuation path
if grep -q "B1.5" docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md; then ok "REG_STATUS_REFERENCES_B1_5"; else ko "REG_STATUS_REFERENCES_B1_5"; fi

echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
[[ $FAIL -eq 0 ]]
