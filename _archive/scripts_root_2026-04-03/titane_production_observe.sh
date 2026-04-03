#!/usr/bin/env bash
#
# TITANE Production Week 1: Lightweight Observation Script
# Runs every 1 hour, collects memory/CPU metrics
# No external dependencies, minimal overhead
#

set -euo pipefail

# Configuration
PROCESS_NAME="titane-infinity"
LOG_CSV="/tmp/titane_production_week1.csv"
CRASH_LOG="/tmp/titane_crashes_week1.log"
FAILOVER_LOG="/tmp/titane_failovers_week1.log"
THRESHOLD_WARNING=213  # 18% growth warning (180 + 33)
THRESHOLD_CRITICAL=239  # 22% growth critical (180 + 59)

# Initialize logs on first run
if [ ! -f "$LOG_CSV" ]; then
    echo "timestamp,elapsed_hours,rss_mb,vsz_mb,cpu_percent,session_count,crash_count,failover_count,event_loop_lag_ms,provider_timeouts_per_hour,error_count" > "$LOG_CSV"
    echo "Production monitoring started: $(date)" > "$CRASH_LOG"
    echo "Production monitoring started: $(date)" > "$FAILOVER_LOG"
fi

# Calculate elapsed time since start
START_TIME=$(head -2 "$LOG_CSV" | tail -1 | cut -d',' -f1)
CURRENT_TIME=$(date +%Y-%m-%d_%H:%M:%S)
if [ -z "$START_TIME" ]; then
    ELAPSED_HOURS=0
else
    START_EPOCH=$(date -d "$START_TIME" +%s 2>/dev/null || echo 0)
    CURRENT_EPOCH=$(date +%s)
    ELAPSED_SECONDS=$((CURRENT_EPOCH - START_EPOCH))
    ELAPSED_HOURS=$((ELAPSED_SECONDS / 3600))
fi

# Find process and capture metrics
PID=$(pgrep -f "$PROCESS_NAME" || echo "")

if [ -z "$PID" ]; then
    # Process not running - possible crash/restart
    echo "[$(date)] CRASH: $PROCESS_NAME not running at $(date)" >> "$CRASH_LOG"
    echo "$CURRENT_TIME,$ELAPSED_HOURS,0,0,0,0,1,0" >> "$LOG_CSV"
    exit 1
fi

# Get process metrics
STATS=$(ps -p "$PID" -o rss=,vsz=,pcpu= 2>/dev/null || echo "0 0 0.0")
RSS_KB=$(echo "$STATS" | awk '{print $1}')
VSZ_KB=$(echo "$STATS" | awk '{print $2}')
CPU_PCT=$(echo "$STATS" | awk '{print $3}')

RSS_MB=$((RSS_KB / 1024))
VSZ_MB=$((VSZ_KB / 1024))

# Get session count (simple approximation from connection count)
SESSION_COUNT=$(netstat -tn 2>/dev/null | grep -c ESTABLISHED || echo "0")

# Get crash count from log
CRASH_COUNT=$(grep -c "CRASH:" "$CRASH_LOG" || echo "0")

# Get failover count (look for provider switch messages in app logs)
FAILOVER_COUNT=$(grep -c "provider.*failover\|provider.*switch" /tmp/titan_v24_app.log 2>/dev/null || echo "0")

# V26 RESILIENCE METRICS
# 1. Event Loop Lag (detect subtle blocking even if RAM stable)
# Look for lag detection in logs (simple heuristic)
EVENT_LOOP_LAG=$(grep -oP 'event.*lag[:\s]+\K\d+' /tmp/titan_v24_app.log 2>/dev/null | tail -1 || echo "0")

# 2. Provider Timeout Count (detect network/API fragility)
PROVIDER_TIMEOUTS=$(grep -c "timeout\|connection.*refused\|http.*5\|provider.*error" /tmp/titan_v24_app.log 2>/dev/null || echo "0")
# Normalize to per-hour (awk-based to avoid bc)
PROVIDER_TIMEOUTS_PER_HOUR=$(echo "$PROVIDER_TIMEOUTS $ELAPSED_HOURS" | awk '{if ($2 > 0) printf "%.1f", $1 / ($2 + 1); else print $1}')

# 3. Unhandled Promise / Panic logs count (detect silent errors)
ERROR_COUNT=$(grep -c "unhandled.*error\|panic\|fatal\|unhandled.*rejection" /tmp/titan_v24_app.log 2>/dev/null || echo "0")

# Log the metrics (now with 3 new columns)
echo "$CURRENT_TIME,$ELAPSED_HOURS,$RSS_MB,$VSZ_MB,$CPU_PCT,$SESSION_COUNT,$CRASH_COUNT,$FAILOVER_COUNT,$EVENT_LOOP_LAG,$PROVIDER_TIMEOUTS_PER_HOUR,$ERROR_COUNT" >> "$LOG_CSV"

# Check thresholds
if [ "$RSS_MB" -gt "$THRESHOLD_CRITICAL" ]; then
    echo "[CRITICAL] RSS $RSS_MB MB exceeds threshold $THRESHOLD_CRITICAL MB at hour $ELAPSED_HOURS" | tee -a "$FAILOVER_LOG"
    exit 2
elif [ "$RSS_MB" -gt "$THRESHOLD_WARNING" ]; then
    echo "[WARNING] RSS $RSS_MB MB approaching threshold at hour $ELAPSED_HOURS" | tee -a "$FAILOVER_LOG"
    exit 1
fi

exit 0
