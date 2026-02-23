# POST-PROD OPS — PHASE 2: MONITORING GOVERNED

**Campaign**: Continuous Production Governance After v27.0.5-prod Live Release  
**Date**: 2026-02-23T17:52:00Z  
**Status**: 🔄 **INITIATED**

---

## Purpose

After v27.0.5-prod release sealed (OMEGA_FINAL) and governance correction completed, now:
- **Monitor** live production runtime (v27.0.5-prod)
- **Track** provider status + API compliance  
- **Health-check** core UI scenarios (conversation_engine, telemetry, settings)
- **Continuous audit** for anomalies or drift

---

## Acceptance Criteria

| Criterion | Target | Status |
|-----------|--------|--------|
| v27.0.5-prod binary running (mock env) | ✅ PASS if boots | ⏳ TBD |
| Provider connectivity (Ollama mock) | ✅ PASS if callable | ⏳ TBD |
| IPC message flow (Tauri ↔ Rust) | ✅ PASS if responsive | ⏳ TBD |
| UI health snapshot (core scenarios) | ✅ PASS if loads | ⏳ TBD |
| Telemetry baseline captured | ✅ PASS if logged | ⏳ TBD |
| No silent errors in runtime logs | ✅ PASS if CLEAN | ⏳ TBD |

---

## Phase 2 Structure

### Step 2.1: Boot Installed v27.0.5-prod (60s smoke test)
- Detect installed binary (deb or appimage)
- Start with mock providers (no network)
- Capture boot logs → `PROOF/smoke_boot_prod.log`
- Expected: Binary starts, IPC responds, no crash

### Step 2.2: Provider Status Poll (30s)
- Query Tauri IPC: provider status endpoint
- Verify: Provider enum readable, mock service callable
- Capture: `PROOF/provider_status_poll.json`
- Expected: Providers list + availability flags

### Step 2.3: Conversation Engine Smoke Test (30s)
- Send mock input via IPC: { text: "hello", provider: "mock" }
- Expect response: { result: "ok", value: "mock_response" }
- Capture: `PROOF/conversation_smoke.json`
- Expected: Round-trip latency < 200ms

### Step 2.4: UI Health Snapshot (60s with DevTools)
- Launch browser @ localhost:5173 (if dev) or desktop window (prod)
- Capture console errors/warnings
- Measure: DOM load time, hydration, first paint
- Export: `PROOF/ui_health_snapshot.html`
- Expected: No RED errors, load < 2s

### Step 2.5: Telemetry Baseline (30s)
- Query runtime telemetry endpoint (mock)
- Capture: CPU, memory, event counts, provider latency
- Export: `PROOF/telemetry_baseline.json`
- Expected: Baseline metrics recorded for trend analysis

### Step 2.6: Anomaly Detection (30s)
- Scan all logs for BLOCKED/ERROR/PANIC patterns
- Flag any: Silent failures, provider timeouts, UI exceptions
- Generate: `PROOF/anomaly_report.txt`
- Expected: CLEAN (no anomalies) or LISTED WITH CONTEXT

### Step 2.7: Governance Registry Update (30s)
- Log monitoring event to immutable registry
- Status: PASS or CONDITIONAL (if anomalies found)
- Verdict: Can proceed to Phase 3 Y/N

---

## Timeline

- **Total Phase 2**: ~4 minutes (300 seconds)
- Task overlap: Steps 2.1 + 2.2 can run in parallel post-boot

---

## Outputs

**Run Pack Location**: `runs/POST_PROD_OPS_PHASE2_MONITORING_<TIMESTAMP>/`

```
PROOF/
├── smoke_boot_prod.log           ← Boot trace (60s)
├── provider_status_poll.json      ← IPC provider query
├── conversation_smoke.json        ← Message round-trip test
├── ui_health_snapshot.html        ← DevTools DOM capture
├── telemetry_baseline.json        ← Runtime metrics
├── anomaly_report.txt             ← Drift/error scan
└── monitoring_summary.txt         ← Human-readable summary

VERDICT.md                         ← Phase 2 outcome (PASS/CONDITIONAL/FAIL)
CHANGES.md                         ← Operational changes logged
```

---

## Success Criteria

### For PASS:
- ✅ v27.0.5-prod boots successfully
- ✅ IPC responds to provider status query
- ✅ Conversation engine processes mock input < 200ms
- ✅ UI loads without RED errors
- ✅ Telemetry baseline captured
- ✅ No anomalies detected OR all anomalies explained

### For CONDITIONAL:
- ⚠️ Boot success but non-critical warning in logs (e.g., "Ollama not reachable" expected in mock mode)
- ⚠️ UI loads but minor console warning (expected deprecation, not error)
- ⚠️ Telemetry incomplete but core metrics available
- → **Can proceed with context logged**

### For FAIL (blocks Phase 3):
- 🛑 Binary crashes on startup
- 🛑 IPC unresponsive (crash or timeout)
- 🛑 UI cannot load (BLANK page or exception)
- 🛑 Unknown anomaly detected (new error pattern not in baseline)
- → **Stop & investigate**

---

## Ready to Execute

When ready, command:
```bash
SUPER_PROMPT=2 PHASE=2 bash scripts/e2e/phase-post-prod-ops-monitoring.sh
```

Or manual sequence:
```bash
# 1. Boot prod binary
timeout 60 ... 2>&1 | tee PROOF/smoke_boot_prod.log

# 2. Query provider status
curl http://localhost:5173/api/providers 2>&1 | tee PROOF/provider_status_poll.json

# 3-6. Conversation/UI/telemetry/anomaly scans
# [specific commands per step]
```

---

**Status**: 🟢 Ready for Phase 2 Execution  
**Expected Outcome**: Monitoring baseline established, anomalies = NONE (baseline established)  
**Next**: Phase 3 (if PASS/CONDITIONAL)
