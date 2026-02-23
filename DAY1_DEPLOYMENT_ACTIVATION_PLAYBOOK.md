# 🚀 Day 1 Deployment Activation Playbook

**Date:** 2026-02-23  
**Target:** Activate v27.1.0 production observation  
**Timeline:** 6 steps, ~30 minutes total  
**Checkpoint:** All CSV collection running by end of day  

---

## Pre-Deployment Verification (5 min)

### Step 0: Verify Infrastructure Ready

Run this to confirm all tools are in place:

```bash
bash /home/titane-os/Documents/GitHub/TITANE_INFINITY/V26_INFRASTRUCTURE_READY.sh
```

**Expected output:**
```
✅ All scripts ready (4/4)
✅ All documentation ready (4/4)
🟢 Thresholds locked
🎯 Success criteria defined
🚀 READY FOR DAY 1 DEPLOYMENT
```

**If BLOCKED:** Fix missing files before proceeding. Do not continue if any checks fail.

---

## Baseline Metrics (Reference from V24 Lab)

### V24 Lab Measurement Results

| Metric | Value | Status |
|--------|-------|--------|
| **Initial RSS** | 180 MB | Baseline (t=0) |
| **Peak RSS (before plateau)** | 200 MB | t=10 min |
| **Plateau RSS (stable)** | 200 MB | t=10-120+ min |
| **Growth %** | +11.11% | PASS (<15% target) |
| **Improvement vs v23** | -59% vs +27% | Excellent |
| **Plateau Duration** | 110+ min | Excellent |

### Day 1-7 Target Thresholds

```
🟢 GREEN (PROCEED):    RSS < 213 MB    (≤18% growth from 180 MB baseline)
🟡 YELLOW (MONITOR):   213-239 MB      (18-22% growth, investigate)
🔴 RED (ESCALATE):     > 239 MB        (>22% growth, rollback immediately)
```

---

## Step 1: Deploy v27.1.0 Binary (Time: 0-5 min)

### Option A: Build from Source (Recommended)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
git checkout MAIN
git pull origin MAIN 2>&1 | head -5
cd src-tauri && cargo build --release 2>&1 | tail -10
```

**Expected:**
```
Finished release [optimized] target(s) in XXs
```

**Binary location:** `target/release/titane-infinity`

### Option B: Use Pre-Built Artifact

If binary already exists in `deployment/latest/`:

```bash
ls -lh /home/titane-os/Documents/GitHub/TITANE_INFINITY/deployment/latest/titane-infinity*
```

---

## Step 2: Start TITANE Process (Time: 5-10 min)

### 2a: Set Memory Observation Directory

```bash
export TITANE_MEMORY_DIR="/tmp/titane_week1_memory"
mkdir -p "$TITANE_MEMORY_DIR"
```

### 2b: Launch TITANE in Background

Option 1 (Manual background):

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/target/release
./titane-infinity &
sleep 3
ps aux | grep titane-infinity | grep -v grep
```

Option 2 (Detached with logging):

```bash
TITANE_MEMORY_DIR="/tmp/titane_week1_memory" \
nohup /home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/target/release/titane-infinity \
  >> /tmp/titane_day1.log 2>&1 &
echo "TITANE PID: $!"
```

**Verification:**

```bash
ps aux | grep -E 'titane-infinity' | grep -v grep
```

**Expected:** One process running

---

## Step 3: Run First Observation (Time: 10-12 min)

```bash
/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_observe.sh
```

**Expected output:**
```
✅ Observation complete
CSV: /tmp/titane_production_week1.csv
Columns: 11
First row: timestamp,elapsed_hours,rss_mb,...
Latest: 2026-02-23 XX:XX:XX, 0.0, 198, ...
```

### Verify CSV Created

```bash
head -2 /tmp/titane_production_week1.csv
```

