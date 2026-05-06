#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
ko(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

for f in \
  docs/testing/DESKTOP_ADVANCED_INTELLIGENCE_TEST_PLAN.md \
  docs/testing/DESKTOP_ADVANCED_INTELLIGENCE_ACCEPTANCE_MATRIX.md \
  docs/testing/DESKTOP_E2E_RUNBOOK_ADVANCED_INTELLIGENCE.md \
  e2e/advanced-intelligence/README.md \
  e2e/advanced-intelligence/fixtures/.gitkeep \
  e2e/advanced-intelligence/reports/.gitkeep \
  docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md; do
  [[ -f "$f" ]] && ok "DESKTOP_FILE_${f##*/}" || ko "DESKTOP_FILE_${f##*/}"
done

missing=0
for i in $(seq 1 20); do
  id=$(printf "AI-DESKTOP-%02d" "$i")
  if grep -q "$id" docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md && grep -q "$id" docs/testing/DESKTOP_ADVANCED_INTELLIGENCE_TEST_PLAN.md; then
    :
  else
    echo "FAIL: DESKTOP_LANE_MISSING_$id"
    missing=$((missing+1))
  fi
done
if [[ $missing -eq 0 ]]; then ok "DESKTOP_20_LANES_INDEXED"; else FAIL=$((FAIL+missing)); fi

echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
[[ $FAIL -eq 0 ]]
