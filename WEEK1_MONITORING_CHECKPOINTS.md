# 📅 Week 1 Monitoring Checkpoints

**Purpose:** Minimal daily go/no-go triggers for Days 1-7  
**Format:** One checkpoint per day, flag-based  
**Review Time:** 2-3 minutes each morning  

---

## Day 1 (2026-02-23) - Launch & Baseline

### Checkpoint: Initial Stabilization

**Success Condition:**
- ✅ TITANE process started without crashes
- ✅ CSV observation running (≥1 sample + header)
- ✅ Initial RSS < 210 MB

**Go/No-Go Criteria:**
```
GO:    Initial RSS 180-210 MB range (matches lab baseline)
       Observation script working
       Cron job scheduled

NO-GO: Initial RSS ≥ 235 MB (anomalous startup)
       Observation script failing
       Process crashes within first hour
```

**Action if NO-GO:** Debug startup, check for background load

**Daily Notes Template:**
```markdown
#### Day 1 (2026-02-23)
- **RAM**: [status] X MB
- **CPU**: [status] X%
- **Lag**: [status] X ms
- **Errors**: [count]
- **Anomalies**: [list or "none"]
```

---

## Day 2 (2026-02-24) - Early Growth Pattern

### Checkpoint: Growth Rate Validation

**Success Condition:**
- ✅ 24 hourly samples collected (86400+ seconds)
- ✅ RSS stable or slightly rising (not accelerating)
- ✅ No unplanned crashes recorded

**Go/No-Go Criteria:**
```
GO:    RSS range 195-215 MB (within ±5% of baseline)
       Linear or flat growth pattern
       Zero crashes

CAUTION: RSS 215-225 MB (early yellow warning)
         Suggest increased monitoring frequency

NO-GO: RSS ≥ 235 MB (exceed 30% growth too early)
       Exponential growth curve detected
       Crash or failover event recorded
```

**Action if CAUTION:** Switch to 30-min sampling (optional), investigate cause

**Action if NO-GO:** Escalate, prepare rollback

---

## Day 3 (2026-02-25) - Mid-Point Analysis

### Checkpoint: Sustained Trend Confirmation

**Success Condition:**
- ✅ 72 samples collected (3-day trend line visible)
- ✅ Growth rate confirmed stable (slope unchanging)
- ✅ No resilience signal spikes

**Go/No-Go Criteria:**
```
GO:    Plateau confirmed (RSS stable ±2 MB for 24+ hours)
       Event loop lag <100 ms average
       Provider timeouts <5/hour
       Error count <5 total

CAUTION: RSS 213-225 MB (trending toward yellow)
         Lag 100-150 ms (elevated but not critical)
         Timeouts 5-10/hour (API strain)

NO-GO: RSS ≥ 235 MB (exceeds growth target)
       Lag >200 ms sustained (event loop blocked)
       Timeouts >15/hour (system struggling)
       Error count >10 (silent failures)
```

**Team Decision Point:** 
- If CAUTION: Schedule optional Deep Dive investigation
- If NO-GO: Initiate rollback planning

**Milestone:** Day 7 success becomes quantifiable at this point

---

## Day 4 (2026-02-26) - Resilience Validation

### Checkpoint: Sustained Stability Under Load

**Success Condition:**
- ✅ 96+ samples (4-day trend solid)
- ✅ No new crash incidents
- ✅ Provider recovery from any timeout events observed
- ✅ RSS plateau holding firm

**Go/No-Go Criteria:**
```
GO:    RSS stable (±1-2 MB variation only, no trending)
       Crash count remains 0
       Failover count ≤1 (acceptable recovery)
       Lag <100 ms average
       Error count <10

CAUTION: Minor resilience spike observed but recovered
         Lag 100-150 ms with recovery trending down
         One unexpected crash but process restarted

NO-GO: Multiple crashes or stuck state
       RSS trending upward (growth not stabilized)
       Unrecovered timeout events (API down)
       Lag >150 ms sustained (event loop congestion)
```

**Optional Decision Point:** 
- Go: Schedule resilience_guard.sh test (Days 5-6)
- Caution: Run resilience test ASAP to validate recovery
- No-Go: Halt testing, focus on stabilization

