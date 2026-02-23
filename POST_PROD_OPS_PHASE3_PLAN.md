# POST-PROD OPS — PHASE 3: CONTINUOUS DIFF

**Campaign**: POST-PROD OPS — Continuous Governance After v27.0.5-prod Live Release  
**Date**: 2026-02-23T17:55:30Z  
**Status**: 🟢 **READY TO EXECUTE**

---

## Purpose

After Phase 2 established baseline monitoring metrics, Phase 3 now:
- **Compare** current operational metrics AGAINST Phase 2 baseline
- **Detect** provider availability changes
- **Alert** on UI health deviations (errors, slowdowns, crashes)
- **Track** telemetry drift (CPU, memory, event counts)
- **Update** anomaly detection patterns
- **Report** governance status (stable / warning / critical)

---

## What Phase 3 Does Differently From Phase 2

| Aspect | Phase 2 (Baseline) | Phase 3 (Continuous Diff) |
|--------|-------------------|--------------------------|
| **Goal** | Capture baseline metrics | Compare to baseline, detect deviations |
| **Scope** | Single snapshot | Multiple checks (iterative) |
| **Detection** | Establish patterns | Measure drift from patterns |
| **Thresholds** | None (baseline only) | Set thresholds: WARNING/CRITICAL |
| **Action** | Record data | Report anomalies if drift detected |
| **Duration** | ~4 min single run | ~10 min (3x checks at 3min intervals) |

---

## Phase 3 Structure

### Step 3.1: Health Check Delta #1 (3 minutes)
- Query current provider status
- Compare vs Phase 2 baseline
- Measure: Availability change, latency change
- **Thresholds**:
  - Provider latency: ⚠️ WARNING if > 30ms (baseline: 12ms)
  - Latency: 🔴 CRITICAL if > 50ms
  - Offline provider: ⚠️ OK if deliberate (mock env)
- Export: `PROOF/delta_check_1.json`

### Step 3.2: Conversation Engine Latency Trend (3 minutes)
- Send 5 test messages vs Phase 2 sample
- Measure response time, error rate
- Compare: Current avg latency vs baseline (baseline: 14.5ms)
- **Thresholds**:
  - ⚠️ WARNING if > 25ms (1.7x baseline)
  - 🔴 CRITICAL if > 50ms (3.4x baseline)
- Export: `PROOF/conversation_latency_trend.json`

### Step 3.3: UI Continuous Snapshot #1 (3 minutes)
- Re-capture DOM render time, console errors
- Compare: Load time, hydration, first paint vs Phase 2
- **Thresholds**:
  - ⚠️ WARNING if DOM ready > 2s (baseline: 1.2s)
  - 🔴 CRITICAL if DOM > 3s
  - 🔴 CRITICAL if RED console errors appear (baseline: 0)
- Export: `PROOF/ui_continuous_snapshot_1.html`

### Step 3.4: Telemetry Drift Analysis (3 minutes)
- Re-sample CPU, memory, event counts
- Measure % change vs Phase 2 baseline
- **Thresholds**:
  - ⚠️ WARNING if CPU > 12% (baseline: 8.5%, +40%)
  - ⚠️ WARNING if Memory > 350MB (baseline: 245MB, +43%)
  - 🔴 CRITICAL if CPU > 20%
  - 🔴 CRITICAL if Memory > 500MB
- Export: `PROOF/telemetry_drift_analysis.json`

### Step 3.5: Anomaly Pattern Update (2 minutes)
- Scan new logs for patterns NOT in Phase 2 baseline
- Flag: New error types, new warnings, new slow operations
- Expected: Most anomalies = NOISE (cached, transient)
- Action: Log anomalies, flag if pattern repeats 2+ times
- Export: `PROOF/anomaly_pattern_update.txt`

### Step 3.6: Governance Status Report (1 minute)
- Aggregate Phases 3.1-3.5 into single verdict
- Status: STABLE / WARNING / CRITICAL
- Metrics: # deviations, max % drift, anomalies detected
- Export: `PROOF/governance_status_report.json`

### Step 3.7: Registry Event & Decision (1 minute)
- Log Phase 3 results to append-only registry
- Verdict: Can proceed to Phase 4 Y/N
- If WARNING: Log context, recommendation
- If CRITICAL: Pause, investigate, report
- Export: Phase 3 `VERDICT.md`

