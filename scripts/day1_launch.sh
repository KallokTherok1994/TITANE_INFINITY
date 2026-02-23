#!/bin/bash

###############################################################################
# 🚀 DAY 1 ACTIVATION: v27.1.0 PRODUCTION DEPLOYMENT
# Production Observation Window: 2026-02-23 → 2026-03-01 (7 days)
# Timeline: Copy & execute steps in sequence
# Exit on error: strict mode enabled
###############################################################################

set -euo pipefail

REPO_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
BINARY_PATH="$REPO_ROOT/src-tauri/target/release/titane-infinity"
MEMORY_DIR="/tmp/titane_week1_memory"
CSV_PATH="/tmp/titane_production_week1.csv"
LOG_PATH="/tmp/titane_day1.log"
PID_FILE="/tmp/titane_day1.pid"

echo "════════════════════════════════════════════════════════════════════════"
echo "   🚀 DAY 1 ACTIVATION: v27.1.0 PRODUCTION OBSERVATION LAUNCH"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# STEP 0: Verify infrastructure
echo "📋 STEP 0: Verify infrastructure"
if [ ! -f "$BINARY_PATH" ]; then
  echo "  ❌ Binary not found: $BINARY_PATH"
  exit 1
fi
echo "  ✅ v27.1.0 binary found ($(ls -lh $BINARY_PATH | awk '{print $5}'))"

if [ ! -f "$REPO_ROOT/scripts/titane_production_observe.sh" ]; then
  echo "  ❌ Observation script not found"
  exit 1
fi
echo "  ✅ Observation script found"

echo ""

# STEP 1: Setup memory directory
echo "📁 STEP 1: Setup memory directory"
mkdir -p "$MEMORY_DIR"
chmod 755 "$MEMORY_DIR"
export TITANE_MEMORY_DIR="$MEMORY_DIR"
echo "  ✅ Memory directory: $MEMORY_DIR"
echo ""

# STEP 2: Clean previous data (optional - uncomment to reset)
# echo "🧹 Cleaning previous observation data..."
# rm -f "$CSV_PATH" "$LOG_PATH" "$PID_FILE"
# echo "  ✅ Cleaned"
# echo ""

# STEP 3: Launch titane-infinity v27.1.0
echo "🚀 STEP 3: Launch titane-infinity v27.1.0"
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if ps -p "$OLD_PID" > /dev/null 2>&1; then
    echo "  ⚠️  Previous instance running (PID $OLD_PID)"
    read -p "  Kill and restart? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      kill "$OLD_PID" 2>/dev/null || true
      sleep 2
      echo "  ✅ Killed previous instance"
    else
      echo "  ❌ Abort: previous instance still running"
      exit 1
    fi
  fi
fi

nohup "$BINARY_PATH" >> "$LOG_PATH" 2>&1 &
NEW_PID=$!
echo $NEW_PID > "$PID_FILE"
chmod 644 "$PID_FILE"

echo "  ✅ Process launched (PID: $NEW_PID)"
echo "  📝 Log: $LOG_PATH"
echo ""

# STEP 4: Wait for process startup
echo "⏳ STEP 4: Waiting for process startup (5 seconds)..."
sleep 5

if ! ps -p "$NEW_PID" > /dev/null 2>&1; then
  echo "  ❌ Process exited unexpectedly"
  echo "  Log tail:"
  tail -20 "$LOG_PATH"
  exit 1
fi
echo "  ✅ Process running"
echo ""

# STEP 5: Initialize observation collection
echo "📊 STEP 5: Initialize observation collection"
if [ -f "$CSV_PATH" ]; then
  LINES=$(wc -l < "$CSV_PATH")
  echo "  ℹ️  Appending to existing CSV ($LINES lines)"
else
  echo "  ℹ️  Creating new CSV"
fi

# Run first observation
export TITANE_MEMORY_DIR
export TITANE_PRODUCTION_PID=$NEW_PID

bash "$REPO_ROOT/scripts/titane_production_observe.sh" 2>&1

if [ ! -f "$CSV_PATH" ]; then
  echo "  ❌ CSV not created"
  exit 1
fi

CSV_LINES=$(wc -l < "$CSV_PATH")
echo "  ✅ CSV created ($CSV_LINES lines)"
echo "  📁 CSV: $CSV_PATH"
echo ""

# STEP 6: Schedule hourly cron job
echo "⏰ STEP 6: Schedule hourly cron job"

CRON_CMD="*/60 * * * * /bin/bash $REPO_ROOT/scripts/titane_production_observe.sh > /tmp/titane_observe_cron.log 2>&1"
CRON_COMMENT="# TITANE v26 production observation (Day 1-7)"

# Check if already scheduled
if crontab -l 2>/dev/null | grep -q "titane_production_observe"; then
  echo "  ℹ️  Cron job already scheduled"
else
  (crontab -l 2>/dev/null || echo ""; echo "$CRON_COMMENT"; echo "$CRON_CMD") | crontab -
  echo "  ✅ Cron job scheduled (hourly)"
