# Runtime Baseline — Latency (p95) V22

**Status:** V22 Measurement Framework (execution template provided)  
**Date:** 2026-02-22  
**Measurement Target:** Chat pipeline latency (input → response rendered)  

---

## 1. Measurement Objective

**What:** End-to-end chat request latency (p50, p95, p99)

**Scope:**
- Input: User sends chat message via Tauri IPC
- Processing: OMEGA pipeline (10 stages) + AI provider call
- Output: Response rendered in UI

**Target:** p95 < 2000ms (2 seconds)

---

## 2. Measurement Environment

### Prerequisites
- TITANE app running in dev mode (`pnpm run dev:tauri`)
- Ollama provider running locally (default: http://localhost:11434)
- Chat interface ready to accept messages
- Browser DevTools open (Network tab + Console)

### Configuration
- **Provider:** Ollama (local)
- **Model:** Default (usually Llama2 or equivalent, check Ollama settings)
- **Network:** Localhost only (no remote latency factors)
- **System:** Linux (Ubuntu 24.04 LTS)
- **Sample Size:** 100 consecutive requests

---

## 3. Measurement Protocol

### Step 1: Instrument Tauri Command

**File:** `src/services/chat.ts` (or equivalent IPC layer)

**Instrumentation Code:**
```typescript
// Add latency capture to chat send command
const startTime = performance.now();

// Existing chat.send() call
const response = await invoke('chat_send', { message });

const endTime = performance.now();
const latency = endTime - startTime;

// Log for collection
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  message_length: message.length,
  response_length: response.content?.length || 0,
  latency_ms: latency,
  status: 'ok'
}));

return response;
```

### Step 2: Capture Browser Console Output

**Method A (Manual):**
1. Open DevTools Console (F12 → Console tab)
2. Clear console: `console.clear()`
3. Send 100 messages via chat UI (or programmatic loop)
4. Right-click console, "Save as..." → `chat-latency-raw.log`

**Method B (Automated Script):**
```javascript
// Paste in browser console
const measurements = [];
const messageQueue = [
  "Hello TITANE",
  "What time is it?",
  "Tell me about your architecture",
  // ... 97 more messages
];

async function runMeasurement() {
  for (let msg of messageQueue) {
    const startTime = performance.now();
    try {
      const resp = await window.__TITANE__.chat.send(msg);
      const latency = performance.now() - startTime;
      measurements.push({ msg, latency });
      console.log(`[${measurements.length}] ${latency.toFixed(2)}ms`);
    } catch (err) {
      console.error(`Failed: ${err.message}`);
    }
  }
  console.log('DONE. Data:');
  console.log(JSON.stringify(measurements, null, 2));
}

runMeasurement();
```

### Step 3: Parse & Calculate

**Calculation Script (Node.js):**
```bash
# Create parse_latency.js
node -e "
const fs = require('fs');
const text = fs.readFileSync('chat-latency-raw.log', 'utf8');
const logs = text
  .split('\\n')
  .filter(line => line.includes('latency_ms'))
  .map(line => JSON.parse(line.match(/{.*}/)[0]));

const latencies = logs.map(l => l.latency_ms).sort((a, b) => a - b);
const n = latencies.length;

console.log('Latency Distribution (ms):');
console.log('Count:', n);
console.log('Min:', latencies[0]);
console.log('p50:', latencies[Math.floor(n * 0.50)]);
console.log('p95:', latencies[Math.floor(n * 0.95)]);
console.log('p99:', latencies[Math.floor(n * 0.99)]);
console.log('Max:', latencies[n-1]);
console.log('Avg:', (latencies.reduce((a,b)=>a+b) / n).toFixed(2));
"
```

---

## 4. Expected Measurement Results

### Hypothesis (Not Yet Measured)

Based on typical Tauri + Ollama latencies, expected results:

| Metric | Expected (ms) | Note |
|--------|---|---|
| **p50** | 400–600 | Half of requests are fast |
| **p95** | 1200–1800 | 95% complete within this time |
| **p99** | 2000–3000 | Rare slow requests |
| **Avg** | 800–1200 | Mean latency |
| **Min (p0)** | 50–150 | Best-case (empty response or cache hit) |
| **Max (p100)** | 5000+ | Worst-case (model inference bottleneck) |

### Example Output (Template)
```
Latency Distribution (ms):
Count: 100
Min: 87
p50: 545
p95: 1456
p99: 2847
Max: 5021
Avg: 923.45

Result: ✅ p95 = 1456 < 2000 (TARGET MET)
```

---

## 5. Baseline Placeholders (V22)

### Status: MEASUREMENT REQUIRED

**Reason:** App requires interactive session + Ollama running. This baseline report documents the measurement framework for V22-V23. Actual data captured during live testing.

### Planned Execution
- **Timeline:** During first 14 days of Core Engine Track (Phase 1)
- **Owner:** Performance team
- **Gate:** Baseline recorded before any optimizations applied

### Data Collection Log (To Be Updated)

| Date | Min | p50 | p95 | Max | Avg | Notes |
|------|-----|-----|-----|-----|-----|-------|
| (pending) | — | — | — | — | — | Baseline measurement |
| | | | | | | |

---

## 6. Sub-Component Breakdown (Optional Deep Dive)

If p95 exceeds target, drill down by measuring individual OMEGA pipeline stages:

**OMEGA Pipeline Latencies (Estimated):**
```
Stage 1 (Input Validation):        5–10ms
Stage 2 (Context Retrieval):       50–200ms
Stage 3 (Intent + Emotion):        10–50ms
Stage 4 (Prompt Construction):     20–100ms
Stage 5 (AI Generation/Ollama):    500–1500ms ← Major bottleneck
Stage 6 (Post-Processing):         20–100ms
Stage 7 (Validation):              5–20ms
Stage 8 (Response Formatting):     5–10ms
Stage 9 (Memory Store):            10–50ms
Stage 10 (UI Render):              50–300ms
─────────────────────────────────────────────
Total (p95 estimate):              700–2200ms ← Variable by Ollama model
```

**Why Ollama Dominates:** LLM inference inference is inherently slow; latency depends on:
- Model size (Llama2 7B vs 13B vs 70B)
- System resources (CPU, GPU, RAM)
- Provider priority (shared vs dedicated)

---

## 7. Factual Baselines (From Architecture)

### Known Constraints
1. **IPC Overhead:** Tauri IPC adds ~1-5ms per call
2. **Network:** Localhost (Ollama) ≈ 0.1-0.5ms RTT
3. **Serialization:** JSON/MessagePack ≈ 1-5ms
4. **Memory:** UnifiedMemory OS adds ~10-50ms for context retrieval
5. **AI Latency:** Ollama model-dependent (typically 300-2000ms)

### Total Breakdown (Typical)
```
IPC (in) + Network (out) + Ollama (process) + Network (in) + IPC (out) + Render
= 2ms + 0.5ms + 1000ms + 0.5ms + 2ms + 100ms
≈ 1105ms (p95 estimated around 1200-1500ms for typical messages)
```

---

## 8. Measurement Execution Plan (V22-V23)

### Timeline

**V22 (Current):**
- ✅ Define measurement framework (this document)
- ✅ Document OMEGA pipeline stages
- ⏳ Prepare measurement script (latency-measure.js)

**V23 (First 14 days of Core Engine Track):**
- [ ] Run 100 chat requests with Ollama
- [ ] Capture latencies in JSON format
- [ ] Calculate p50/p95/p99
- [ ] Compare to target (<2000ms p95)
- [ ] Record baseline in data collection log

**V24+ (If optimization needed):**
- Profile OMEGA stages individually
- Identify bottleneck (likely Ollama)
- Consider: model switching, caching, batching, async optimizations
- **IMPORTANT:** No optimization until baseline is measured

---

## 9. Success Criteria (for Phase 1 of Core Engine Track)

**Gate 1 (Measurement Complete):**
- [ ] 100 requests captured
- [ ] p50, p95, p99 calculated
- [ ] Baseline log updated (this document)
- [ ] Measurement script committed to repo

**Gate 2 (Decision Point):**
- [ ] If p95 < 2000ms → ✅ Target met, move to other pillars
- [ ] If p95 >= 2000ms → 🟡 Investigate (capture breakdown), plan phase 2

---

## 10. Raw Data Section (To Be Populated)

**Data Format (JSON Lines):**
```json
{"timestamp": "2026-02-22T18:30:00Z", "req_num": 1, "msg_len": 18, "resp_len": 245, "latency_ms": 523, "ollama_model": "llama2"}
{"timestamp": "2026-02-22T18:30:02Z", "req_num": 2, "msg_len": 14, "resp_len": 189, "latency_ms": 612, "ollama_model": "llama2"}
...
(100 entries total)
```

**Status:** Pending live measurement

---

## 11. References

- **CORE_ENGINE_TRACK.md:** Pillar 1 (Pipeline latency p95 < 2000ms)
- **POST_GOVERNANCE_REFOCUS.md:** Context (why latency baseline matters)
- **OMEGA_PIPELINE_v2.md:** Pipeline stage documentation

---

## Conclusion (V22)

**Current State:** Framework defined, awaiting live measurement.

**Next Step:** Execute measurement protocol during Core Engine Track Phase 1 (Week 1-2, 30-90 day roadmap).

**No Optimization:** V22 is measurement-only. Baseline data drives all future decisions.

---

**Document Type:** Measurement baseline framework  
**Status:** TEMPLATE READY (awaiting execution)  
**Owner:** Performance team  
**Last Updated:** 2026-02-22
