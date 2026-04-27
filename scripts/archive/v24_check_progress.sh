#!/usr/bin/env bash
#
# V24 Progress Monitor - Non-blocking measurement observer
#

export LC_ALL=C

LOG_FILE="/tmp/titan_v24_2h_measurement.log"
CSV_FILE="/tmp/titan_v24_memory_curve.csv"

echo "=== V24 MEASUREMENT PROGRESS ==="
echo ""

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Measurement not started (log file missing)"
    exit 1
fi

# Show last 10 log entries
echo "Recent Samples:"
tail -10 "$LOG_FILE"

echo ""
echo "=== LIVE METRICS ==="

# Calculate current progress
if [ -f "$CSV_FILE" ]; then
    SAMPLE_COUNT=$(wc -l < "$CSV_FILE")
    SAMPLE_COUNT=$((SAMPLE_COUNT - 1))  # Subtract header
    PROGRESS_PCT=$((SAMPLE_COUNT * 100 / 24))
    
    echo "Samples collected: $SAMPLE_COUNT / 24 (${PROGRESS_PCT}%)"
    
    # Extract first and current RSS
    FIRST_RSS=$(awk -F',' 'NR==2 {print $3}' "$CSV_FILE")
    LAST_RSS=$(awk -F',' 'END {print $3}' "$CSV_FILE")
    
    if [ -n "$FIRST_RSS" ] && [ -n "$LAST_RSS" ] && [ "$FIRST_RSS" -gt 0 ]; then
        CURRENT_GROWTH_MB=$((LAST_RSS - FIRST_RSS))
        CURRENT_GROWTH_PCT=$(awk "BEGIN {printf \"%.2f\", ($LAST_RSS - $FIRST_RSS) / $FIRST_RSS * 100}")
        
        echo "Initial RSS: ${FIRST_RSS}MB"
        echo "Current RSS: ${LAST_RSS}MB"
        echo "Current Growth: ${CURRENT_GROWTH_MB}MB (${CURRENT_GROWTH_PCT}%)"
        
        # Projection (linear extrapolation)
        if [ "$SAMPLE_COUNT" -gt 1 ]; then
            PROJECTED_FINAL=$(awk "BEGIN {rate = ($LAST_RSS - $FIRST_RSS) / $SAMPLE_COUNT; final = $FIRST_RSS + rate * 24; printf \"%.0f\", final}")
            PROJECTED_GROWTH=$(awk "BEGIN {printf \"%.2f\", ($PROJECTED_FINAL - $FIRST_RSS) / $FIRST_RSS * 100}")
        else
            PROJECTED_FINAL="$LAST_RSS"
            PROJECTED_GROWTH="0.00"
        fi
        
        echo ""
        echo "Projected Final RSS: ${PROJECTED_FINAL}MB"
        echo "Projected Growth: ${PROJECTED_GROWTH}%" 
        
        if awk "BEGIN {exit !($PROJECTED_GROWTH < 15)}"; then
            echo "Status: ✅ ON TRACK for <15% target"
        elif awk "BEGIN {exit !($PROJECTED_GROWTH < 20)}"; then
            echo "Status: 🟡 BORDERLINE (15-20% range)"
        else
            echo "Status: ⚠️ EXCEEDING target (>20%)"
        fi
    fi
fi

echo ""
REMAINING_SAMPLES=$((24 - SAMPLE_COUNT))
REMAINING_MINS=$((REMAINING_SAMPLES * 5))
echo "Time remaining: ~${REMAINING_SAMPLES} samples × 5min = ~${REMAINING_MINS} minutes"