**Expected:**
```
timestamp,elapsed_hours,rss_mb,vsz_mb,cpu_percent,session_count,crash_count,failover_count,event_loop_lag_ms,provider_timeouts_per_hour,error_count
2026-02-23 HH:MM:SS,0.0,[RSS_VALUE],[VSZ_VALUE],X.X,X,0,0,[LAG],[TIMEOUTS],[ERRORS]
```

### Check Initial RSS Against Baseline

```bash
INITIAL_RSS=$(tail -1 /tmp/titane_production_week1.csv | cut -d',' -f3)
echo "Initial RSS: $INITIAL_RSS MB"

# Expected: 180-205 MB range (close to lab baseline 200 MB)
if [ "$INITIAL_RSS" -lt 210 ]; then
  echo "✅ Initial RSS OK (within green zone)"
else
  echo "⚠️  Initial RSS higher than expected - investigate"
fi
```

---

## Step 4: Schedule Hourly Observation (Time: 12-15 min)

### 4a: Add Cron Job

```bash
# Edit crontab
crontab -e

# Add this line (runs every hour at :00):
0 * * * * /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_observe.sh >> /tmp/titane_observe_cron.log 2>&1
```

### 4b: Verify Cron Job Added

```bash
crontab -l | grep titane_production_observe
```

**Expected:**
```
0 * * * * /home/titane-os/... titane_production_observe.sh ...
```

### 4c: Verify Next Hourly Execution (Manual for now)

Wait until next hour boundary (e.g., if started at 14:35, next auto-run at 15:00), OR manually trigger:

```bash
/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_observe.sh
```

Check CSV has 2 rows:

```bash
wc -l /tmp/titane_production_week1.csv
# Expected: 3 lines (header + 2 data rows)
```

---

## Step 5: Populate Day 1 Daily Notes (Time: 15-20 min)

Edit `PRODUCTION_WEEK1_DAILY_NOTES.md`:

```bash
vi /home/titane-os/Documents/GitHub/TITANE_INFINITY/PRODUCTION_WEEK1_DAILY_NOTES.md
```

Add Day 1 entry based on first observation:

```markdown
#### Day 1 (2026-02-23)

- **RAM**: [OK] 198 MB, within green zone (<213 MB)
- **CPU**: [OK] 5% average, no spikes during startup
- **Lag**: [OK] 12 ms, acceptable event loop performance
- **Errors**: [0] detected, clean startup
- **Anomalies**: none
```

### Verify Values from CSV

```bash
tail -1 /tmp/titane_production_week1.csv | cut -d',' -f3,5,9,11 | tr ',' '\n'
```

Copy these values into daily notes template.

---

## Step 6: Commit Day 1 Notes (Time: 20-25 min)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
git add PRODUCTION_WEEK1_DAILY_NOTES.md
git commit -m "Day 1: Initial observation activated - baseline captured (198 MB RSS)"
git push origin MAIN
```

**Verification:**

```bash
git log --oneline | head -1
```

---

## Daily Task Workflow (Days 1-7)

### ✅ Morning Review (Every Day, 2 min)

**Time:** First thing in morning

```bash
# Run daily health check
/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/v26_daily_check.sh
```

**Output:** RAM/CPU/Lag/Errors status + anomaly flags

**Copy into daily notes:**

Edit `PRODUCTION_WEEK1_DAILY_NOTES.md`:
- Update Day N entry with latest metrics
- Keep format: one sentence per field

### 📊 Monitor CSV Growth (Every Hour, auto)

Cron job runs automatically. Verify:

```bash
# Check latest entries
tail -2 /tmp/titane_production_week1.csv

# Count rows (should increment hourly)
wc -l /tmp/titane_production_week1.csv
```

### 🟡 Yellow Flag Alert (If RSS >213 MB)

```bash
# Check current RSS
CURRENT_RSS=$(tail -1 /tmp/titane_production_week1.csv | cut -d',' -f3)

if (( $(echo "$CURRENT_RSS > 213" | bc -l) )); then
  echo "🟡 YELLOW: RSS = $CURRENT_RSS MB"
  echo "Action: Investigate growth rate"
  grep "^2026" /tmp/titane_production_week1.csv | tail -5
