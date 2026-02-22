# Runtime Baseline — Endurance (2h Session) V22

**Status:** V22 Measurement Framework (execution awaiting implementation)  
**Date:** 2026-02-22  
**Measurement Target:** Session stability over extended use  

---

## 1. Measurement Objective

**What:** Runtime stability during continuous 2-hour chat session

**Scope:**
- Session duration: 2 hours minimum (120 minutes)
- Activity: Continuous chat (1 message every 1-2 minutes, ~60-80 messages)
- Monitoring: Memory growth, CPU spikes, crashes, reconnects

**Target:** 
- ✅ No crashes (uptime = 100%)
- ✅ Memory growth < 10% over session
- ✅ Consistent latency (no degradation over time)
- ✅ No thread leaks
- ✅ Zero panic logs

---

## 2. Measurement Environment

### Setup
- **App:** TITANE set to dev mode (`pnpm run dev:tauri`)
- **Session Type:** Interactive chat (simulated user, 1 msg per 90s)
- **Provider:** Ollama (localhost)
- **Monitoring:** Browser DevTools + Tauri logs + system metrics
- **Duration:** 120 minutes minimum (7200 seconds)
- **Start Time:** (to be scheduled)

### System Baseline (Before Test)
- **RAM Available:** (to capture at test start)
- **CPU % Idle:** (to capture at test start)
- **Process Count:** (to capture at test start)

---

## 3. Measurement Protocol

### Phase 1: Pre-Test Setup (5 minutes)

**Step 1: Capture System Baseline**
```bash
# Terminal 1: System Monitor
watch -n 5 "free -h && echo '---' && ps aux | grep -E 'titan|titane' | head -5"

# Terminal 2: Process Profiling
top -b -p $(pgrep titane-infinity) > system_baseline.log &

# Application: Fresh start
pnpm run dev:tauri
```

**Step 2: Capture App Baseline (in console)**
```javascript
// At t=0 (test start)
const baseline = {
  timestamp: new Date().toISOString(),
  memory: performance.memory,
  heap_limit: performance.memory.jsHeapSizeLimit,
  heap_used: performance.memory.usedJSHeapSize,
  window_listeners: Object.keys(window).filter(k => k.includes('listen')).length
};
console.log('BASELINE:', JSON.stringify(baseline));
```

### Phase 2: Sustained Chat Session (120 minutes)

**Chat Pattern:**
- **Interval:** 90 seconds between messages
- **Total Messages:** ~80 (120 min ÷ 90 sec × 60 sec ≈ 80 messages)
- **Message Variety:** Mix of short/long queries (5-50 words each)

**Example Script (for automation):**
```javascript
const messages = [
  "Hello TITANE, how are you today?",
  "What is your current memory usage?",
  "Tell me about your architecture",
  "Can you help me with a coding problem?",
  "What time is it right now?",
  // ... repeat or add 75 more messages
];

async function runEnduranceTest() {
  const results = [];
  const startTime = Date.now();
  let msgCount = 0;

  for (let cycle = 0; cycle < 80; cycle++) {
    const msg = messages[cycle % messages.length];
    const sendTime = Date.now();
    
    try {
      const resp = await window.__TITANE__.chat.send(msg);
      const responseTime = Date.now() - sendTime;
      
      results.push({
        cycle,
        time_since_start_ms: Date.now() - startTime,
        message: msg.substring(0, 50),
        response_time_ms: responseTime,
        response_length: resp.content?.length || 0,
        status: 'ok'
      });
      
      console.log(`[${cycle+1}/80] ${responseTime}ms | Elapsed: ${Math.round((Date.now() - startTime)/1000)}s`);
    } catch (err) {
      results.push({
        cycle,
        time_since_start_ms: Date.now() - startTime,
        message: msg.substring(0, 50),
        status: 'error',
        error: err.message
      });
      console.error(`[${cycle+1}] ERROR: ${err.message}`);
    }

    // Wait 90 seconds before next message
    await new Promise(resolve => setTimeout(resolve, 90000));
  }

  console.log('ENDURANCE_TEST_COMPLETE');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

runEnduranceTest();
```

### Phase 3: Monitoring During Test

**Capture Metrics Every 15 Minutes:**