---

## Day 5 (2026-02-27) - Optional Resilience Stress Test

### Checkpoint: Pre-Verdict Full System Test

**Success Condition (if running resilience_guard.sh):**
- ✅ Provider failure scenario: Recovered cleanly
- ✅ Slow response scenario: No event loop blocking
- ✅ Memory pressure scenario: Graceful degradation

**Go/No-Go Criteria:**
```
GO:    resilience_guard.sh exit code = 0 (PASS)
       Recovery time <30 seconds per scenario
       No process crash during tests
       Memory recovered post-stress

PARTIAL: Exit code = 1 (PARTIAL recovery detected)
         Slow recovery but eventual stability
         Acceptable but monitor closely

NO-GO: Exit code = 2 (CRITICAL failure)
       Test triggered process crash
       No recovery within 60 seconds
       Memory not recovered
```

**Action if GO:** Confidence in production deployment increased

**Action if PARTIAL:** Document scenario, proceed with caution

**Action if NO-GO:** Escalate to Day 7 decision (likely FAIL)

**Note:** Running this test is optional. Skip if RSS/lag/errors already perfect.

---

## Day 6 (2026-02-28) - Final Validation

### Checkpoint: 6-Day Trend Lock

**Success Condition:**
- ✅ 144+ samples (6-day comprehensive history)
- ✅ Trend line mathematically confirmed stable
- ✅ All resilience metrics green
- ✅ No surprises in past 24 hours

**Go/No-Go Criteria:**
```
GO:    RSS plateau locked ±1-2 MB range for full 24 hours
       Final projected RSS at Day 7: <213 MB
       Zero new crashes or incidents
       All metrics within green zone

CAUTION: RSS within green but slightly elevated (208-213 MB)
         One minor incident but fully recovered
         All metrics acceptable

NO-GO: Any metric breached (Red zone triggers)
       Trend still changing (not stabilized)
       Crash or failover within last 24 hours
```

**Final Check:** Mathematically confirm PASS vs PARTIAL/FAIL verdict using final 24h data

---

## Day 7 (2026-03-01) - Final Verdict & Decision

### Checkpoint: Observation Window Complete

**Steps:**

1. **Run analysis script (5 min):**
   ```bash
   /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/titane_production_analyze.sh
   cat /tmp/titane_week1_verdict.txt
   ```

2. **Evaluate finale conditions (2 min):**
   - Final RSS value
   - Growth percentage from baseline (180 MB)
   - Crash count (must be 0)
   - Max lag value (must average <100 ms)
   - Provider timeout rate (must be <5/hour)
   - Error count (must be <10 total)

3. **Make Decision (1 min):**

   **PASS (All 5 criteria met):**
   ```
   ✅ Final RSS <213 MB
   ✅ No unplanned crashes
   ✅ Avg lag <100 ms
   ✅ Timeouts <5/hour
   ✅ Errors <10 total
   
   → Deploy v27.1.0 to 10% production users immediately
   → Continue monitoring for 1 additional week
   → Prepare gradual rollout schedule
   ```

   **PARTIAL (2-3 criteria met, none critical):**
   ```
   🟡 Some metrics yellow but acceptable
   
   → Decision options:
     A) Deploy v27.1.0 with increased monitoring
     B) Launch optional Medium Wins phase (v28.0.0)
     C) Investigate cause, extend observation 3 days
   
   → Requires team discussion & stakeholder approval
   ```

   **FAIL (1+ critical criteria failed):**
   ```
   🔴 RSS >239 MB, OR multiple crashes, OR lag >300ms, OR unrecoverable errors
   
   → Immediate rollback to v27.0.5
   → Root cause analysis required
   → Review optimization strategy
   → Plan iteration (v28 with different approach)
   ```

---

## Daily Signals Quick Reference

### Green Zone (Proceed)

| Metric | Range | Status |
|--------|-------|--------|
| RSS | <213 MB | ✅ Optimal |
| CPU | <20% | ✅ Normal |
| Lag | <100 ms | ✅ Responsive |
| Crashes | 0 | ✅ Stable |
| Errors | <10/day | ✅ Clean |
| Timeouts | <5/hour | ✅ API OK |