---

## Acceptance Criteria

| Criterion | STABLE | WARNING | CRITICAL (STOP) |
|-----------|--------|---------|-----------------|
| Provider latency | ≤ 30ms | 30-50ms | > 50ms |
| Conv. engine latency | ≤ 25ms | 25-50ms | > 50ms |
| UI load time | ≤ 2.0s | 2.0-3.0s | > 3.0s |
| CPU usage | ≤ 12% | 12-20% | > 20% |
| Memory | ≤ 350MB | 350-500MB | > 500MB |
| Console errors | 0 | 0 (warnings OK) | > 0 RED errors |
| Anomaly patterns | < 2 repeats | 2-5 repeats | > 5 or UNKNOWN |

**Verdict**:
- STABLE: All metrics nominal → Proceed to Phase 4
- WARNING: Some elevated but acceptable → Proceed to Phase 4 + monitor closely
- CRITICAL: One or more thresholds exceeded → PAUSE + investigate

---

## Timeline

- **Total Phase 3**: ~13 minutes
  - Health check delta: 3 min
  - Conversation latency: 3 min
  - UI snapshot: 3 min
  - Telemetry drift: 3 min
  - Pattern update: 2 min
  - Report: 1 min

---

## Outputs

**Run Pack Location**: `runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_<TIMESTAMP>/`

```
PROOF/
├── delta_check_1.json                 ← Provider availability vs baseline
├── conversation_latency_trend.json    ← Response time measurements
├── ui_continuous_snapshot_1.html      ← DOM/rendering metrics
├── telemetry_drift_analysis.json      ← CPU/memory/event trends
├── anomaly_pattern_update.txt         ← New error patterns
├── governance_status_report.json      ← Aggregate verdict
└── continuous_diff_summary.txt        ← Human-readable summary

VERDICT.md                             ← Phase 3 outcome (STABLE/WARNING/CRITICAL)
CHANGES.md                             ← Deviations from baseline logged
```

---

## Success Criteria for Phase 3

### For PASS (STABLE):
- ✅ All metrics within normal range vs Phase 2 baseline
- ✅ Provider latency < 30ms (baseline: 12ms)
- ✅ Conversation engine < 25ms (baseline: 14.5ms)
- ✅ UI load < 2.0s (baseline: 1.2s)
- ✅ CPU < 12% (baseline: 8.5%)
- ✅ Memory < 350MB (baseline: 245MB)
- ✅ No RED console errors
- ✅ Anomalies = NOISE (transient, not repeated)
- → **Can proceed to Phase 4**

### For PROCEED WITH CAUTION (WARNING):
- ⚠️ Some metrics elevated but not critical (e.g., CPU 15%, Memory 380MB)
- ⚠️ A few expected warnings in console
- ⚠️ Some anomalies observed but repeats < 5x
- → **Can proceed to Phase 4 + close monitoring recommended**

### For STOP (CRITICAL):
- 🛑 Provider latency > 50ms OR Ollama/provider crashes
- 🛑 Conversation engine latency > 50ms (3.4x baseline)
- 🛑 UI load > 3s (multiple page loads affected)
- 🛑 CPU > 20% OR Memory > 500MB (resource exhaustion)
- 🛑 RED console error appears (new crash pattern)
- 🛑 Unknown anomaly pattern repeated 5+ times
- → **STOP investigation, root-cause analysis, create incident**

---

## Ready to Execute

When ready, command:
```bash
# Interactive execution
SUPER_PROMPT=2 PHASE=3 bash scripts/e2e/phase-post-prod-ops-continuous-diff.sh

# Or manual sequence:
# 1. Health check delta vs baseline (provider status)
# 2. Conversation engine latency trend (5 messages)
# 3. UI continuous snapshot (DOM capture)
# 4. Telemetry drift (CPU/memory re-sample)
# 5. Anomaly pattern update (scan for new errors)
# 6. Governance status report (verdict)
# 7. Registry update + decision
```

---

**Status**: 🟢 **Phase 3 Ready for Execution**  
**Baseline Reference**: `runs/POST_PROD_OPS_PHASE2_MONITORING_20260223_175200/PROOF/`  
**Expected Outcome**: STABLE baseline maintained, Proceed to Phase 4  
**Next Phase**: Phase 4 (Truth Center) — Canonical state audit
