# TITANE V24 Action Board — Week 1 Optimization Sprint

**Sprint:** Phase 2 Week 1: Quick Wins  
**Start Date:** 2026-02-22  
**End Date:** 2026-02-28  
**Status:** READY TO EXECUTE  

---

## Sprint Goal

**Reduce memory growth from +27% (baseline) to <15% (target) in 2-hour session**

**Success Criteria:**
- ✅ STM Limiter implemented & tested
- ✅ Response Streaming implemented & tested
- ✅ Cache Eviction Policy implemented & tested
- ✅ 2-hour endurance test post-optimization shows <15% memory growth
- ✅ Latency p95 unchanged (still <2000ms)
- ✅ Zero crashes or regressions

**Expected Outcome:** +8-10% memory reduction (27% → 17-19%)

---

## 📋 Task Breakdown (Parallel Tracks)

### Track A: STM Size Limiter (4 hours)
**Objective:** Cap short-term memory at 50 messages

| # | Task | Owner | Status | Deadline | Notes |
|---|---|---|---|---|---|
| A1 | Read current STM implementation | Me | TODO | Day 1 | File: `src/unified_memory_v2/stm/stm_layer.rs` |
| A2 | Design archival trigger (every 50 msgs or 5 min) | Me | TODO | Day 1 | Config: `STM_MAX_SIZE=50`, `STM_ARCHIVE_INTERVAL=5min` |
| A3 | Implement size limiter logic | Me | TODO | Day 2 | Add `push_with_eviction()` method |
| A4 | Implement async archival to SQLite | Me | TODO | Day 2 | File: `src/unified_memory_v2/stm/stm_archival.rs` |
| A5 | Unit tests (3 cases: normal, boundary, rapid) | Me | TODO | Day 2 | Test: archival on 51st message, on 5min timeout |
| A6 | Integration test (100 message session) | Me | TODO | Day 3 | Verify memory stays bounded |

**Rollback Plan:** `git revert` last 3 commits

---

### Track B: Response Streaming (6 hours)
**Objective:** Stream Ollama tokens directly to UI instead of buffering

| # | Task | Owner | Status | Deadline | Notes |
|---|---|---|---|---|---|
| B1 | Audit current response buffering | Me | TODO | Day 1 | Files: `src/commands/ai_chat.rs`, frontend IPC handler |
| B2 | Design streaming protocol (delimiters + chunk size) | Me | TODO | Day 1 | Format: `chunk:0:{"text":"Hello"}\nchunk:1:{"text":"world"}` |
| B3 | Implement Ollama token streaming in Tauri | Me | TODO | Day 2 | Emit IPC events per 50 tokens |
| B4 | Implement UI streaming receiver | Me | TODO | Day 2 | File: `src/screens/ChatScreen.tsx` (or equiv) |
| B5 | Integration test (UI display matches full buffer) | Me | TODO | Day 3 | A/B: streamed vs buffered, verify identical output |
| B6 | Performance test (latency perception) | Me | TODO | Day 3 | Measure TTFB (time to first byte) |

**Rollback Plan:** `git revert` last 2 commits (Tauri + UI)

---

### Track C: Cache Eviction Policy (3 hours)
**Objective:** Cap LRU cache at 500 entries + add TTL eviction

| # | Task | Owner | Status | Deadline | Notes |
|---|---|---|---|---|---|
| C1 | Inspect current LRU cache usage | Me | TODO | Day 1 | File: `src/cache/ai_response_cache.rs` |
| C2 | Check lru 0.16 API (post-upgrade) | Me | TODO | Day 1 | Verify capacity() + len() methods available |
| C3 | Add size cap logic (500 max entries) | Me | TODO | Day 2 | When insert and len > 500: evict oldest (FIFO) |
| C4 | Add TTL eviction (5 min idle) | Me | TODO | Day 2 | Track last access time per entry |
| C5 | Unit tests (capacity, TTL, concurrent) | Me | TODO | Day 2 | Test: insert 501 entries, verify 500 max; verify TTL expiry |
| C6 | Integration test (session with 1000 unique queries) | Me | TODO | Day 3 | Verify cache bounded to 500, no OOM |

