#!/usr/bin/env bash
#
# V24 Week 1 - 2 Hour Memory Measurement Script
# Purpose: Measure memory growth with all 3 Quick Wins optimizations active
# Tracks: A (STM limiter), C (Cache eviction), B (Response streaming)
#

set -euo pipefail

# Configuration
DURATION_SEC=7200  # 2 hours
SAMPLE_INTERVAL=300  # 5 minutes
LOG_FILE="/tmp/titan_v24_2h_measurement.log"
RESULTS_FILE="/tmp/titan_v24_memory_curve.csv"
BINARY_PATH="/home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/target/release/titane-infinity"

# Initialize
echo "V24 2-Hour Memory Measurement - Starting $(date)" | tee "$LOG_FILE"
echo "timestamp,elapsed_sec,mem_rss_mb,mem_vsz_mb,cpu_percent" > "$RESULTS_FILE"

# Check binary exists
if [ ! -f "$BINARY_PATH" ]; then
    echo "❌ ERROR: Binary not found at $BINARY_PATH" | tee -a "$LOG_FILE"
    exit 1
fi

# Export memory directory
export TITANE_MEMORY_DIR="/tmp/titan_v24_memory_test"
rm -rf "$TITANE_MEMORY_DIR"
mkdir -p "$TITANE_MEMORY_DIR"

echo "✅ Memory directory: $TITANE_MEMORY_DIR" | tee -a "$LOG_FILE"

# Start application in background
echo "🚀 Starting TITANE with all 3 optimizations..." | tee -a "$LOG_FILE"
"$BINARY_PATH" > /tmp/titan_v24_app.log 2>&1 &
APP_PID=$!

echo "✅ App PID: $APP_PID" | tee -a "$LOG_FILE"

# Wait for app to initialize
sleep 10

# Verify process is running
if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "❌ ERROR: App failed to start or crashed immediately" | tee -a "$LOG_FILE"
    cat /tmp/titan_v24_app.log | tail -50
    exit 1
fi

echo "✅ App is running, beginning measurement..." | tee -a "$LOG_FILE"

# Measurement loop
START_TIME=$(date +%s)
SAMPLES=0

while [ $SAMPLES -lt $((DURATION_SEC / SAMPLE_INTERVAL)) ]; do
    # Check if process still alive
    if ! kill -0 "$APP_PID" 2>/dev/null; then
        echo "❌ ERROR: App crashed during measurement at $(date)" | tee -a "$LOG_FILE"
        cat /tmp/titan_v24_app.log | tail -50
        exit 1
    fi
    
    # Capture memory metrics
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    # Get process stats (RSS in KB, VSZ in KB, CPU%)
    STATS=$(ps -p "$APP_PID" -o rss=,vsz=,pcpu= 2>/dev/null || echo "0 0 0.0")
    RSS_KB=$(echo "$STATS" | awk '{print $1}')
    VSZ_KB=$(echo "$STATS" | awk '{print $2}')
    CPU_PCT=$(echo "$STATS" | awk '{print $3}')
    
    # Convert to MB
    RSS_MB=$((RSS_KB / 1024))
    VSZ_MB=$((VSZ_KB / 1024))
    
    # Log to CSV
    echo "$(date +%Y-%m-%d_%H:%M:%S),$ELAPSED,$RSS_MB,$VSZ_MB,$CPU_PCT" >> "$RESULTS_FILE"
    
    echo "[Sample $((SAMPLES+1))/$((DURATION_SEC / SAMPLE_INTERVAL))] Elapsed: ${ELAPSED}s | RSS: ${RSS_MB}MB | VSZ: ${VSZ_MB}MB | CPU: ${CPU_PCT}%" | tee -a "$LOG_FILE"
    
    SAMPLES=$((SAMPLES + 1))
    sleep "$SAMPLE_INTERVAL"
done

# Measurement complete
echo "✅ Measurement complete at $(date)" | tee -a "$LOG_FILE"

# Stop application
echo "🛑 Stopping application..." | tee -a "$LOG_FILE"
kill "$APP_PID" 2>/dev/null || true
sleep 2
kill -9 "$APP_PID" 2>/dev/null || true

# Calculate memory growth
echo "" | tee -a "$LOG_FILE"
echo "=== MEMORY GROWTH ANALYSIS ===" | tee -a "$LOG_FILE"

# Extract first and last RSS values
FIRST_RSS=$(awk -F',' 'NR==2 {print $3}' "$RESULTS_FILE")
LAST_RSS=$(awk -F',' 'END {print $3}' "$RESULTS_FILE")

if [ -n "$FIRST_RSS" ] && [ -n "$LAST_RSS" ] && [ "$FIRST_RSS" -gt 0 ]; then
    GROWTH_MB=$((LAST_RSS - FIRST_RSS))
    GROWTH_PCT=$(awk "BEGIN {printf \"%.2f\", ($LAST_RSS - $FIRST_RSS) / $FIRST_RSS * 100}")
    
    echo "Initial RSS: ${FIRST_RSS}MB" | tee -a "$LOG_FILE"
    echo "Final RSS: ${LAST_RSS}MB" | tee -a "$LOG_FILE"
    echo "Growth: ${GROWTH_MB}MB (${GROWTH_PCT}%)" | tee -a "$LOG_FILE"
    
    # Decision
    if (( $(echo "$GROWTH_PCT < 15" | bc -l) )); then
        echo "✅ SUCCESS: Growth <15% (Quick Wins target met)" | tee -a "$LOG_FILE"
        echo "DECISION: STOP — No Medium term optimization needed" | tee -a "$LOG_FILE"
    elif (( $(echo "$GROWTH_PCT < 20" | bc -l) )); then
        echo "🟡 PARTIAL: Growth 15-20% (minimum acceptable)" | tee -a "$LOG_FILE"
        echo "DECISION: OPTIONAL escalate to Medium Wins (LTM compression, etc.)" | tee -a "$LOG_FILE"
    else
        echo "❌ FAIL: Growth >20% (Quick Wins insufficient)" | tee -a "$LOG_FILE"
        echo "DECISION: MUST escalate to Major Refactor" | tee -a "$LOG_FILE"
    fi
else
    echo "❌ ERROR: Unable to calculate growth (missing data)" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "Results saved to: $RESULTS_FILE" | tee -a "$LOG_FILE"
echo "Full log: $LOG_FILE" | tee -a "$LOG_FILE"
echo "App log: /tmp/titan_v24_app.log" | tee -a "$LOG_FILE"
