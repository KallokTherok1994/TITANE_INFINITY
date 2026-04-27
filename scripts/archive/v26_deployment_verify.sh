#!/usr/bin/env bash
#
# V26 Pre-Deployment Verification Checklist
# Verifies all monitoring infrastructure is ready before Day 1
#

set -euo pipefail

REPO_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
SCRIPTS_DIR="$REPO_ROOT/scripts"
DOCS_DIR="$REPO_ROOT"

echo "================================================================================"
echo "V26 PRE-DEPLOYMENT VERIFICATION CHECKLIST"
echo "================================================================================"
echo ""

PASS=0
FAIL=0

# Check 1: Scripts exist
echo "✓ Checking monitoring scripts..."
if [ -x "$SCRIPTS_DIR/titane_production_observe.sh" ]; then
    echo "  ✅ titane_production_observe.sh (executable)"
    ((PASS++))
else
    echo "  ❌ titane_production_observe.sh (NOT executable)"
    ((FAIL++))
fi

if [ -x "$SCRIPTS_DIR/titane_production_analyze.sh" ]; then
    echo "  ✅ titane_production_analyze.sh (executable)"
    ((PASS++))
else
    echo "  ❌ titane_production_analyze.sh (NOT executable)"
    ((FAIL++))
fi

if [ -x "$SCRIPTS_DIR/titane_resilience_guard.sh" ]; then
    echo "  ✅ titane_resilience_guard.sh (executable)"
    ((PASS++))
else
    echo "  ❌ titane_resilience_guard.sh (NOT executable)"
    ((FAIL++))
fi

if [ -x "$SCRIPTS_DIR/v26_daily_check.sh" ]; then
    echo "  ✅ v26_daily_check.sh (executable)"
    ((PASS++))
else
    echo "  ❌ v26_daily_check.sh (NOT executable)"
    ((FAIL++))
fi

echo ""
echo "✓ Checking documentation..."

if [ -f "$DOCS_DIR/PRODUCTION_WEEK1_OBSERVATION.md" ]; then
    echo "  ✅ PRODUCTION_WEEK1_OBSERVATION.md"
    ((PASS++))
else
    echo "  ❌ PRODUCTION_WEEK1_OBSERVATION.md (MISSING)"
    ((FAIL++))
fi

if [ -f "$DOCS_DIR/PRODUCTION_WEEK1_DAILY_NOTES.md" ]; then
    echo "  ✅ PRODUCTION_WEEK1_DAILY_NOTES.md"
    ((PASS++))
else
    echo "  ❌ PRODUCTION_WEEK1_DAILY_NOTES.md (MISSING)"
    ((FAIL++))
fi

if [ -f "$DOCS_DIR/V25_DEPLOYMENT_QUICK_START.md" ]; then
    echo "  ✅ V25_DEPLOYMENT_QUICK_START.md"
    ((PASS++))
else
    echo "  ❌ V25_DEPLOYMENT_QUICK_START.md (MISSING)"
    ((FAIL++))
fi

if [ -f "$DOCS_DIR/V24_QUICK_WINS_FINAL_VERDICT.txt" ]; then
    echo "  ✅ V24_QUICK_WINS_FINAL_VERDICT.txt"
    ((PASS++))
else
    echo "  ❌ V24_QUICK_WINS_FINAL_VERDICT.txt (MISSING)"
    ((FAIL++))
fi

echo ""
echo "✓ Checking script content..."

# Verify CSV header in observe.sh
if grep -q "event_loop_lag_ms" "$SCRIPTS_DIR/titane_production_observe.sh"; then
    echo "  ✅ titane_production_observe.sh contains V26 metrics"
    ((PASS++))
else
    echo "  ❌ titane_production_observe.sh missing V26 metrics"
    ((FAIL++))
fi

# Verify analyze.sh has threshold logic
if grep -q "213\|239" "$SCRIPTS_DIR/titane_production_analyze.sh"; then
    echo "  ✅ titane_production_analyze.sh has thresholds defined"
    ((PASS++))
else
    echo "  ❌ titane_production_analyze.sh missing thresholds"
    ((FAIL++))
fi

# Verify resilience_guard.sh has test scenarios
if grep -q "provider\|slow.*response\|memory.*pressure" "$SCRIPTS_DIR/titane_resilience_guard.sh"; then
    echo "  ✅ titane_resilience_guard.sh has test scenarios"
    ((PASS++))
else
    echo "  ❌ titane_resilience_guard.sh missing test scenarios"
    ((FAIL++))
fi

echo ""
echo "================================================================================"
echo "VERIFICATION SUMMARY"
echo "================================================================================"
echo "  ✅ PASS: $PASS checks"
echo "  ❌ FAIL: $FAIL checks"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎯 READY FOR DAY 1 DEPLOYMENT"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy v27.1.0 binary"
    echo "  2. Start TITANE process"
    echo "  3. Run: $SCRIPTS_DIR/titane_production_observe.sh"
    echo "  4. Set cron for hourly execution"
    echo "  5. Update PRODUCTION_WEEK1_DAILY_NOTES.md daily"
    echo "  6. Run v26_daily_check.sh each morning"
    exit 0
else
    echo "⚠️  DEPLOYMENT BLOCKED - Fix $FAIL issues before proceeding"
    exit 1
fi