fi
```

### 🔴 Red Flag Alert (If RSS >239 MB)

```bash
CURRENT_RSS=$(tail -1 /tmp/titane_production_week1.csv | cut -d',' -f3)

if (( $(echo "$CURRENT_RSS > 239" | bc -l) )); then
  echo "🔴 RED: RSS = $CURRENT_RSS MB - ESCALATE IMMEDIATELY"
  # Stop TITANE
  pkill -f titane-infinity
  echo "ERROR: Stopped TITANE - initiate rollback procedure"
  exit 1
fi
```

### 🧪 Optional Pre-Verdict Resilience Test (Days 5-6 only)

```bash
/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_resilience_guard.sh
```

Review output:

```bash
cat /tmp/titane_resilience_test.log | tail -20
```

Log result in daily notes: "Resilience test: [PASS/PARTIAL/CRITICAL]"

---

## Day 7: Final Verdict (2026-03-01)

### Step 7a: Run Final Analysis (5 min)

```bash
/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_analyze.sh
```

**Expected output:**
```
CSV rows: 169 (24 hours × 7 days = ~168 samples)
Initial RSS: 180 MB
Final RSS: [value]
Growth: [%]
Verdict: PASS / PARTIAL / CRITICAL
```

Check verdict file:

```bash
cat /tmp/titane_week1_verdict.txt
```

### Step 7b: Decision Logic

```bash
# Read verdict from script exit code
/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_analyze.sh
EXIT_CODE=$?

case $EXIT_CODE in
  0)
    echo "✅ PASS: Deploy v27.1.0 to 10% production users"
    echo "   Continue monitoring for 1 additional week"
    ;;
  1)
    echo "🟡 PARTIAL: Investigate + optional Medium Wins phase"
    echo "   Review growth rate and resilience signals"
    ;;
  2)
    echo "🔴 FAIL: Initiate rollback to v27.0.5"
    echo "   Root cause analysis required"
    ;;
esac
```

---

## Troubleshooting Guide

### Issue: CSV Not Created

```bash
# Check if script ran successfully
ls -l /tmp/titane_production_week1.csv

# If missing, run manually:
bash -x /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_observe.sh 2>&1 | tail -20

# Check TITANE process running
ps aux | grep titane-infinity | grep -v grep
```

### Issue: Initial RSS Already >213 MB

```bash
CURRENT=$(tail -1 /tmp/titane_production_week1.csv | cut -d',' -f3)

# Calculate growth from baseline
echo "scale=2; ($CURRENT - 180) / 180 * 100" | bc

# If >18% growth already, investigate:
# - Memory leak in startup?
# - Background processes consuming?
# - Cache not initializing correctly?
```

### Issue: Cron Job Not Executing

```bash
# Check cron logs
grep CRON /var/log/syslog 2>/dev/null | tail -10

# Verify crontab installed
crontab -l

# Test cron job manually
/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_observe.sh

# Check cron output log
tail -20 /tmp/titane_observe_cron.log
```

### Issue: TITANE Process Crashes

```bash
# Check if still running
ps aux | grep titane-infinity | grep -v grep

# If crashed, check error log
tail -50 /tmp/titane_day1.log | grep -i "panic\|error\|segfault"

# Restart
export TITANE_MEMORY_DIR="/tmp/titane_week1_memory"
nohup /home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/target/release/titane-infinity \
  >> /tmp/titane_day1.log 2>&1 &
```

### Issue: Event Loop Lag Spikes

```bash
# Check lag history
grep -oP 'event_loop_lag_ms,\K[0-9]+' /tmp/titane_production_week1.csv | tail -10

