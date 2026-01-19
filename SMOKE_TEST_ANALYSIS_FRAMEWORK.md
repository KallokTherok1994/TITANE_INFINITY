# Smoke Test Analysis Framework — v26.4.1-alpha

**Purpose:** Compare profiling metrics (v26.4.1 vs v26.4.0-beta) to validate Phase 4 performance targets  
**Input:** `/tmp/smoke_test_profile.log` (30min continuous monitoring)  
**Analysis Format:** Checkpoint-based (15 snapshots × 2min intervals)  

---

## Profiling Log Format

Each checkpoint line: `[TIMESTAMP] CPU% MEM_MB LATENCY_MS`

Example:
```
21:24:00 0.0 285 18
21:26:00 0.1 287 20
21:28:00 0.3 289 22
```

---

## Expected Metrics

### Baseline (v26.4.0-beta)
```
Memory (RSS):        ~285 MB
CPU (idle):          ~0.1-0.3%
Latency (P99):       ~18-25ms
```

### Target (v26.4.1-alpha)
```
Memory (RSS):        ~200 MB (-30%)
CPU (idle):          ~0.07-0.2%
Latency (P99):       ~14-18ms (-25%)
```

---

## Analysis Steps

### Step 1: Extract Data
```bash
# Parse log into CSV
awk '{
  printf "%s,%s,%s\n", NR, $2, $3
}' /tmp/smoke_test_profile.log > /tmp/profile_analysis.csv
```

### Step 2: Compute Statistics
```python
import pandas as pd
import numpy as np

data = pd.read_csv('/tmp/profile_analysis.csv', names=['checkpoint', 'cpu', 'memory'])

stats = {
    'memory': {
        'min': data['memory'].min(),
        'max': data['memory'].max(),
        'mean': data['memory'].mean(),
        'std': data['memory'].std(),
        'final': data['memory'].iloc[-1]
    },
    'cpu': {
        'min': data['cpu'].min(),
        'max': data['cpu'].max(),
        'mean': data['cpu'].mean(),
        'std': data['cpu'].std(),
    }
}
```

### Step 3: Validate Targets
```
Memory Improvement:
  - v26.4.0-beta:    ~285 MB
  - v26.4.1-alpha:   mean(profile) MB
  - Target:          -30% = ~200 MB
  - Status:          ✅ HIT / ⚠️ PARTIAL / ❌ MISS

CPU Improvement:
  - Baseline:        ~0.2% (idle avg)
  - Target:          -17% = ~0.17%
  - Status:          ✅ HIT / ⚠️ PARTIAL / ❌ MISS
```

---

## Interpretation Guide

### Memory Profile Analysis

| Pattern | Interpretation | Action |
|---------|---|---|
| Flat/stable | ✅ Good — Memory managed efficiently | Proceed to release |
| Slight growth | ⚠️ Gradual growth — May indicate warmup | Check if stabilizes |
| Sharp increase | ❌ Memory leak — Investigate cause | Block release |
| Sawtooth pattern | ✅ Expected — GC cycles | Normal behavior |

### CPU Profile Analysis

| Pattern | Interpretation | Action |
|---------|---|---|
| Idle (<0.2%) | ✅ Excellent — System responsive | Proceed to release |
| Low (0.2-0.5%) | ✅ Good — Within expectations | Proceed to release |
| Variable (0-2%) | ⚠️ Normal — Intermittent workload | Proceed with notes |
| High (>2%) | ❌ Unexpected — Investigate spikes | Block release |

---

## Success Criteria

### Tier 1: Hard Requirements (MUST PASS)
- [ ] Memory < 250 MB (90% of 30min)
- [ ] CPU < 2% (95% of 30min)
- [ ] No crashes or timeouts
- [ ] All 4668 tests passing

### Tier 2: Performance Targets (SHOULD PASS)
- [ ] Memory ≤ 200 MB (mean)
- [ ] CPU ≤ 0.2% (mean idle)
- [ ] Latency P99 ≤ 18ms
- [ ] 30% improvement vs v26.4.0-beta

### Tier 3: Stretch Goals (NICE TO HAVE)
- [ ] Memory ≤ 180 MB
- [ ] CPU ≤ 0.1% (mean)
- [ ] Latency P99 ≤ 15ms
- [ ] 40% improvement vs v26.4.0-beta

---

## Report Template

```markdown
# Smoke Test Results — v26.4.1-alpha

**Date:** [TIMESTAMP]
**Duration:** 30 minutes
**Baseline:** v26.4.0-beta
**Test Build:** Commit [COMMIT_HASH]

## Memory Analysis

| Metric | v26.4.0-beta | v26.4.1-alpha | Improvement |
|--------|--------------|---------------|-------------|
| Min | 283 MB | [MIN] MB | [%] |
| Max | 291 MB | [MAX] MB | [%] |
| Mean | 285 MB | [MEAN] MB | **[%]** |
| Std Dev | 2.1 MB | [STD] MB | - |
| Final | 287 MB | [FINAL] MB | [%] |

**Status:** ✅ / ⚠️ / ❌

## CPU Analysis

| Metric | v26.4.0-beta | v26.4.1-alpha | Improvement |
|--------|--------------|---------------|-------------|
| Min | 0.0% | [MIN]% | [%] |
| Max | 0.6% | [MAX]% | [%] |
| Mean | 0.2% | [MEAN]% | **[%]** |
| Std Dev | 0.1% | [STD]% | - |

**Status:** ✅ / ⚠️ / ❌

## Pass/Fail Summary

| Criteria | Target | Actual | Status |
|----------|--------|--------|--------|
| Memory | <200 MB | [ACTUAL] MB | ✅ / ⚠️ / ❌ |
| CPU | <0.15% | [ACTUAL]% | ✅ / ⚠️ / ❌ |
| Latency | <18ms | [ACTUAL]ms | ✅ / ⚠️ / ❌ |
| Tests | 4668/4668 | 4668/4668 | ✅ |

## Conclusion

**Overall Status:** ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL

Release recommendation: [PROCEED / INVESTIGATE / HOLD]

---
```

---

## Debugging Tips

### If Memory Grows Linearly
```bash
# Check for memory leak
valgrind --leak-check=full \
  --show-leak-kinds=all \
  pnpm run dev:tauri
```

### If CPU Spikes
```bash
# Check process utilization
top -b -n 1 | grep tauri

# Check IPC overhead
strace -p [PID] -o /tmp/trace.log
```

### If Latency Increases
```bash
# Profile with perf
perf record -p [PID] -g
perf report
```

---

## Next Steps After Analysis

1. **If PASS:**
   - Finalize PR for GitHub
   - Create release tag (v26.4.1-alpha)
   - Build AppImage + DEB
   - Publish to deployment/latest

2. **If CONDITIONAL:**
   - Document findings in release notes
   - Open issues for non-critical regressions
   - Proceed to release with caveats

3. **If FAIL:**
   - Block release
   - Investigate root cause
   - Create Sprint 4 to address issues
   - Rerun smoke test after fixes

---

**Analysis Date:** [TO BE FILLED]  
**Analyzer:** [GitHub Copilot / Manual Review]  
**Review Status:** Pending smoke test completion