fi

echo ""

# STEP 7: Initialize daily notes
echo "📝 STEP 7: Initialize daily tracking"

DAILY_LOG="/tmp/PRODUCTION_WEEK1_DAILY_NOTES.md"

if [ ! -f "$DAILY_LOG" ]; then
  cat > "$DAILY_LOG" << 'EOF'
# Production Week 1 Daily Notes - v27.1.0

## Observation Window
- **Start:** 2026-02-23 09:00 UTC
- **End:** 2026-03-01 18:00 UTC
- **Duration:** 7 days
- **Frequency:** Hourly automated + daily manual review

---

## Daily Go/No-Go Status

### Day 1 (2026-02-23)
- **Time:** [START: 09:00 UTC]
- **Status:** ⏳ IN PROGRESS
- **RSS Growth:** [TBD]
- **Alert:** [TBD]
- **Notes:** Deployment initiated, hourly collection started

### Day 2 (2026-02-24)
- **Time:** [TBD]
- **Status:** ⏳ PENDING
- **RSS Growth:** [TBD]
- **Alert:** [TBD]
- **Notes:** [To be filled]

### Day 3 (2026-02-25)
- **Time:** [TBD]
- **Status:** ⏳ PENDING
- **RSS Growth:** [TBD]
- **Alert:** [TBD]
- **Notes:** [To be filled]

### Day 4 (2026-02-26)
- **Time:** [TBD]
- **Status:** ⏳ PENDING
- **RSS Growth:** [TBD]
- **Alert:** [TBD]
- **Notes:** [To be filled]

### Day 5 (2026-02-27)
- **Time:** [TBD]
- **Status:** ⏳ PENDING
- **RSS Growth:** [TBD]
- **Alert:** [TBD]
- **Notes:** [To be filled]

### Day 6 (2026-02-28)
- **Time:** [TBD]
- **Status:** ⏳ PENDING
- **RSS Growth:** [TBD]
- **Alert:** [TBD]
- **Notes:** [To be filled]

### Day 7 (2026-03-01)
- **Time:** [TBD]
- **Status:** ⏳ PENDING
- **RSS Growth:** [TBD]
- **Alert:** [TBD]
- **Final Verdict:** [TBD - PASS/FAIL]
- **Notes:** [To be filled after analysis]

---

## Quick Access Commands

**Check current status:**
```bash
bash /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/v26_daily_check.sh
```

**View latest CSV data:**
```bash
tail -10 /tmp/titane_production_week1.csv
```

**Generate final verdict (Day 7 after 15:00):**
```bash
bash /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_analyze.sh
```

**View cron job logs:**
```bash
tail -50 /tmp/titane_observe_cron.log
```

---

## Success Criteria (Pre-locked)

✅ **PASS Verdict IF:**
- All 7 days collected (168 hourly samples in CSV)
- No missing data (sequential timestamps)
- Final RSS: 120-130 MB (10-20% growth from 110 MB baseline)
- Event loop lag: <100 ms (95th percentile)
- Provider timeouts: <5/hr (median)
- Crash count: 0
- Error count: <10/day aggregate

⛔ **FAIL Verdict IF:**
- RSS exceeds 240 MB (hard limit, RED threshold)
- Event loop lag >200 ms (3+ samples)
- Crashes: >1 unplanned restart
- Errors: >15/day aggregate

📊 **THRESHOLDS:**
- 🟢 GREEN: RSS <213 MB (18% growth)
- 🟡 YELLOW: 213-239 MB (18-22% growth)
- 🔴 RED: ≥240 MB (>22% growth)

EOF

  echo "  ✅ Daily tracking initialized: $DAILY_LOG"
else
  echo "  ℹ️  Daily tracking file exists: $DAILY_LOG"
fi

echo ""

# FINAL SUMMARY
echo "════════════════════════════════════════════════════════════════════════"
echo "   ✅ DAY 1 ACTIVATION COMPLETE"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Deployment Summary:"
echo "  Binary:        $BINARY_PATH ($(ls -lh $BINARY_PATH | awk '{print $5}'))"
echo "  Process ID:    $NEW_PID"
echo "  Log:           $LOG_PATH"
echo "  CSV:           $CSV_PATH"
echo "  Cron Job:      Hourly (starting next hour)"
echo "  Daily Notes:   $DAILY_LOG"
echo ""
echo "🎯 Next Steps:"
echo "  1. Monitor /tmp/titane_day1.log for errors"
echo "  2. Each day at 09:00, run: bash /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/v26_daily_check.sh"
echo "  3. Update daily status in: $DAILY_LOG"
echo "  4. Day 7 at 15:00+, run: bash /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_analyze.sh"
echo ""
echo "📚 Documentation:"
echo "  - Full strategy: DAY1_ACTIVATION_SUMMARY.md"
echo "  - Go/no-go triggers: WEEK1_MONITORING_CHECKPOINTS.md"
echo "  - Technical reference: V26_PHASE_COMPLETE.md"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