# If sustained >100ms, investigate:
# - Provider timeouts blocking event loop?
# - Cache operations too slow?
# - IPC message flooding?
```

---

## Monitoring Dashboard (Quick Review)

### CSV Status Check (Any Time)

```bash
echo "📊 OBSERVATION STATUS"
echo "================"
wc -l /tmp/titane_production_week1.csv | awk '{print "Samples: " $1-1}'
tail -1 /tmp/titane_production_week1.csv | cut -d',' -f1,3,9,11 | tr ',' '\n' | \
  paste <(echo -e "Timestamp\nRSS (MB)\nLag (ms)\nErrors") - | column -t
CURRENT_RSS=$(tail -1 /tmp/titane_production_week1.csv | cut -d',' -f3)
GROWTH=$(echo "scale=1; ($CURRENT_RSS - 180) / 180 * 100" | bc)
echo "Growth: $GROWTH%"
```

### Health Check

```bash
echo "🏥 HEALTH STATUS"
echo "================"

# Check process
if ps aux | grep -q '[t]itane-infinity'; then
  echo "✅ TITANE running"
else
  echo "❌ TITANE not running - ALERT"
fi

# Check CSV updated within last 2 hours
CSV_AGE=$(( $(date +%s) - $(stat -L --format %Y /tmp/titane_production_week1.csv) ))
if [ $CSV_AGE -lt 7200 ]; then
  echo "✅ CSV updated recently ($((CSV_AGE/60)) min ago)"
else
  echo "⚠️  CSV stale ($((CSV_AGE/3600)) hours)"
fi

# Check current RSS
CURRENT_RSS=$(tail -1 /tmp/titane_production_week1.csv | cut -d',' -f3)
if [ "$CURRENT_RSS" -lt 213 ]; then
  echo "✅ RSS in green zone ($CURRENT_RSS MB)"
elif [ "$CURRENT_RSS" -lt 239 ]; then
  echo "🟡 RSS in yellow zone ($CURRENT_RSS MB)"
else
  echo "🔴 RSS in red zone ($CURRENT_RSS MB) - ESCALATE"
fi
```

---

## Rollback Procedure (If Day 7 FAIL)

### 1. Stop Current Process

```bash
pkill -f titane-infinity
sleep 2
ps aux | grep titane-infinity | grep -v grep || echo "✅ Stopped"
```

### 2. Revert to v27.0.5

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
git checkout v27.0.5
```

### 3. Rebuild Release Binary

```bash
cd src-tauri
cargo build --release 2>&1 | grep -E "(Finished|error)"
```

### 4. Deploy Fallback

```bash
export TITANE_MEMORY_DIR="/tmp/titane_week1_memory_fallback"
mkdir -p "$TITANE_MEMORY_DIR"
nohup /home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/target/release/titane-infinity \
  >> /tmp/titane_fallback.log 2>&1 &
```

### 5. Verify Fallback Stable

```bash
sleep 5
ps aux | grep titane-infinity | grep -v grep
```

### 6. Root Cause Analysis

```bash
# Compare v27.1.0 vs v27.0.5 memory behavior
# Review logs for rapid growth triggers
tail -100 /tmp/titane_week1_memory/debug.log | grep -i "cache\|memory\|alloc"
```

---

## Sign-Off

**Day 1 Activation Complete Checklist:**

- [ ] Infrastructure verified (V26_INFRASTRUCTURE_READY.sh = PASS)
- [ ] v27.1.0 binary deployed and running
- [ ] First observation captured in CSV
- [ ] Initial RSS recorded (_____ MB)
- [ ] Cron job scheduled for hourly observations
- [ ] Day 1 notes populated in PRODUCTION_WEEK1_DAILY_NOTES.md
- [ ] Day 1 notes committed to git
- [ ] Baseline RSS <213 MB confirmed ✅ / ⚠️

**Ready for Days 2-7 monitoring.**

---

## Reference

- **Lab Baseline:** 180 MB initial → 200 MB stable (+11%)
- **Success Threshold:** Final RSS <213 MB (18% growth cap)
- **Fallback Option:** v27.0.5 ready for immediate rollback
- **Observation Window:** 2026-02-23 → 2026-03-01 (7 days)
