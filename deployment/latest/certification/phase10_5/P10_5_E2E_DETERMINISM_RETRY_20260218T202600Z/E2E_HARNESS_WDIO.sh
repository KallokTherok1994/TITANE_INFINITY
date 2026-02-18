#!/bin/bash
# P10.5 E2E Test Harness (WebDriverIO)

RUN_NUM=$1
PACK_DIR=$2
WRAPPER=$3
BINARY="/usr/bin/titane-infinity"

RUN_LOG="$PACK_DIR/01_E2E_RUN_${RUN_NUM}.txt"
E2E_LOG="$PACK_DIR/01_E2E_RUN_${RUN_NUM}_WDIO.log"
WRAPPER_LOG="$PACK_DIR/01_E2E_RUN_${RUN_NUM}_WRAPPER.log"

{
  echo "=== E2E RUN $RUN_NUM (WebDriverIO) ==="
  echo "Start: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo ""
  
  # Pre-run
  echo "PRE-RUN:"
  pgrep -f "titane-infinity" | wc -l | awk '{if ($1 > 0) print "  ⚠️ Existing processes: " $1; else print "  ✅ Clean start"}'
  
  # Launch binary with wrapper
  echo ""
  echo "LAUNCHING BINARY WITH P10.4 WRAPPER:"
  START_TS=$(date +%s)
  
  "$WRAPPER" "$BINARY" 30 "$WRAPPER_LOG" 2>&1 &
  WRAPPER_PID=$!
  sleep 4  # Wait for backend ready
  
  # Run E2E suite
  echo "Running WebDriverIO E2E..."
  export TITANE_TEST=1
  node scripts/e2e/run-desktop-suite.js 2>&1 | tee "$E2E_LOG"
  E2E_EXIT=${PIPESTATUS[0]}
  
  END_TS=$(date +%s)
  DURATION=$((END_TS - START_TS))
  
  echo ""
  echo "RESULTS:"
  echo "- E2E exit: $E2E_EXIT"
  echo "- Duration: ${DURATION}s"
  echo "- Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  
  # Parse results
  PASS=$(grep -c "✓\|passed\|PASS" "$E2E_LOG" 2>/dev/null || echo "0")
  FAIL=$(grep -c "✗\|failed\|FAIL" "$E2E_LOG" 2>/dev/null || echo "0")
  echo "- Assertions: $PASS passed, $FAIL failed"
  echo "- Backend healthy: $(grep -c 'Backend\|IPC' "$WRAPPER_LOG" 2>/dev/null || echo "?") markers"
  
  echo ""
  echo "End: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  
} | tee "$RUN_LOG"

kill $WRAPPER_PID 2>/dev/null || true
exit $E2E_EXIT