```javascript
// Run in console (every 900 seconds)
setInterval(() => {
  const snapshot = {
    timestamp: new Date().toISOString(),
    elapsed_minutes: Math.round((Date.now() - testStartTime) / 60000),
    memory: performance.memory,
    heap_used_mb: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
    heap_limit_mb: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
    heap_pct: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1)
  };
  console.log('SNAPSHOT_' + snapshot.elapsed_minutes + 'M: ' + JSON.stringify(snapshot));
}, 900000); // Every 15 min
```

**System Monitoring (Terminal):**
```bash
# Monitor CPU, memory, threads every 30 seconds
while true; do
  echo "$(date +%s) $(ps aux | grep titane-infinity | grep -v grep | awk '{print $6, $3}' || echo 'NOT_RUNNING')"
  sleep 30
done > endurance_system_log.txt
```

### Phase 4: Post-Test Analysis (5 minutes)

**Collect Final State:**
```javascript
// At t=120min (test end)
const finalState = {
  timestamp: new Date().toISOString(),
  total_elapsed_ms: Date.now() - testStartTime,
  total_messages_sent: messagesSent,
  total_messages_received: messagesReceived,
  memory_final: performance.memory,
  heap_used_mb_final: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
  memory_growth_mb: ((performance.memory.usedJSHeapSize - initialHeapUsed) / 1024 / 1024).toFixed(2),
  memory_growth_pct: (((performance.memory.usedJSHeapSize - initialHeapUsed) / initialHeapUsed) * 100).toFixed(1),
  error_count: errors.length,
  crash_detected: false // or true if app restarted
};
console.log('FINAL_STATE: ' + JSON.stringify(finalState));
```

---

## 4. Expected Results (Hypothesis)

### Memory Growth Expectations

| Metric | Expected | Notes |
|--------|----------|-------|
| **Initial Heap** | 50–150 MB | After app startup |
| **Heap at 1h** | 60–170 MB | ~10-20 MB growth |
| **Heap at 2h** | 70–190 MB | ~15-40 MB growth total |
| **Memory Growth %** | 5–15% | Target: < 10% |

### Performance Degradation

| Metric | Initial | After 2h | Degradation |
|--------|---------|----------|---|
| **Avg Latency** | ~900 ms | ~900–1100 ms | < 15% expected |
| **p95 Latency** | ~1450 ms | ~1600–1800 ms | < 20% expected |
| **Error Rate** | ~0% | ~0–1% | Acceptable if rare |

### Stability Metrics

| Event | Acceptable | Target |
|-------|-----------|--------|
| **Crashes** | 0 | ✅ 0 |
| **Disconnects** | 0–1 | ✅ ≤ 1 |
| **Panic messages** | 0 | ✅ 0 |
| **Thread leaks** | Check via `ps` | ≤ 100 extra threads |

### Success Criteria

**✅ Test Passes If:**
- [ ] App runs for full 120 minutes without crash
- [ ] Memory growth ≤ 10% (< 15 MB for 150 MB baseline)
- [ ] Latency degradation ≤ 15%
- [ ] Error rate ≤ 1% (≤ 1 failed message out of 80)
- [ ] No panic messages in logs

**🟡 Test Inconclusive If:**
- Memory growth 10–15%
- Latency degradation 15–25%
- 1–3 transient errors

**❌ Test Fails If:**
- App crashes before 2 hours
- Memory growth > 15%
- Latency degradation > 25%
- Error rate > 5%

---

## 5. Data Collection Format (JSON)

### Per-Cycle Entry
```json
{
  "cycle": 0,
  "timestamp": "2026-02-22T19:00:00Z",
  "time_since_start_ms": 0,
  "message": "Hello TITANE, how are you today?",
  "response_time_ms": 523,
  "response_length": 245,
  "status": "ok",
  "heap_used_mb": 95.3,
  "heap_growth_mb": 0.0
}
```

### Snapshot Entry (Every 15 min)
```json
{
  "type": "snapshot",
  "elapsed_minutes": 15,
  "timestamp": "2026-02-22T19:15:00Z",
  "heap_used_mb": 102.5,
  "heap_limit_mb": 2048.0,
  "heap_pct": 5.0,
  "messages_processed": 10,
  "errors_count": 0
}
```

