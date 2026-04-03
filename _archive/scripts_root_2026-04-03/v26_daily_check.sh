#!/usr/bin/env bash
#
# V26 Daily Resilience Check (5 min max)
# Read CSV, verify signals, update daily notes
#

set -euo pipefail

CSV="/tmp/titane_production_week1.csv"
NOTES_FILE="/home/titane-os/Documents/GitHub/TITANE_INFINITY/PRODUCTION_WEEK1_DAILY_NOTES.md"

if [ ! -f "$CSV" ]; then
    echo "❌ No observation data yet"
    exit 1
fi

# Get latest metrics
LATEST=$(tail -1 "$CSV")
DAY=$(echo "$LATEST" | cut -d',' -f2 | awk '{print int($1 / 24) + 1}')

TIMESTAMP=$(echo "$LATEST" | cut -d',' -f1)
RSS=$(echo "$LATEST" | cut -d',' -f3)
CPU=$(echo "$LATEST" | cut -d',' -f5)
LAG=$(echo "$LATEST" | cut -d',' -f9)
ERRORS=$(echo "$LATEST" | cut -d',' -f11)
TIMEOUTS=$(echo "$LATEST" | cut -d',' -f10)

echo "================================================================================"
echo "V26 DAILY RESILIENCE CHECK - Day $DAY"
echo "================================================================================"
echo ""
echo "Latest observation: $TIMESTAMP"
echo ""

# Evaluate RAM
if [ "$RSS" -lt 213 ]; then
    RAM_STATUS="OK"
    RAM_EMOJI="✅"
elif [ "$RSS" -lt 239 ]; then
    RAM_STATUS="WARNING"
    RAM_EMOJI="🟡"
else
    RAM_STATUS="CRITICAL"
    RAM_EMOJI="🔴"
fi

# Evaluate CPU
CPU_INT=${CPU%.*}
if [ "$CPU_INT" -lt 10 ]; then
    CPU_STATUS="OK"
    CPU_EMOJI="✅"
elif [ "$CPU_INT" -lt 20 ]; then
    CPU_STATUS="NORMAL"
    CPU_EMOJI="✅"
else
    CPU_STATUS="SPIKE"
    CPU_EMOJI="⚠️"
fi

# Evaluate Lag
LAG_INT=${LAG%.*}
if [ "$LAG_INT" -lt 100 ]; then
    LAG_STATUS="OK"
    LAG_EMOJI="✅"
else
    LAG_STATUS="DETECTED"
    LAG_EMOJI="⚠️"
fi

# Evaluate Errors
if [ "$ERRORS" -eq 0 ]; then
    ERROR_STATUS="0"
    ERROR_EMOJI="✅"
else
    ERROR_STATUS="$ERRORS detected"
    ERROR_EMOJI="⚠️"
fi

# Detect anomalies
ANOMALIES=""
if [ "$TIMEOUTS" -gt 5 ]; then
    ANOMALIES="$ANOMALIES High timeouts ($TIMEOUTS)"
fi
if [ "$LAG_INT" -gt 200 ]; then
    ANOMALIES="$ANOMALIES Lag spike ($LAG_INT ms)"
fi
if [ "$ERRORS" -gt 0 ]; then
    ANOMALIES="$ANOMALIES Errors detected ($ERRORS)"
fi

if [ -z "$ANOMALIES" ]; then
    ANOMALIES="none"
fi

# Display report
echo "📊 METRICS SNAPSHOT"
echo "  RAM: $RAM_EMOJI $RSS MB ($RAM_STATUS)"
echo "  CPU: $CPU_EMOJI $CPU_INT% ($CPU_STATUS)"
echo "  Lag: $LAG_EMOJI $LAG_INT ms ($LAG_STATUS)"
echo "  Errors: $ERROR_EMOJI $ERROR_STATUS"
echo ""
echo "🚨 ANOMALIES: $ANOMALIES"
echo ""

# Overall status
if [ "$RAM_STATUS" = "CRITICAL" ] || [ "$ERROR_STATUS" != "0" ] && [ "$ERRORS" -gt 5 ]; then
    OVERALL="🔴 ESCALATE"
    VERDICT="ESCALATE"
elif [ "$RAM_STATUS" = "WARNING" ] || [ "$LAG_STATUS" = "DETECTED" ]; then
    OVERALL="🟡 MONITOR"
    VERDICT="MONITOR"
else
    OVERALL="✅ PROCEED"
    VERDICT="OK"
fi

echo "📌 OVERALL: $OVERALL"
echo ""

# Suggestion for daily notes update
echo "📝 UPDATE DAILY NOTES with:"
echo "  RAM: [$RAM_STATUS]"
echo "  CPU: [$CPU_STATUS]"
echo "  Lag: [$LAG_STATUS]"
echo "  Errors: [$ERROR_STATUS]"
echo "  Anomalies: [$ANOMALIES]"
echo ""

echo "================================================================================"