### Yellow Zone (Caution)

| Metric | Range | Status |
|--------|-------|--------|
| RSS | 213-239 MB | 🟡 Investigate |
| CPU | 20-40% | 🟡 Elevated |
| Lag | 100-200 ms | 🟡 Lagging |
| Crashes | 1 | 🟡 Watch |
| Errors | 10-20/day | 🟡 Signals |
| Timeouts | 5-15/hour | 🟡 API stress |

### Red Zone (Escalate)

| Metric | Range | Status |
|--------|-------|--------|
| RSS | >239 MB | 🔴 Rollback |
| CPU | >40% | 🔴 Overload |
| Lag | >200 ms | 🔴 Blocked |
| Crashes | >1 | 🔴 Unstable |
| Errors | >20/day | 🔴 Failing |
| Timeouts | >15/hour | 🔴 Down |

---

## Daily Checklist Template

**Copy this into PRODUCTION_WEEK1_DAILY_NOTES.md for each day:**

```markdown
#### Day N (YYYY-MM-DD)

**Morning Review (2 min):**
- [ ] Ran v26_daily_check.sh
- [ ] Reviewed CSV latest entry
- [ ] Checked for anomalies

**Metrics:**
- **RAM**: [OK/CAUTION/RED] X MB (growth: Y%)
- **CPU**: [OK/CAUTION/RED] Z%
- **Lag**: [OK/CAUTION/RED] A ms
- **Errors**: [count] detected
- **Crashes**: [count] recorded

**Anomalies Detected:** [list or "none"]

**Action Taken:** [if any]

**Go/No-Go Status:** [GO / CAUTION / ESCALATE]

**Next Day Note:** [if any concerns for tomorrow]
```

---

## Weekly Summary (Day 7)

After verdict is rendered:

```markdown
#### Week 1 Summary (2026-02-23 → 2026-03-01)

**Final Metrics:**
- Initial RSS: 180 MB
- Final RSS: X MB
- Growth: Y%
- Days without crash: 7 of 7
- Max lag observed: A ms
- Total errors: B
- Total timeouts: C hours

**Verdict:** [PASS / PARTIAL / FAIL]

**Decision:** [Deployment decision made]

**Next Phase:** [Monitoring plan, rollout schedule, or investigation]
```

---

## Monitoring Frequency by Day

| Phase | Frequency | Tool |
|-------|-----------|------|
| Days 1-2 | Every hour (auto) + 2x daily manual check | cron + v26_daily_check.sh |
| Days 3-4 | Every hour (auto) + 1x daily manual check | cron + v26_daily_check.sh |
| Days 5-6 | Every hour (auto) + 1x daily manual check | cron + resilience_guard.sh (optional) |
| Day 7 | 1x final analysis | titane_production_analyze.sh |

---

## Emergency Escalation

**If at ANY point RSS exceeds 239 MB:**

```bash
# 1. STOP PRODUCTION
pkill -f titane-infinity

# 2. ALERT TEAM
echo "🔴 RED ZONE EXCEEDED - EMERGENCY ESCALATION"

# 3. INITIATE ROLLBACK
git checkout v27.0.5
cd src-tauri && cargo build --release

# 4. RESUME FALLBACK
export TITANE_MEMORY_DIR="/tmp/titane_fallback"
nohup ./target/release/titane-infinity >> /tmp/fallback.log 2>&1 &

# 5. DOCUMENT INCIDENT
# Create incident report with timestamp and screenshots
```

---

## Success Definition

**Week 1 is SUCCESSFUL if Day 7 verdict = PASS**

**PASS means:**
1. All 5 success criteria met
2. Lab baseline confirmed reproducible in production
3. v27.1.0 optimization = production-validated
4. Ready for 10% user rollout
5. Monitoring extended 1 more week at 10%

**PASS result:** v27.1.0 graduates to production, begin gradual 10% → 25% → 50% → 100% rollout.

---

## Reference Thresholds

**Locked pre-deployment (no changes during observation):**

- Green: <213 MB (≤18% from 180 MB)
- Yellow: 213-239 MB (18-22% from 180 MB)
- Red: >239 MB (>22% from 180 MB)
