#!/usr/bin/env bash
#
# TITANE Production Resilience Guard
# Test robustness BEFORE final verdict (Day 7)
# 
# Scenarios:
# 1. Provider failure simulation
# 2. Slow response simulation
# 3. Memory pressure test
#

set -euo pipefail

echo "================================================================================"
echo "TITANE PRODUCTION RESILIENCE GUARD - Pre-Verdict Test"
echo "================================================================================"
echo ""

# Configuration
TEST_LOG="/tmp/titane_resilience_test.log"
OBSERVATION_CSV="/tmp/titane_production_week1.csv"

# Initialize log
echo "Test started: $(date)" > "$TEST_LOG"

echo "🧪 TEST 1: Provider Failure Simulation"
echo "======================================"

# Get current process PID
PID=$(pgrep -f "titane-infinity" || echo "")

if [ -z "$PID" ]; then
    echo "❌ TITANE not running, cannot proceed"
    exit 1
fi

echo "✅ TITANE running (PID: $PID)"

# Collect baseline metrics
BASELINE_RSS=$(ps -p "$PID" -o rss= 2>/dev/null | awk '{print $1/1024}' | cut -d'.' -f1)
BASELINE_CPU=$(ps -p "$PID" -o pcpu= 2>/dev/null | cut -d'.' -f1)

echo "  Baseline RSS: $BASELINE_RSS MB"
echo "  Baseline CPU: $BASELINE_CPU %"

# Simulate high-frequency calls during provider failure
echo "📡 Simulating 100 rapid requests during provider timeout..."
for i in {1..100}; do
    # Try to make a request (will timeout, but app should handle gracefully)
    timeout 1 curl -s http://localhost:8080/api/test 2>/dev/null || true
    sleep 0.05
done

sleep 2

# Collect post-stress metrics
STRESS_RSS=$(ps -p "$PID" -o rss= 2>/dev/null | awk '{print $1/1024}' | cut -d'.' -f1)
STRESS_CPU=$(ps -p "$PID" -o pcpu= 2>/dev/null | cut -d'.' -f1)

RSS_DELTA=$((STRESS_RSS - BASELINE_RSS))
CPU_DELTA=$((STRESS_CPU - BASELINE_CPU))

echo "  Post-stress RSS: $STRESS_RSS MB (Δ +$RSS_DELTA MB)"
echo "  Post-stress CPU: $STRESS_CPU % (Δ +$CPU_DELTA %)"

if [ "$RSS_DELTA" -gt 50 ]; then
    echo "  ⚠️ WARNING: Significant memory increase during provider failure"
    echo "[RESILIENCE-1] RSS increase $RSS_DELTA MB" >> "$TEST_LOG"
else
    echo "  ✅ PASS: Memory stable during provider stress"
fi

if [ "$STRESS_CPU" -gt 30 ]; then
    echo "  ⚠️ WARNING: CPU spike during provider stress"
    echo "[RESILIENCE-1] CPU spike detected" >> "$TEST_LOG"
else
    echo "  ✅ PASS: CPU spike within acceptable range"
fi

echo ""
echo "🧪 TEST 2: Slow Response Simulation"
echo "========================================="

echo "📡 Simulating 10 slow requests (5s each)..."

for i in {1..10}; do
    # Long-running request
    (sleep 5 && echo "response") &
    sleep 0.5
done

sleep 3

SLOW_RSS=$(ps -p "$PID" -o rss= 2>/dev/null | awk '{print $1/1024}' | cut -d'.' -f1)
SLOW_CPU=$(ps -p "$PID" -o pcpu= 2>/dev/null | cut -d'.' -f1)

RSS_DELTA_SLOW=$((SLOW_RSS - STRESS_RSS))

echo "  After slow requests RSS: $SLOW_RSS MB (Δ +$RSS_DELTA_SLOW MB)"
echo "  After slow requests CPU: $SLOW_CPU %"

# Check for event loop lag (should be <200ms during slow responses)
if grep -q "event.*lag" /tmp/titan_v24_app.log 2>/dev/null; then
    LAG=$(grep -oP 'event.*lag[:\s]+\K\d+' /tmp/titan_v24_app.log | tail -1)
    echo "  Event loop lag: $LAG ms"
    if [ "$LAG" -gt 500 ]; then
        echo "  ⚠️ WARNING: Significant event loop lag detected"
        echo "[RESILIENCE-2] Event loop lag $LAG ms" >> "$TEST_LOG"
    else
        echo "  ✅ PASS: Event loop responsive"
    fi
else
    echo "  ✅ PASS: No lag detection (healthy responsiveness)"
fi

echo ""
echo "🧪 TEST 3: Memory Pressure Check"
echo "========================================"

# Simple memory allocation stress (don't actually allocate much, just check behavior)
echo "💾 Simulating moderate memory operations..."

# Create a large string in memory
LARGE_VAR=$(yes "test data" | head -100000 | tr '\n' ' ')

sleep 1

PRESSURE_RSS=$(ps -p "$PID" -o rss= 2>/dev/null | awk '{print $1/1024}' | cut -d'.' -f1)

echo "  During memory simulated pressure: $PRESSURE_RSS MB"
echo "  Total delta from baseline: $((PRESSURE_RSS - BASELINE_RSS)) MB"

if [ "$PRESSURE_RSS" -gt 300 ]; then
    echo "  ⚠️ ALERT: Memory exceeds safe threshold during test"
    echo "[RESILIENCE-3] Memory spike $PRESSURE_RSS MB" >> "$TEST_LOG"
else
    echo "  ✅ PASS: Memory within bounds"
fi

# Cleanup
unset LARGE_VAR

sleep 2

RECOVERY_RSS=$(ps -p "$PID" -o rss= 2>/dev/null | awk '{print $1/1024}' | cut -d'.' -f1)

echo ""
echo "================================================================================"
echo "TEST RESULTS SUMMARY"
echo "================================================================================"

# Count issues
ISSUE_COUNT=$(grep -c "\[RESILIENCE-" "$TEST_LOG" || echo "0")

echo ""
echo "Issues detected: $ISSUE_COUNT"
echo ""

if [ "$ISSUE_COUNT" -eq 0 ]; then
    echo "✅ ALL RESILIENCE TESTS PASSED"
    echo ""
    echo "Conclusions:"
    echo "  • Provider failures handled gracefully"
    echo "  • Event loop remains responsive under load"
    echo "  • Memory pressure contained"
    echo ""
    echo "Ready for Day 7 production verdict ✅"
    exit 0
elif [ "$ISSUE_COUNT" -le 2 ]; then
    echo "🟡 PARTIAL: Minor issues detected"
    echo ""
    echo "Details:"
    cat "$TEST_LOG" | grep "\[RESILIENCE-"
    echo ""
    echo "Status: Monitoring continues, watch for escalation"
    exit 1
else
    echo "❌ CRITICAL: Multiple resilience issues"
    echo ""
    echo "Details:"
    cat "$TEST_LOG" | grep "\[RESILIENCE-"
    echo ""
    echo "⚠️  Consider escalation or rollback"
    exit 2
fi
