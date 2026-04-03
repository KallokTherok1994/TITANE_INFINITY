#!/bin/bash
# DAY 1 ACTIVATION - Non-interactive launch (fully automated)

set -euo pipefail

REPO="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
BIN="$REPO/src-tauri/target/release/titane-infinity"
CSV="/tmp/titane_production_week1.csv"
LOG="/tmp/titane_day1.log"
PID_FILE="/tmp/titane_day1.pid"

echo "════════════════════════════════════════════════════════════════════"
echo "🚀 DAY 1 ACTIVATION: v27.1.0 (Non-interactive)"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Kill any existing process silently
pkill -9 titane-infinity 2>/dev/null || true
sleep 1

# Setup
export TITANE_MEMORY_DIR="/tmp/titane_week1_memory"
mkdir -p "$TITANE_MEMORY_DIR"
rm -f "$CSV" "$LOG"  # Clean start

# Launch
nohup "$BIN" >> "$LOG" 2>&1 &
NEW_PID=$!
echo $NEW_PID > "$PID_FILE"

echo "✅ Process launched (PID: $NEW_PID)"
echo "✅ Log: $LOG"
echo ""

# Wait for startup
sleep 5

# First observation
export TITANE_PRODUCTION_PID=$NEW_PID
bash "$REPO/scripts/titane_production_observe.sh" 2>&1 || true

# Check CSV
if [ -f "$CSV" ]; then
    echo "✅ CSV created: $(wc -l < $CSV) lines"
    tail -3 "$CSV"
else
    echo "⚠️  CSV not yet created"
fi

echo ""
echo "✅ Day 1 deployment complete"
echo ""
echo "Manual commands:"
echo "  • Check status: tail -20 $LOG"
echo "  • Daily review: bash $REPO/scripts/v26_daily_check.sh"
echo "  • View data: tail -5 $CSV"
echo ""
