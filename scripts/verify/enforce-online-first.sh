#!/usr/bin/env bash
#
# enforce-online-first.sh
# Enforce ONLINE-FIRST governed doctrine
#
# PASS if:
# - No "local-first only" or "offline: true" by default
# - No references to "verify:local-first" in package.json
# - Network policy documented
#
# FAIL if:
# - Old doctrine "local-first only" still present
# - verify:local-first still referenced
#

set -euo pipefail

FAIL=0
WARN=0

echo "🌐 ONLINE-FIRST GOVERNANCE CHECK"
echo "================================"
echo ""

# Check 1: No "local-first only" doctrine
echo "✓ Check 1: Doctrine 'local-first only' removed..."
if rg -i "local[-\s]?first\s+only" .github/ README.md 2>/dev/null; then
  echo "❌ FAIL: Old 'local-first only' doctrine still present"
  FAIL=$((FAIL + 1))
else
  echo "  PASS"
fi
echo ""

# Check 2: No verify:local-first in package.json
echo "✓ Check 2: Old gate 'verify:local-first' removed..."
if rg "verify:local-first" package.json 2>/dev/null; then
  echo "❌ FAIL: verify:local-first still referenced in package.json"
  FAIL=$((FAIL + 1))
else
  echo "  PASS"
fi
echo ""

# Check 3: ensure verify:online-first exists
echo "✓ Check 3: New gate 'verify:online-first' exists..."
if ! rg "verify:online-first" package.json >/dev/null 2>&1; then
  echo "⚠️  WARN: verify:online-first not found in package.json"
  WARN=$((WARN + 1))
else
  echo "  PASS"
fi
echo ""

# Check 4: Network policy documented
echo "✓ Check 4: Network policy documented..."
if ! rg -i "online[-\s]?first.*govern" .github/copilot-instructions.md >/dev/null 2>&1; then
  echo "❌ FAIL: Online-first governed policy not documented in Copilot instructions"
  FAIL=$((FAIL + 1))
else
  echo "  PASS"
fi
echo ""

# Summary
echo "================================"
echo "SUMMARY: $FAIL failures, $WARN warnings"
echo ""

if [ $FAIL -gt 0 ]; then
  echo "❌ ONLINE-FIRST CHECK FAILED"
  echo ""
  echo "Rollback: git restore -- .github/ README.md package.json scripts/"
  exit 1
fi

if [ $WARN -gt 0 ]; then
  echo "⚠️  ONLINE-FIRST CHECK PASSED with warnings"
  exit 0
fi

echo "✅ ONLINE-FIRST CHECK PASSED"
exit 0
