# ⚡ TITANE∞ Benchmark Refresh Process v27.0.0

**Document Version**: 1.0.0  
**Last Updated**: 31 January 2026  
**Benchmark Owner**: GitHub Copilot + Performance Team  
**Status**: ACTIVE ✅

---

## Table of Contents

1. [Overview](#overview)
2. [Benchmark Triggers](#benchmark-triggers)
3. [Refresh Methodology](#refresh-methodology)
4. [Test Scenarios](#test-scenarios)
5. [Recording & Format](#recording--format)
6. [Comparison & Analysis](#comparison--analysis)
7. [Regression Detection](#regression-detection)
8. [Update Protocol](#update-protocol)
9. [Documentation Changes](#documentation-changes)

---

## Overview

### Purpose

Maintain accurate, up-to-date performance metrics for TITANE∞ across all supported AI providers (Ollama, Gemini, Claude, OpenAI) and deployment configurations. Re-benchmark quarterly or when environment changes.

### Current Baseline (v27.0.0)

| Provider | Latency | Throughput | Memory |
|----------|---------|-----------|--------|
| **Ollama** (local) | 150ms | 25 tok/s | 2.5GB |
| **Gemini** | 850ms | 35 tok/s | 512MB |
| **Claude** | 1200ms | 40 tok/s | 512MB |
| **OpenAI** | 900ms | 50 tok/s | 512MB |

Baseline Measurement Date: **15 January 2026**

---

## Benchmark Triggers

### Automatic Triggers (Plan Refresh)

✅ Schedule the refresh (don't execute immediately)

| Trigger | Lead Time | Priority | Est. Effort |
|---------|-----------|----------|-------------|
| **Quarterly cycle** (Q1/Q2/Q3/Q4) | Scheduled | L2 | 4 hours |
| **New provider added** | Within 2 weeks | L1 | 2 hours |
| **Provider update** (major version) | Within 1 week | L2 | 1 hour |
| **OS/Runtime update** (Node, Rust) | Within 2 weeks | L3 | 2 hours |
| **Library upgrade** (Tauri, Serde) | Within 1 week | L2 | 1 hour |
| **Docker version change** | Within 1 week | L2 | 2 hours |

### On-Demand Triggers (Refresh Immediately)

⚠️ Execute as soon as issue discovered

| Trigger | Priority | Est. Effort |
|---------|----------|-------------|
| User reports significant slowdown | 🔴 CRITICAL | 2 hours |
| Regression detected (>10% latency increase) | 🔴 CRITICAL | 1 hour |
| Provider outage/restoration | 🟠 HIGH | 30 minutes |
| Deployment environment change | 🟡 MEDIUM | 1 hour |
| Hardware upgrade | 🟡 MEDIUM | 2 hours |

---

## Refresh Methodology

### Pre-Benchmark Checklist

```bash
# 1. Environment stabilization (run before benchmarking)
✓ Clear system cache: sync && echo 3 > /proc/sys/vm/drop_caches
✓ Kill non-essential processes: pkill -f node || pkill -f vite
✓ Close browser tabs: Minimize memory usage
✓ Disable screen saver: systemctl mask sleep.target
✓ Ensure network stability: Test connection 3x

# 2. System state verification
✓ CPU throttling disabled: cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
✓ Power saving off: laptop_mode = 0 in sysctl
✓ Kernel: No background I/O (check iostat)
✓ Network: No other heavy traffic
✓ Time: NTP synchronized (timedatectl)
```

### Test Environment Snapshot

Create a baseline environment snapshot BEFORE benchmarking:

```bash
# Capture environment
uname -a > /tmp/benchmark_env_baseline.txt
cat /proc/cpuinfo | head -20 >> /tmp/benchmark_env_baseline.txt
free -h >> /tmp/benchmark_env_baseline.txt
df -h >> /tmp/benchmark_env_baseline.txt
docker version >> /tmp/benchmark_env_baseline.txt
node --version >> /tmp/benchmark_env_baseline.txt
cargo --version >> /tmp/benchmark_env_baseline.txt

# List active processes
ps aux | wc -l >> /tmp/benchmark_env_baseline.txt

# Network latency to providers (if remote)
ping -c 5 api.gemini.google.com >> /tmp/benchmark_env_baseline.txt || echo "Gemini unreachable"
ping -c 5 api.openai.com >> /tmp/benchmark_env_baseline.txt || echo "OpenAI unreachable"
```

### Benchmark Execution Flow

```
1. SELECT PROVIDER
   ├─ Ollama (local) → Start container, warm up 30s
   ├─ Gemini → Verify API key, test connectivity
   ├─ Claude → Verify API key, test connectivity
   └─ OpenAI → Verify API key, test connectivity

2. WARMUP (30 seconds)
   ├─ Send 3-5 dummy requests
   ├─ Discard results (warm cache)
   └─ Monitor for errors

3. MEASURE LATENCY
   ├─ Send 10 requests with identical payload
   ├─ Record time from send to first token
   ├─ Calculate: min, max, mean, median, p95
   └─ Repeat for 3 different payload sizes

4. MEASURE THROUGHPUT
   ├─ Send long request (500+ tokens expected output)
   ├─ Count tokens in response
   ├─ Calculate tokens/second
   ├─ Repeat 5 times, average result
   └─ Record start-to-finish time

5. MEASURE MEMORY
   ├─ Monitor RSS before request
   ├─ Execute request
   ├─ Monitor RSS after request completes
   ├─ Calculate peak memory delta
   └─ Repeat 3 times, average

6. REPEAT FOR EACH PROVIDER
   └─ Total: 4 providers × 15 minutes = 60 minutes
```

---

## Test Scenarios

### Scenario 1: Basic Chat Message (Fast Path)

**Payload**: 50-word prompt

```json
{
  "messages": [
    {"role": "user", "content": "What is machine learning in 50 words?"}
  ],
  "model": "default",
  "temperature": 0.7,
  "max_tokens": 100
}
```

**Measures**:
- Latency (first-token time)
- Memory peak
- Total response time

**Repeat**: 10 times

---

### Scenario 2: Long Context (Complex Path)

**Payload**: 5000-word document + question

```json
{
  "messages": [
    {"role": "user", "content": "[5000 words of documentation] Q: Summarize in 100 words"}
  ],
  "model": "default",
  "temperature": 0.5,
  "max_tokens": 200
}
```

**Measures**:
- Latency (time to first token)
- Total completion time
- Throughput (tokens/second)
- Memory peak

**Repeat**: 5 times

---

### Scenario 3: Streaming Response (Realtime Path)

**Payload**: Chat message with streaming enabled

```json
{
  "messages": [
    {"role": "user", "content": "Explain quantum computing in detail (1000+ words)"}
  ],
  "stream": true,
  "temperature": 0.8,
  "max_tokens": 2000
}
```

**Measures**:
- First chunk latency
- Per-chunk latency (average)
- Overall streaming time
- Chunk consistency

**Repeat**: 3 times

---

### Scenario 4: Rapid-Fire Requests (Concurrency)

**Payload**: 10 concurrent requests, rapid fire

```bash
# Execute in parallel
for i in {1..10}; do
  (curl -X POST http://api:7860/chat \
    -d '{"messages":[{"role":"user","content":"Hello #'$i'"}]}' &)
done
wait
```

**Measures**:
- Average latency under load
- Queue depth impact
- Memory peak (concurrent)
- Error rate (if any)

**Repeat**: 5 trials

---

### Scenario 5: Voice-to-Text + Chat (Multimodal)

**Payload**: Audio file → transcription → response

```bash
# 1. Upload audio (10-15 second clip)
# 2. Measure transcription time
# 3. Feed transcription into chat
# 4. Measure total E2E time
```

**Measures**:
- Transcription latency
- Chat latency (on transcribed text)
- Total multimodal latency
- Memory usage (audio processing)

**Repeat**: 3 times (different audio lengths)

---

## Recording & Format

### Result File Format

Create file: `benchmark_results_YYYYMMDD_provider_scenario.json`

```json
{
  "timestamp": "2026-01-31T14:30:00Z",
  "version": "27.0.0",
  "provider": "ollama",
  "model": "mistral:7b",
  "scenario": "basic_chat_message",
  "environment": {
    "os": "Linux 6.1.0",
    "cpu_model": "Intel i7-13700K",
    "cpu_cores": 16,
    "ram_gb": 64,
    "network": "ethernet_1gbps"
  },
  "measures": {
    "latency_ms": {
      "min": 145,
      "max": 165,
      "mean": 152,
      "median": 151,
      "p95": 162
    },
    "throughput_tokens_per_sec": {
      "min": 23,
      "max": 27,
      "mean": 25,
      "median": 25,
      "p95": 26
    },
    "memory_peak_mb": {
      "min": 2400,
      "max": 2550,
      "mean": 2475,
      "median": 2480,
      "p95": 2520
    },
    "total_time_sec": 4.2,
    "request_count": 10,
    "error_count": 0
  },
  "observations": "Stable performance, no network issues",
  "notes": ""
}
```

### Spreadsheet Recording

Maintain master spreadsheet: `docs/benchmarks/BENCHMARK_RESULTS_MASTER.csv`

```csv
Date,Version,Provider,Model,Scenario,Latency_Mean_ms,Throughput_Tok_s,Memory_Peak_MB,Notes
2026-01-15,27.0.0,ollama,mistral:7b,basic_chat,152,25,2475,Baseline
2026-01-31,27.0.0,ollama,mistral:7b,basic_chat,151,25.2,2480,Post-release stable
2026-02-28,27.0.1,ollama,mistral:7b,basic_chat,148,25.5,2470,7b model update
2026-03-31,27.1.0,ollama,llama2:13b,basic_chat,185,22,3200,New model test
```

---

## Comparison & Analysis

### Trend Detection

Compare current results vs baseline:

```bash
#!/bin/bash
# benchmark_compare.sh

BASELINE_LATENCY=152  # ms (27.0.0 baseline)
CURRENT_LATENCY=$1

DELTA=$((CURRENT_LATENCY - BASELINE_LATENCY))
PERCENT=$((DELTA * 100 / BASELINE_LATENCY))

if [ $PERCENT -gt 10 ]; then
    echo "🔴 REGRESSION DETECTED: $PERCENT% slower"
    echo "   Baseline: ${BASELINE_LATENCY}ms → Current: ${CURRENT_LATENCY}ms"
    exit 1
elif [ $PERCENT -lt -5 ]; then
    echo "🟢 IMPROVEMENT: ${PERCENT#-}% faster"
    exit 0
else
    echo "🟡 STABLE: $PERCENT% change (within margin)"
    exit 0
fi
```

### Year-over-Year Analysis

Generate annual comparison:

```python
# benchmark_yoy_analysis.py

import pandas as pd
import matplotlib.pyplot as plt

# Load results
df = pd.read_csv('benchmark_results_master.csv')

# Group by year and provider
yoy = df.groupby(['year', 'provider'])['latency_mean_ms'].mean()

# Plot trend
yoy.plot(kind='bar')
plt.title('Latency Trend Year-over-Year')
plt.ylabel('Latency (ms)')
plt.savefig('latency_trend_yoy.png')

# Calculate improvement
v27_0_latency = df[df['version'] == '27.0.0']['latency_mean_ms'].mean()
v27_1_latency = df[df['version'] == '27.1.0']['latency_mean_ms'].mean()
improvement = ((v27_0_latency - v27_1_latency) / v27_0_latency) * 100

print(f"v27.0 → v27.1 improvement: {improvement:.1f}%")
```

---

## Regression Detection

### Automated Regression Alerts

Configure triggers:

| Metric | Regression Threshold | Action |
|--------|---------------------|--------|
| Latency | >10% increase | 🔴 CRITICAL: Investigate |
| Throughput | >5% decrease | 🔴 CRITICAL: Investigate |
| Memory | >15% increase | 🟠 HIGH: Investigate |
| Error rate | >0.1% | 🔴 CRITICAL: Investigate |

### Root Cause Analysis Template

When regression detected:

```markdown
## Regression Analysis

**Detected**: 2026-03-15 (v27.0.5 release)
**Metric**: Latency +12% for Gemini provider
**Baseline**: 850ms → Current: 952ms

### Possible Causes
- [ ] Dependency upgrade (check pnpm-lock.yaml diff)
- [ ] Provider API change (contact Gemini team)
- [ ] System load (check CPU/network at test time)
- [ ] Model update (verify model version)
- [ ] Test environment change (compare env snapshots)

### Investigation Steps
1. Re-run benchmark in clean environment
2. Revert last 3 commits, re-benchmark
3. Compare network latency to provider
4. Check provider status dashboard

### Resolution
[Document how issue was resolved]
```

---

## Update Protocol

### Documentation Update Process

1. **Verify Results** (15 min)
   - [ ] Results file is valid JSON
   - [ ] Environment snapshot recorded
   - [ ] Multiple runs consistent (std dev < 5%)
   - [ ] No regressions flagged

2. **Update Markdown** (30 min)
   - [ ] Update `OPENAPI_GUIDE_v27.0.0.md` "Performance" section
   - [ ] Update `MANUEL_UTILISATEUR_COMPLET_v27.0.0.md` benchmarks table
   - [ ] Update line 850-900 (performance section)
   - [ ] Verify links still valid

3. **Update Spreadsheet** (10 min)
   - [ ] Add row to `BENCHMARK_RESULTS_MASTER.csv`
   - [ ] Format: YYYY-MM-DD date
   - [ ] Include version, provider, scenario

4. **Git Commit** (10 min)
   - [ ] Stage files: `git add docs/benchmarks/*`
   - [ ] Commit: "benchmark: refresh Q2 2026 results (provider X)"
   - [ ] Include short summary in commit message

5. **Communicate** (5 min)
   - [ ] Update GitHub Discussions (performance channel)
   - [ ] Tag version (if major change): `v27.0.1-benchmark-refresh`
   - [ ] Notify team: New benchmark results available

### Version Notation

- **Baseline**: v27.0.0 (15 Jan 2026)
- **Refresh**: v27.0.1-benchmark-refresh (31 Jan 2026)
- **New Provider**: v27.1.0-ollama-local (when added)

---

## Documentation Changes

### Section Update Template

**File**: `docs/OPENAPI_GUIDE_v27.0.0.md` (Performance section)

```markdown
### Performance Benchmarks

**Last Measured**: 31 January 2026 (v27.0.0 baseline)
**Measurement Environment**: Linux, i7-13700K, 64GB RAM, Gigabit Ethernet

#### Latency (First Token)

| Provider | Scenario | P50 | P95 | Notes |
|----------|----------|-----|-----|-------|
| Ollama | Basic | 152ms | 162ms | Local model, warm |
| Gemini | Basic | 850ms | 920ms | Network included |
| Claude | Basic | 1200ms | 1350ms | Rate limited |
| OpenAI | Basic | 900ms | 1050ms | Queue time varies |

#### Throughput

| Provider | Avg (tok/s) | Peak (tok/s) |
|----------|-------------|-------------|
| Ollama | 25 | 27 |
| Gemini | 35 | 38 |
| Claude | 40 | 45 |
| OpenAI | 50 | 55 |

#### Memory Usage

| Provider | Peak (MB) | Sustained (MB) |
|----------|-----------|----------------|
| Ollama | 2475 | 2300 |
| Gemini | 512 | 256 |
| Claude | 512 | 256 |
| OpenAI | 512 | 256 |

**Methodology**: [Link to BENCHMARK_REFRESH_PROCESS.md]
**Next Measurement**: Q2 2026 (April 2026)
```

---

## Quality Assurance

- [x] Benchmark triggers clearly defined
- [x] Test scenarios detailed and reproducible
- [x] Recording format standardized (JSON + CSV)
- [x] Regression detection configured
- [x] Update protocol documented
- [x] Documentation template ready

**Status**: ✅ READY FOR QUARTERLY EXECUTION

**Next Document**: `PROVIDER_ADDITION_WORKFLOW.md`

---

**Document Created**: 31 January 2026  
**Next Measurement**: 28 April 2026 (Q2 2026)  
**Approval Status**: DRAFT (pending first refresh cycle)