### Final Summary
```json
{
  "type": "summary",
  "test_duration_minutes": 120,
  "messages_sent": 80,
  "messages_received": 79,
  "errors": 1,
  "memory_initial_mb": 95.0,
  "memory_final_mb": 105.5,
  "memory_growth_mb": 10.5,
  "memory_growth_pct": 11.1,
  "avg_latency_ms": 920,
  "p95_latency_ms": 1450,
  "crashes": 0,
  "result": "PASS"
}
```

---

## 6. Baseline Status (V22)

### Current State: FRAMEWORK DEFINED, AWAITING EXECUTION

**Reason:** 2-hour test requires continuous monitoring. Cannot execute in isolated environment.

**Planned Timing:**
- **Window:** Core Engine Track Phase 1 (Week 2-3)
- **Owner:** Runtime/Memory team
- **Dependencies:** Latency baseline must be captured first

### Placeholder Results (To Be Updated)

| Checkpoint | Memory | Latency | Status | Notes |
|---|---|---|---|---|
| t=0 (start) | — | — | — | Baseline measurement pending |
| t=30 min | — | — | — | |
| t=60 min | — | — | — | |
| t=90 min | — | — | — | |
| t=120 min | — | — | — | Final state |

---

## 7. Troubleshooting (During Test)

### If App Crashes
1. Record crash time (exact timestamp)
2. Check system logs: `journalctl -xe` or `dmesg`
3. Check Tauri logs: `~/.config/tauri/` or app logs
4. Note: Test fails (but record data for postmortem)

### If Memory Grows > 15% by 1h
1. Take heap dump: DevTools → Memory → Take snapshot
2. Compare to baseline snapshot
3. Identify retained objects (DevTools Profiler)
4. Continue test to completion (record for analysis)

### If Latency Increases Dramatically
1. Check system CPU: `top -p $(pgrep ollama)`
2. Check if Ollama model evicted from cache
3. Check memory pressure (swap usage)
4. Continue test (note time of spike)

### If Network Disconnects
1. Verify Ollama still running: `curl http://localhost:11434/api/tags`
2. Check network: `ping localhost`
3. Record disconnect time
4. App should reconnect automatically (if not, note as failure)

---

## 8. Success Checkpoint (Phase 1 Gate)

**Gate for V22-V23 Transition:**

- [ ] Measurement framework defined (✅ this document)
- [ ] Endurance test script prepared
- [ ] System baseline captured
- [ ] 2-hour test executed
- [ ] Data collected and analyzed
- [ ] Summary report published

**If All Criteria Met + Results PASS:** Pillar 2 complete, move to Pillar 3

**If Results Fail:** Investigate, document findings, plan Phase 2 improvements

---

## 9. References

- **CORE_ENGINE_TRACK.md:** Pillar 2 (Session uptime ≥ 8h, baseline starts with 2h)
- **POST_GOVERNANCE_REFOCUS.md:** Context (why endurance matters)
- **UnifiedMemory OS:** Memory tier management (STM→MTM→LTM)

---

## 10. Factual Baseline (Known Behavior)

### Memory Architecture (From Code)
- **STM (Short-Term Memory):** ~10 MB (recent messages, ~100 entries)
- **MTM (Mid-Term Memory):** ~20 MB (session context, ~1K entries)
- **LTM (Long-Term Memory):** ~50+ MB (persistent store, grows unbounded)
- **UI State:** ~5 MB (React component state, message history)
- **Cache Layers:** ~10 MB (various caches: AI responses, semantic embeddings)

### Expected Growth Pattern
```
Linear: ~5 MB/hour (message history + memory tier accumulation)
Non-linear: Potential spikes if:
  - LTM indexing/compression runs
  - Garbage collection pauses
  - Memory tier promotion (STM→MTM) batches
```

---

## Conclusion (V22)

**Current State:** Endurance test framework ready; awaiting execution during Core Engine Track Phase 1.

**Next Step:** Schedule 2-hour test slot, prepare monitoring, execute, analyze results.

**Key Promise:** No optimization until baseline `is captured. This measurement drives all memory/stability decisions.

---

**Document Type:** Measurement baseline framework  
**Status:** TEMPLATE READY (awaiting execution)  
**Owner:** Runtime/Memory team  
**Last Updated:** 2026-02-22