**Rollback Plan:** `git revert` cache single commit

---

## 📊 Measurement Plan

### Pre-Optimization Baseline (Day 1)
```bash
# Run on clean build (no optimizations yet)
# Expected: memory +27%, latency p95=1456ms

pnpm run build:release
./deploy/bin/titane-infinity --telemetry-dir /tmp/titane_measure_pre

# Run 2-hour test:
# - 80 messages over 120 min (1 msg every 90 sec)
# - Log memory every 5 min
# - Measure latency for each response

# Output: BASELINE_PRE_OPTIMIZATION_V24.json
```

### Post-Optimization Measurement (Day 4)
```bash
# Run after all Week 1 optimizations merged

# Run same 2-hour test
# Compare: pre vs post memory curves

# Expected: memory +8-10% (vs +27% baseline)

# Output: RESULTS_POST_OPTIMIZATION_V24.json
```

### Analysis (Day 4)
```bash
# Generate comparison report:
# - Memory growth reduction: 27% → X%
# - Latency change: p95 still <2000ms?
# - Crashes: 0?
# - Pass/Fail

# Output: OPTIMIZATION_RESULTS_V24.md
```

---

## 🛠️ Implementation Sequence

### Day 1 (Audit & Design)
- [ ] **A1:** Read STM code
- [ ] **A2:** Design STM limits
- [ ] **B1:** Audit response buffering
- [ ] **B2:** Design streaming protocol
- [ ] **C1:** Inspect cache code
- [ ] **C2:** Check lru 0.16 API
- [ ] **Run baseline measurement** (kick off 2h pre-opt test)

### Day 2 (Implementation)
- [ ] **A3:** Implement STM limiter
- [ ] **A4:** Implement STM archival
- [ ] **B3:** Implement Ollama streaming
- [ ] **B4:** Implement UI receiver
- [ ] **C3:** Add cache size cap
- [ ] **C4:** Add cache TTL eviction
- [ ] **Commit:** Branch 1 (A), Branch 2 (B), Branch 3 (C)

### Day 3 (Testing & Integration)
- [ ] **A5, A6:** Unit + integration tests (STM)
- [ ] **B5, B6:** Integration + performance tests (Streaming)
- [ ] **C5, C6:** Unit + integration tests (Cache)
- [ ] **Code review passes** (peer review)
- [ ] **Merge to main** (all 3 branches)

### Day 4 (Measurement & Decision)
- [ ] **Wait for baseline measurement** (started Day 1)
- [ ] **Run post-optimization measurement** (same 2h test)
- [ ] **Compare:** 27% → X% reduction
- [ ] **Decision point:**
  - If X < 15% → ✅ **PASS** (Quick Wins sufficient, STOP)
  - If 15% ≤ X < 20% → 🟡 **PROCEED** to Medium Term
  - If X ≥ 20% → 🔴 **ESCALATE** to Major Phase

---

## 🔄 Git Workflow

### Branch Strategy
```bash
# 3 independent feature branches (can code in parallel)

# Feature 1: STM Limiter
git checkout -b feat/stm-size-limiter

# Feature 2: Response Streaming
git checkout -b feat/response-streaming

# Feature 3: Cache Eviction
git checkout -b feat/cache-eviction-policy
```

### Commit Strategy
```bash
# Each feature = 2-3 logical commits (not squashed)

# Example (STM):
git commit -m "feat(stm): add size limiter logic (max 50 messages)"
git commit -m "feat(stm): implement async archival to SQLite"
git commit -m "test(stm): add unit + integration tests"

# Before merge: verify build + tests pass
cargo test --all
cargo clippy --all-targets

# Merge (FF):
git checkout main
git merge feat/stm-size-limiter
```

