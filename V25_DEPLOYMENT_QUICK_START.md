# V25 DEPLOYMENT QUICK START

## 🎯 What's Happening

v27.1.0 released with V24 optimization milestone.  
Starting week-long production observation to validate +11% memory growth lab results in real world.

## 🚀 Deployment (3 steps)

### Step 1: Pull & Build
```bash
git pull origin MAIN
git checkout v27.1.0
cd src-tauri && cargo build --release
# Binary at: target/release/titane-infinity (23 MB)
```

### Step 2: Deploy v27.1.0 Binary
Replace current binary with fresh v27.1.0 build.
```bash
cp src-tauri/target/release/titane-infinity /path/to/deployment/
```

### Step 3: Start Monitoring (Automated)
```bash
# Install hourly collection (cron)
echo "0 * * * * /path/to/scripts/titane_production_observe.sh" | crontab -

# Or run manually for validation:
/path/to/scripts/titane_production_observe.sh
```

## 📊 What Gets Tracked

Every hour:
- RSS memory
- CPU usage
- Session count
- Crashes (if any)
- Provider failovers

**Storage:** `/tmp/titane_production_week1.csv` (< 1 MB total, no overhead)

## 🚨 Alert Thresholds

| Threshold | RSS | Action |
|-----------|-----|--------|
| **🟢 Green** | <213 MB | Normal, continue |
| **🟡 Yellow** | 213-239 MB | Monitor closely, head's up |
| **🔴 Red** | >239 MB | STOP, rollback to v27.0.5 |

## 📅 7-Day Timeline

| Day | Milestone | Check |
|-----|-----------|-------|
| **1** | Stabilization | RSS <220 MB? |
| **3** | Mid-check | Growth rate? |
| **7** | FINAL VERDICT | Plateau held? |

## 🎯 Success Definition

✅ **PASS if:**
- RSS stays <220 MB (≈+22% from 180 MB)
- Growth rate plateaus (not accelerating)
- No unplanned crashes
- Ready for 10% user scaling

❌ **FAIL if:**
- RSS exceeds 239 MB (>22%)
- Crashes detected
- Rapid memory creep observed

## 📋 Post-Week Decision

| Result | Decision |
|--------|----------|
| ✅ PASS | Scale to 10% users, continue 1-week monitoring |
| ⚠️ PARTIAL | Optional Medium Wins Phase (v28.0.0) |
| ❌ FAIL | Rollback to v27.0.5, investigate |

## 👁️ Silent Observation

- No external announcements yet
- Internal monitoring only
- Zero user impact if issues detected
- Pure reality test of lab hypothesis

## 📞 Escalation

**Automated Alerts:**
- RSS >240 MB → Slack alert
- Crash detected → Immediate notification

**Manual Analysis:**
- Day 3: Team sync if issues
- Day 7: Full report + decision

---

**Status:** 🔄 Week 1 monitoring active  
**Release:** v27.1.0 on 2026-02-22  
**Verdict Date:** 2026-03-01 (7 days)
