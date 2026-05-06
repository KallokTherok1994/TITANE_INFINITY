#!/usr/bin/env bash
# TITANE∞ — D1 OMEGA Real Handler Upgrade Validator
# Super Prompt v13 — All checks mandatory
# Usage: bash scripts/verify/verify_omega_real_handler.sh

set -euo pipefail

PASS=0
FAIL=0
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "ok" ]; then
    echo "  [PASS] $label"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $label — $result"
    FAIL=$((FAIL + 1))
  fi
}

echo "═══════════════════════════════════════════════════════════"
echo "  D1 OMEGA Real Handler Upgrade Validator (v13)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ── Contract file checks ─────────────────────────────────────────────────────
echo "── Contract & Test Files ──"

CONTRACT="$ROOT/src/services/omega_handler/OmegaHandlerUpgradeContract.ts"
[ -f "$CONTRACT" ] \
  && check "OmegaHandlerUpgradeContract.ts exists" "ok" \
  || check "OmegaHandlerUpgradeContract.ts exists" "FILE_MISSING"

TESTFILE="$ROOT/src/services/omega_handler/__tests__/OmegaHandlerUpgradeContract.test.ts"
[ -f "$TESTFILE" ] \
  && check "OmegaHandlerUpgradeContract.test.ts exists" "ok" \
  || check "OmegaHandlerUpgradeContract.test.ts exists" "FILE_MISSING"

# ── v13 sidecar exports ──────────────────────────────────────────────────────
echo ""
echo "── v13 Sidecar Exports ──"

grep -q "D1_SELECTED_HANDLER" "$CONTRACT" \
  && check "D1_SELECTED_HANDLER exported" "ok" \
  || check "D1_SELECTED_HANDLER exported" "MISSING_EXPORT"

grep -q "D1_MEMORY_HANDLER_DEFAULT_MODE" "$CONTRACT" \
  && check "D1_MEMORY_HANDLER_DEFAULT_MODE exported" "ok" \
  || check "D1_MEMORY_HANDLER_DEFAULT_MODE exported" "MISSING_EXPORT"

grep -q "D1_MEMORY_HANDLER_KNOWN_LIMITS" "$CONTRACT" \
  && check "D1_MEMORY_HANDLER_KNOWN_LIMITS exported" "ok" \
  || check "D1_MEMORY_HANDLER_KNOWN_LIMITS exported" "MISSING_EXPORT"

grep -q "OMEGA_D1_MEMORY_HANDLER_FLAG" "$CONTRACT" \
  && check "OMEGA_D1_MEMORY_HANDLER_FLAG exported" "ok" \
  || check "OMEGA_D1_MEMORY_HANDLER_FLAG exported" "MISSING_EXPORT"

grep -q "OmegaMemoryHandlerInputSchema" "$CONTRACT" \
  && check "OmegaMemoryHandlerInputSchema exported" "ok" \
  || check "OmegaMemoryHandlerInputSchema exported" "MISSING_EXPORT"

grep -q "OmegaMemoryHandlerOutputSchema" "$CONTRACT" \
  && check "OmegaMemoryHandlerOutputSchema exported" "ok" \
  || check "OmegaMemoryHandlerOutputSchema exported" "MISSING_EXPORT"

grep -q "D1SelectedHandlerAdapterSchema" "$CONTRACT" \
  && check "D1SelectedHandlerAdapterSchema exported" "ok" \
  || check "D1SelectedHandlerAdapterSchema exported" "MISSING_EXPORT"

grep -q "getD1SelectedHandlerAdapter" "$CONTRACT" \
  && check "getD1SelectedHandlerAdapter exported" "ok" \
  || check "getD1SelectedHandlerAdapter exported" "MISSING_EXPORT"

grep -q "validateMemoryHandlerOutput" "$CONTRACT" \
  && check "validateMemoryHandlerOutput exported" "ok" \
  || check "validateMemoryHandlerOutput exported" "MISSING_EXPORT"

grep -q "buildShadowMemoryHandlerOutput" "$CONTRACT" \
  && check "buildShadowMemoryHandlerOutput exported" "ok" \
  || check "buildShadowMemoryHandlerOutput exported" "MISSING_EXPORT"

