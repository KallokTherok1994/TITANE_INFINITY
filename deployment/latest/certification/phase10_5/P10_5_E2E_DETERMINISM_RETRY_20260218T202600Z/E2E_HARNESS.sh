#!/bin/bash
# P10.5 E2E Test Harness

RUN_NUM=$1
PACK_DIR=$2
WRAPPER=$3
BINARY="/usr/bin/titane-infinity"
TIMEOUT=180

RUN_LOG="$PACK_DIR/01_E2E_RUN_${RUN_NUM}.txt"
E2E_LOG="$PACK_DIR/01_E2E_RUN_${RUN_NUM}_PLAYWRIGHT.log"

{
  echo "=== E2E RUN $RUN_NUM ==="
  echo "Start: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo ""
  
  # Pre-run sanity
  echo "PRE-RUN:"
  pgrep -f "titane-infinity" | wc -l | awk '{print "  Existing processes: " $1}'
  
  # Launch with wrapper
  echo ""
  echo "LAUNCHING WITH P10.4 WRAPPER:"
  START_TS=$(date +%s)
  
  # Run wrapper + E2E
  "$WRAPPER" "$BINARY" 30 "$RUN_LOG.wrapper.log" 2>&1 &
  WRAPPER_PID=$!
  
  # Wait for backend ready
  sleep 3
  
  # Run E2E tests (playwright)
  echo "Running Playwright E2E..."
  export TITANE_DEV=0
  pnpm exec playwright test --config=wdio.conf.ts 2>&1 | tee "$E2E_LOG"
  E2E_EXIT=$?
  
  END_TS=$(date +%s)
  DURATION=$((END_TS - START_TS))
  
  echo ""
  echo "RESULTS:"
  echo "- E2E exit: $E2E_EXIT"
  echo "- Duration: ${DURATION}s"
  echo "- Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  
  # Check for error markers
  FAILURES=$(grep -c "FAIL\|✖" "$E2E_LOG" 2>/dev/null || echo "0")
  echo "- Failures: $FAILURES"
  
  echo ""
  echo "End: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  
} | tee "$RUN_LOG"

exit $E2E_EXIT
