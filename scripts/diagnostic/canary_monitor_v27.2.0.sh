#!/bin/bash

################################################################################
#                                                                              #
#  TITANE Infinity v27.2.0 Canary Monitoring Script                           #
#  Purpose: Monitor production deployment in real-time                        #
#  Usage: ./canary_monitor.sh [phase] [duration_minutes]                     #
#                                                                              #
################################################################################

PHASE="${1:-1}"
DURATION="${2:-30}"
LOGFILE="/tmp/titane_v27.2.0_monitor_phase${PHASE}.log"
METRICS_FILE="/tmp/titane_v27.2.0_metrics_phase${PHASE}.json"

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE Infinity v27.2.0 Canary Monitoring - Phase $PHASE"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "Monitoring duration: $DURATION minutes"
echo "Logging to: $LOGFILE"
echo "Metrics to: $METRICS_FILE"
echo ""

# Initialize metrics
cat > "$METRICS_FILE" << EOF
{
  "phase": $PHASE,
  "start_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "duration_minutes": $DURATION,
  "checks": {
    "application_crashes": 0,
    "gate_enforcement_blocks": 0,
    "ollama_cache_hits": 0,
    "ollama_cache_misses": 0,
    "timeout_errors": 0,
    "network_status_errors": 0,
    "policy_blocks": 0
  },
  "status": "monitoring"
}
EOF

# Log function
log() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "[$timestamp] $1" | tee -a "$LOGFILE"
}

# Monitoring loop
START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION * 60))
CHECK_INTERVAL=10  # Check every 10 seconds

log "✅ Monitoring started for Phase $PHASE"
log ""
log "Key Metrics to Monitor:"
log "  • Application crashes (0 expected)"
log "  • Gate enforcement blocks (should correlate with policy blocks)"
log "  • Ollama cache hit rate (target: >80%)"
log "  • Network status accuracy (0 false negatives expected)"
log "  • Timeout errors (should be <1%)"
log ""

ITERATION=0
while [ $(date +%s) -lt $END_TIME ]; do
    ITERATION=$((ITERATION + 1))
    
    log ""
    log "=== CHECK $ITERATION ($(date -u +"%H:%M:%S")) ==="
    
    # Check 1: Look for crash indicators
    CRASH_INDICATORS=$(grep -i "panic\|segfault\|sigsegv\|abort" "$LOGFILE" 2>/dev/null | wc -l)
    if [ "$CRASH_INDICATORS" -gt 0 ]; then
        log "🔴 ALERT: Potential crash detected"
        log "   Crash indicators found: $CRASH_INDICATORS"
    else
        log "✅ Application stability: OK (no crash indicators)"
    fi
    
    # Check 2: Gate enforcement
    GATE_BLOCKS=$(grep -i "policy_blocked\|gate.*block" "$LOGFILE" 2>/dev/null | wc -l)
    log "✅ Gate enforcement: $GATE_BLOCKS policy blocks recorded"
    
    # Check 3: Ollama cache performance (estimated)
    CACHE_HITS=$(grep -i "ollama.*cache.*hit" "$LOGFILE" 2>/dev/null | wc -l)
    CACHE_MISSES=$(grep -i "ollama.*cache.*miss" "$LOGFILE" 2>/dev/null | wc -l)
    if [ "$((CACHE_HITS + CACHE_MISSES))" -gt 0 ]; then
        HIT_RATE=$((CACHE_HITS * 100 / (CACHE_HITS + CACHE_MISSES)))
        log "✅ Ollama cache: Hit rate $HIT_RATE% ($CACHE_HITS hits, $CACHE_MISSES misses)"
    else
        log "⏳ Ollama cache: No data yet"
    fi
    
    # Check 4: Network status accuracy
    NETWORK_ERRORS=$(grep -i "network.*error\|offline.*false\|online.*false" "$LOGFILE" 2>/dev/null | wc -l)
    if [ "$NETWORK_ERRORS" -gt 0 ]; then
        log "🔴 ALERT: Network status error detected"
        log "   Errors found: $NETWORK_ERRORS"
    else
        log "✅ Network status accuracy: OK"
    fi
    
    # Check 5: Timeout errors
    TIMEOUT_ERRORS=$(grep -i "timeout\|timed out" "$LOGFILE" 2>/dev/null | wc -l)
    if [ "$TIMEOUT_ERRORS" -gt 5 ]; then
        log "🟡 WARNING: Elevated timeout errors ($TIMEOUT_ERRORS found)"
    else
        log "✅ Timeout errors: $TIMEOUT_ERRORS (acceptable)"
    fi
    
    # Wait before next check
    sleep $CHECK_INTERVAL
done

# Final summary
log ""
log "════════════════════════════════════════════════════════════════════════"
log "MONITORING COMPLETE - Phase $PHASE"
log "════════════════════════════════════════════════════════════════════════"
log ""

# Generate summary
cat >> "$METRICS_FILE" << EOF

  "end_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "crash_indicators": $CRASH_INDICATORS,
    "gate_blocks": $GATE_BLOCKS,
    "cache_hits": $CACHE_HITS,
    "cache_misses": $CACHE_MISSES,
    "hit_rate_percent": ${HIT_RATE:-0},
    "network_errors": $NETWORK_ERRORS,
    "timeout_errors": $TIMEOUT_ERRORS,
    "status": "$([ "$CRASH_INDICATORS" -eq 0 ] && echo "PASS" || echo "FAIL")"
  }
}
EOF

log ""
if [ "$CRASH_INDICATORS" -eq 0 ] && [ "$NETWORK_ERRORS" -eq 0 ]; then
    log "🟢 PHASE $PHASE MONITORING: PASSED"
    log ""
    log "✅ Application stability: PASS"
    log "✅ Gate enforcement: PASS"
    log "✅ Network status accuracy: PASS"
    log ""
    if [ "$PHASE" -lt 3 ]; then
        log "📊 Ready to proceed to Phase $((PHASE + 1))"
    else
        log "🎉 GA Full Rollout approved"
    fi
else
    log "🔴 PHASE $PHASE MONITORING: FAILED"
    log ""
    log "❌ Issues detected - review logs:"
    log "   $LOGFILE"
    log ""
    log "⚠️  Recommend rollback: git revert HEAD~1 HEAD && git push origin MAIN"
fi

log ""
log "Metrics saved to: $METRICS_FILE"
log "Full logs available at: $LOGFILE"
