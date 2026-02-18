#!/bin/bash

REPO_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
PACK_DIR="${1:-.}"
WRAPPER="${2:-}"

if [ -z "$WRAPPER" ] || [ ! -f "$WRAPPER" ]; then
  echo "❌ Usage: $0 <pack_dir> <wrapper_path>"
  exit 1
fi

cd "$REPO_ROOT"

# Log file for all runs
MASTER_LOG="$PACK_DIR/RUNS_MASTER.txt"
echo "P10.6 E2E Full Suite Execution — $(date -u)" > "$MASTER_LOG"
echo "Wrapper: $WRAPPER" >> "$MASTER_LOG"
echo "" >> "$MASTER_LOG"

# Track results
declare -a RUN_RESULTS
declare -a RUN_DURATIONS
declare -a RUN_EXITS

# Run 3 iterations
for iter in 1 2 3; do
  echo ""
  echo "╔════════════════════════════════════════╗"
  echo "║  E2E Run $iter/3                       ║"
  echo "╚════════════════════════════════════════╝"
  
  LOG_FILE="$PACK_DIR/RUN_${iter}_FULL.txt"
  METRICS_FILE="$PACK_DIR/RUN_${iter}_METRICS.json"
  
  # Capture start time in nanoseconds
  START_TS=$(date +%s%N)
  
  echo "Starting at $(date -u)" >> "$MASTER_LOG"
  echo "Log: $LOG_FILE" >> "$MASTER_LOG"
  
  # Launch wrapper in background
  bash "$WRAPPER" > "/tmp/wrapper_${iter}.log" 2>&1 &
  WRAPPER_PID=$!
  
  # Wait for backend ready (check if binary is running and IPC is available)
  BACKEND_READY=0
  for wait_iter in {1..20}; do
    sleep 0.5
    if ps -p $WRAPPER_PID > /dev/null 2>&1; then
      # Check if binary is still running
      if grep -q "✅" "/tmp/wrapper_${iter}.log" 2>/dev/null; then
        BACKEND_READY=1
        break
      fi
    else
      # Process died
      break
    fi
  done
  
  sleep 2  # Additional stability wait
  
  # Execute E2E suite
  set +e
  timeout 600 node scripts/e2e/run-desktop-suite.js > "$LOG_FILE" 2>&1
  E2E_EXIT=$?
  set -e
  
  # Capture end time
  END_TS=$(date +%s%N)
  DURATION_MS=$(( (END_TS - START_TS) / 1000000 ))
  
  # Extract metrics from log
  ASSERTIONS=$(grep -c "✓\|✔\|pass\|Pass" "$LOG_FILE" 2>/dev/null || echo "0")
  FAILURES=$(grep -c "✗\|✖\|fail\|Fail" "$LOG_FILE" 2>/dev/null || echo "0")
  SELECTOR_ERRORS=$(grep -ic "data-testid\|selector\|not found\|cannot find" "$LOG_FILE" 2>/dev/null || echo "0")
  
  # Store results
  RUN_RESULTS[$iter]="exit=$E2E_EXIT"
  RUN_DURATIONS[$iter]=$DURATION_MS
  RUN_EXITS[$iter]=$E2E_EXIT
  
  # Write metrics JSON
  cat > "$METRICS_FILE" << METRICS_JSON
{
  "run": $iter,
  "duration_ms": $DURATION_MS,
  "exit_code": $E2E_EXIT,
  "test_assertions": $ASSERTIONS,
  "test_failures": $FAILURES,
  "selector_errors": $SELECTOR_ERRORS,
  "backend_ready": $BACKEND_READY,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
METRICS_JSON
  
  # Kill wrapper
  kill $WRAPPER_PID 2>/dev/null || true
  wait $WRAPPER_PID 2>/dev/null || true
  
  # Display result
  if [ $E2E_EXIT -eq 0 ]; then
    STATUS="✅ PASS"
  else
    STATUS="❌ FAIL"
  fi
  
  echo "$STATUS | Duration: ${DURATION_MS}ms | Assertions: $ASSERTIONS | Failures: $FAILURES | Exit: $E2E_EXIT"
  echo "$STATUS | Run $iter complete" >> "$MASTER_LOG"
  echo "" >> "$MASTER_LOG"
  
done

# Analyze determinism
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  DETERMINISM ANALYSIS                  ║"
echo "╚════════════════════════════════════════╝"

if [ ${RUN_EXITS[1]} -eq 0 ] && [ ${RUN_EXITS[2]} -eq 0 ] && [ ${RUN_EXITS[3]} -eq 0 ]; then
  echo "✅ All 3 runs passed (exit code 0)"
  DETERMINISTIC="true"
else
  echo "⚠️ Some runs failed (exit codes: ${RUN_EXITS[1]}, ${RUN_EXITS[2]}, ${RUN_EXITS[3]})"
  DETERMINISTIC="false"
fi

# Calculate variance
MIN_DUR=${RUN_DURATIONS[1]}
MAX_DUR=${RUN_DURATIONS[1]}

for dur in "${RUN_DURATIONS[@]}"; do
  if [ "$dur" -lt "$MIN_DUR" ]; then
    MIN_DUR=$dur
  fi
  if [ "$dur" -gt "$MAX_DUR" ]; then
    MAX_DUR=$dur
  fi
done

if [ "$MIN_DUR" -gt 0 ]; then
  VARIANCE=$(( 100 * (MAX_DUR - MIN_DUR) / MIN_DUR ))
else
  VARIANCE=0
fi

echo "Duration variance: $VARIANCE% (${RUN_DURATIONS[1]}ms, ${RUN_DURATIONS[2]}ms, ${RUN_DURATIONS[3]}ms)"
echo "Variance check: $([ $VARIANCE -le 10 ] && echo '✅ OK (<10%)' || echo '⚠️ High (>10%)')"

# Create summary
cat > "$PACK_DIR/02_E2E_RESULTS.txt" << RESULTS_EOF
=== P10.6 E2E Full Suite Execution Results ===

Run 1: Exit ${RUN_EXITS[1]}, Duration ${RUN_DURATIONS[1]}ms
Run 2: Exit ${RUN_EXITS[2]}, Duration ${RUN_DURATIONS[2]}ms
Run 3: Exit ${RUN_EXITS[3]}, Duration ${RUN_DURATIONS[3]}ms

Duration Variance: $VARIANCE%
Deterministic: $DETERMINISTIC

Analyze:
- All 3 runs must have exit code 0
- Duration variance must be < 10%
- No selector-related failures

RESULTS_EOF

echo "✅ All 3 E2E runs complete"
echo "See $PACK_DIR for details"

