#!/usr/bin/env bash
#
# TITANE Production Week 1: Final Analysis Report
# Runs on Day 7 to generate verdict
#

set -euo pipefail

LOG_CSV="/tmp/titane_production_week1.csv"
CRASH_LOG="/tmp/titane_crashes_week1.log"
FAILOVER_LOG="/tmp/titane_failovers_week1.log"

if [ ! -f "$LOG_CSV" ]; then
    echo "❌ No data collected yet"
    exit 1
fi

echo "================================================================================"
echo "TITANE PRODUCTION WEEK 1: FINAL ANALYSIS REPORT"
echo "================================================================================"
echo ""

# Extract first and last metrics
FIRST_LINE=$(head -2 "$LOG_CSV" | tail -1)
LAST_LINE=$(tail -1 "$LOG_CSV")

# Parse values
FIRST_RSS=$(echo "$FIRST_LINE" | cut -d',' -f3)
LAST_RSS=$(echo "$LAST_LINE" | cut -d',' -f3)
MAX_RSS=$(awk -F',' 'NR>1 {print $3}' "$LOG_CSV" | sort -n | tail -1)
FINAL_ELAPSED=$(echo "$LAST_LINE" | cut -d',' -f2)

echo "MEMORY METRICS:"
echo "  Initial RSS:        $FIRST_RSS MB"
echo "  Final RSS:          $LAST_RSS MB"
echo "  Max RSS (peak):     $MAX_RSS MB"
echo ""

if [ "$FIRST_RSS" -gt 0 ]; then
    GROWTH_MB=$((LAST_RSS - FIRST_RSS))
    GROWTH_PCT=$(awk "BEGIN {printf \"%.2f\", ($LAST_RSS - $FIRST_RSS) / $FIRST_RSS * 100}")
    MAX_GROWTH_PCT=$(awk "BEGIN {printf \"%.2f\", ($MAX_RSS - $FIRST_RSS) / $FIRST_RSS * 100}")
    
    echo "  Absolute Growth:    +$GROWTH_MB MB"
    echo "  Growth %:           +${GROWTH_PCT}%"
    echo "  Max Growth %:       +${MAX_GROWTH_PCT}%"
    echo ""
    
    # Analyze growth trend
    SAMPLE_COUNT=$(wc -l < "$LOG_CSV")
    SAMPLE_COUNT=$((SAMPLE_COUNT - 1))
    
    if [ "$SAMPLE_COUNT" -gt 1 ]; then
        AVG_GROWTH_PER_HOUR=$(awk "BEGIN {printf \"%.2f\", $GROWTH_MB / $FINAL_ELAPSED}")
        echo "  Average Growth Rate: ${AVG_GROWTH_PER_HOUR} MB/hour"
    fi
fi

echo ""
echo "STABILITY ANALYSIS:"

# Detect crash events
CRASH_COUNT=$(grep -c "CRASH:" "$CRASH_LOG" || echo "0")
FAILOVER_COUNT=$(wc -l < "$FAILOVER_LOG" 2>/dev/null || echo "0")
FAILOVER_COUNT=$((FAILOVER_COUNT - 1))  # Subtract header

echo "  Crashes:            $CRASH_COUNT"
echo "  Failovers:          $FAILOVER_COUNT"
echo ""

# Thresholds
THRESHOLD_WARNING=213
THRESHOLD_CRITICAL=239

echo "THRESHOLD STATUS:"
echo "  Green (<213 MB):    $([ "$MAX_RSS" -lt "$THRESHOLD_WARNING" ] && echo "✅ YES" || echo "❌ NO")"
echo "  Yellow (213-239):   $([ "$MAX_RSS" -ge "$THRESHOLD_WARNING" ] && [ "$MAX_RSS" -le "$THRESHOLD_CRITICAL" ] && echo "⚠️ YES" || echo "✅ NO")"
echo "  Red (>239 MB):      $([ "$MAX_RSS" -gt "$THRESHOLD_CRITICAL" ] && echo "🔴 YES" || echo "✅ NO")"
echo ""

# Final verdict
echo "================================================================================"
echo "FINAL VERDICT:"
echo ""

VERDICT_OK=1

if [ "$MAX_RSS" -gt "$THRESHOLD_CRITICAL" ]; then
    echo "❌ FAILED: RSS exceeded critical threshold ($MAX_RSS MB > $THRESHOLD_CRITICAL MB)"
    echo "Decision: ROLLBACK to v27.0.5, escalate to Medium Wins optimization"
    VERDICT_OK=0
elif [ "$MAX_RSS" -gt "$THRESHOLD_WARNING" ]; then
    echo "⚠️ PARTIAL: RSS in yellow zone ($MAX_RSS MB, 18-22% growth)"
    echo "Decision: OPTIONAL consider Medium Wins, continue 1-week monitoring"
elif [ "$CRASH_COUNT" -gt 0 ]; then
    echo "❌ FAILED: Crashes detected ($CRASH_COUNT events)"
    echo "Decision: INVESTIGATE crash root cause, prepare rollback"
    VERDICT_OK=0
elif [ "$GROWTH_PCT" -lt "18" ]; then
    echo "✅ SUCCESS: Plateau maintained (+${GROWTH_PCT}%, <18% threshold)"
    echo "Decision: GO FOR SCALING - Ready for 10% user base test"
else
    echo "✅ ACCEPTABLE: Growth within limits (+${GROWTH_PCT}%, <20%)"
    echo "Decision: CONTINUE - Monitor for 1 week before scaling"
fi

echo ""
echo "================================================================================"
echo ""

# Export summary to file
cat > /tmp/titane_week1_verdict.txt << EOF
TITANE PRODUCTION WEEK 1 VERDICT
Date: $(date)
Final RSS: $LAST_RSS MB (growth: +${GROWTH_PCT}%)
Peak RSS: $MAX_RSS MB
Crashes: $CRASH_COUNT
Uptime: $FINAL_ELAPSED hours

Status: $([ "$VERDICT_OK" -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")
EOF

echo "Verdict summary saved to: /tmp/titane_week1_verdict.txt"
echo ""

exit $([ "$VERDICT_OK" -eq 1 ] && echo 0 || echo 2)