### Rollback if Needed
```bash
# If measurement shows regression (memory >27%):

# Option 1: Selective revert (one feature)
git revert <commit-hash>  # Revert single commit

# Option 2: Full sprint revert (all optimizations)
git revert --no-commit HEAD~9..HEAD  # Revert last 9 commits
git commit -m "revert: optimization sprint (memory regression)"

# Option 3: Go back to baseline branch
git reset --hard origin/MAIN
```

---

## 📈 Success Metrics

### Binary Gates (PASS/FAIL)

| Gate | Metric | Pass | Fail |
|---|---|---|---|
| **Latency** | p95 <2000ms | ✅ | ❌ |
| **Crashes** | Count in 2h test | 0 | >0 |
| **Build** | `cargo test --all` | All pass | Any fail |
| **Memory** | <15% growth | ✅ | ❌ |

### Continuous Metrics (Improvement)

| Metric | Pre-Opt | Post-Opt | Target | Status |
|---|---|---|---|---|
| **Memory after 2h** | +27% | ? | <15% | 🔄 MEASURE |
| **Latency p95** | 1456 ms | ? | <1500 ms | 🔄 MEASURE |
| **Latency p99** | 1823 ms | ? | <2000 ms | 🔄 MEASURE |

---

## 📝 Documentation

### Daily Log
- [ ] **Day 1:** Audit findings, design decisions (in code comments)
- [ ] **Day 2:** Implementation notes, testing approach
- [ ] **Day 3:** Test results, any issues found
- [ ] **Day 4:** Measurement & decision

### Two Reports Required
1. **OPTIMIZATION_RESULTS_V24.md** (mandatory)
   - Pre/post memory curves
   - Latency unchanged? (yes/no)
   - Zero crashes? (yes/no)
   - Decision: Stop, continue, or escalate?

2. **SPRINT_RETROSPECTIVE_V24.md** (recommended)
   - What went well?
   - What was hard?
   - Lessons for Medium/Major phases?

---

## 💬 Communication Plan

### Daily Standup (Optional)
- What completed today?
- Blockers?
- Next day plan?

### Decision Announcement (Day 4, EOD)
- Memory reduction: X%
- Qualification: PASS / PARTIAL / FAIL
- Next phase: STOP / CONTINUE / ESCALATE

---

## 🚨 Risks & Mitigations

| Risk | Probability | Mitigation |
|---|---|---|---|
| **STM archival breaks existing memory access** | Med | Comprehensive unit tests, A/B canary |
| **Response streaming UI glitches** | Med | Client-side buffer, delimiter validation |
| **Cache eviction causes stale responses** | Low | TTL + hit rate metrics |
| **Measurement takes >2h (slow Ollama)** | High | Add 30 min buffer, monitor Ollama health |
| **Code merge conflicts** | Low | Separate features (no overlap likely) |

---

## ✅ Completion Checklist

- [ ] All 3 tracks pass code review
- [ ] All 3 tracks pass unit + integration tests
- [ ] Build passes: `cargo test --all`, `cargo clippy`
- [ ] Pre-optimization measurement complete (Day 1)
- [ ] Post-optimization measurement complete (Day 4)
- [ ] Comparison report: `OPTIMIZATION_RESULTS_V24.md` generated
- [ ] Decision made: STOP / CONTINUE / ESCALATE
- [ ] Commits pushed to origin/main

---

## 🎯 Sprint Summary

**Duration:** 1 week (Mon-Fri)  
**Effort:** ~13 hours (4 + 6 + 3)  
**Expected Gain:** +8-10% memory reduction  
**Parallelizable:** 100% (3 independent tracks)  
**Rollback Time:** <2 minutes (git revert)  

**Decision Point:** End of Day 4 (Friday EOD)

---

**Document Type:** Sprint action board  
**Status:** READY FOR EXECUTION  
**Owner:** Runtime team  
**Created:** 2026-02-22