# ── D1-UNIT tests presence ───────────────────────────────────────────────────
echo ""
echo "── D1-UNIT Tests ──"

for i in 01 02 03 04 05 06 07 08 09 10; do
  grep -q "D1-UNIT-$i" "$TESTFILE" \
    && check "D1-UNIT-$i present in test file" "ok" \
    || check "D1-UNIT-$i present in test file" "MISSING_TEST"
done

# ── Docs ─────────────────────────────────────────────────────────────────────
echo ""
echo "── Documentation ──"

[ -f "$ROOT/docs/omega/OMEGA_REAL_HANDLER_UPGRADE.md" ] \
  && check "docs/omega/OMEGA_REAL_HANDLER_UPGRADE.md exists" "ok" \
  || check "docs/omega/OMEGA_REAL_HANDLER_UPGRADE.md exists" "MISSING_DOC"

[ -f "$ROOT/docs/omega/D1_SELECTED_HANDLER.md" ] \
  && check "docs/omega/D1_SELECTED_HANDLER.md exists" "ok" \
  || check "docs/omega/D1_SELECTED_HANDLER.md exists" "MISSING_DOC"

[ -f "$ROOT/docs/roadmap/D1_INGRESS_AUDIT.md" ] \
  && check "docs/roadmap/D1_INGRESS_AUDIT.md exists" "ok" \
  || check "docs/roadmap/D1_INGRESS_AUDIT.md exists" "MISSING_DOC"

# ── Feature Flag registry ────────────────────────────────────────────────────
echo ""
echo "── Feature Flag & Registry ──"

FF_REG="$ROOT/docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md"
grep -q "FF-D1\|D1_OMEGA_REAL_HANDLER\|TITANE_D1" "$FF_REG" \
  && check "FF-D1 present in TITANE_RUNTIME_FEATURE_FLAGS" "ok" \
  || check "FF-D1 present in TITANE_RUNTIME_FEATURE_FLAGS" "MISSING_ENTRY"

AI_REG="$ROOT/docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md"
grep -q "REG-AI-D1\|D1.*Memory.*handler\|D1.*OMEGA" "$AI_REG" \
  && check "D1 entry in TITANE_ADVANCED_INTELLIGENCE_REGISTRY" "ok" \
  || check "D1 entry in TITANE_ADVANCED_INTELLIGENCE_REGISTRY" "MISSING_ENTRY"

DESKTOP_REG="$ROOT/docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md"
grep -q "AI-DESKTOP-11.*SCAFFOLDED\|SCAFFOLDED.*AI-DESKTOP-11" "$DESKTOP_REG" \
  && check "AI-DESKTOP-11 SCAFFOLDED in desktop registry" "ok" \
  || check "AI-DESKTOP-11 SCAFFOLDED in desktop registry" "MISSING_OR_WRONG_STATUS"

# ── AutoHeal ─────────────────────────────────────────────────────────────────
echo ""
echo "── AutoHeal ──"

AUTOHEAL="$ROOT/scripts/autoheal/autoheal_rules.jsonl"
grep -q "LOCK_D1_OMEGA_REAL_HANDLER\|LOCK_D1_2026" "$AUTOHEAL" \
  && check "D1 AutoHeal entry present" "ok" \
  || check "D1 AutoHeal entry present" "MISSING_ENTRY"

# ── Proof pack ───────────────────────────────────────────────────────────────
echo ""
echo "── Proof Pack ──"

PP_DIR="$ROOT/proof_packs/LOCK_D1_OMEGA_HANDLER_2026-05-06"
[ -d "$PP_DIR" ] \
  && check "D1 proof pack directory exists" "ok" \
  || check "D1 proof pack directory exists" "DIR_MISSING"

[ -f "$PP_DIR/VERDICT.md" ] \
  && check "D1 proof pack VERDICT.md exists" "ok" \
  || check "D1 proof pack VERDICT.md exists" "FILE_MISSING"

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
TOTAL=$((PASS + FAIL))
echo "  RESULT: PASS=$PASS FAIL=$FAIL TOTAL=$TOTAL"
if [ "$FAIL" -eq 0 ]; then
  echo "  VERDICT: PASS"
  exit 0
else
  echo "  VERDICT: FAIL"
  exit 1
fi
