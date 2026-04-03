#!/usr/bin/env bash
#
# V24 Auto-Observer - Periodic progress updates
# Runs every 15 minutes to log measurement trends
#

INTERVAL_SEC=900  # 15 minutes
LOG_FILE="/tmp/titan_v24_observer.log"
PROGRESS_SCRIPT="/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/v24_check_progress.sh"

echo "V24 Auto-Observer Started at $(date)" | tee "$LOG_FILE"
echo "Checking progress every 15 minutes..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Monitor until measurement completes
ITERATIONS=0
MAX_ITERATIONS=10  # ~2.5 hours max

while [ $ITERATIONS -lt $MAX_ITERATIONS ]; do
    echo "=== Update $(date) ===" | tee -a "$LOG_FILE"
    
    # Run progress check
    if [ -f "$PROGRESS_SCRIPT" ]; then
        "$PROGRESS_SCRIPT" 2>&1 | tee -a "$LOG_FILE"
    else
        echo "❌ Progress script not found" | tee -a "$LOG_FILE"
        exit 1
    fi
    
    echo "" | tee -a "$LOG_FILE"
    
    # Check if measurement completed
    if grep -q "Measurement complete" /tmp/titan_v24_2h_measurement.log 2>/dev/null; then
        echo "✅ MEASUREMENT COMPLETE - Stopping observer" | tee -a "$LOG_FILE"
        
        # Show final results
        echo "" | tee -a "$LOG_FILE"
        echo "=== FINAL RESULTS ===" | tee -a "$LOG_FILE"
        tail -30 /tmp/titan_v24_2h_measurement.log | tee -a "$LOG_FILE"
        
        exit 0
    fi
    
    ITERATIONS=$((ITERATIONS + 1))
    
    # Don't sleep on last iteration
    if [ $ITERATIONS -lt $MAX_ITERATIONS ]; then
        sleep "$INTERVAL_SEC"
    fi
done

echo "⚠️ Max iterations reached, stopping observer" | tee -a "$LOG_FILE"
