#!/usr/bin/env bash
# TITANE∞ v14 — CPU Load Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — CPU LOAD VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

# Get CPU usage (Linux-specific)
if [ -f /proc/stat ]; then
    # Read CPU stats twice with 1 second interval
    CPU_STATS_1=$(grep 'cpu ' /proc/stat)
    sleep 1
    CPU_STATS_2=$(grep 'cpu ' /proc/stat)

    # Calculate usage
    read -r _ user1 nice1 system1 idle1 _ <<< "$CPU_STATS_1"
    read -r _ user2 nice2 system2 idle2 _ <<< "$CPU_STATS_2"

    total1=$((user1 + nice1 + system1 + idle1))
    total2=$((user2 + nice2 + system2 + idle2))

    diff_total=$((total2 - total1))
    diff_idle=$((idle2 - idle1))

    if [ $diff_total -gt 0 ]; then
        CPU_USAGE=$(awk "BEGIN {printf \"%.1f\", 100 * ($diff_total - $diff_idle) / $diff_total}")
    else
        CPU_USAGE="0.0"
    fi

    echo "→ Current CPU Usage: ${CPU_USAGE}%"

    # Check thresholds
    if (( $(echo "$CPU_USAGE < 60" | bc -l) )); then
        echo "✅ CPU load: NORMAL (<60%)"
        echo "  → Harmonia Mode: Normal"
        echo "  → Watch Delay: 100ms"
    elif (( $(echo "$CPU_USAGE < 80" | bc -l) )); then
        echo "⚠️  CPU load: BALANCED (60-80%)"
        echo "  → Harmonia Mode: Balanced"
        echo "  → Watch Delay: 250ms"
    else
        echo "⚠️  CPU load: THROTTLED (>80%)"
        echo "  → Harmonia Mode: Throttled"
        echo "  → Watch Delay: 500ms"
        echo "  → Recommendation: Reduce watchers or background processes"
    fi
else
    echo "⚠️  Unable to read CPU stats (not on Linux)"
fi

# Check number of CPU cores
if command -v nproc &>/dev/null; then
    CORES=$(nproc)
    echo "→ CPU Cores: $CORES"
else
    echo "⚠️  Unable to detect CPU cores"
fi

# Check if Harmonia engine is available
if [ -f "src-tauri/src/harmonia_engine.rs" ]; then
    echo "✅ Harmonia Engine module found"
else
    echo "⚠️  Harmonia Engine module not found"
fi

# Summary
echo "═══════════════════════════════════════════════════════════════"
echo "✅ CPU LOAD VERIFICATION COMPLETED"
exit 0
