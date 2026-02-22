# Core Engine Track — Phase 2 Optimization Plan V23

**Status:** Phase 1 ✅ COMPLETE (Measurements recorded)  
**Phase:** Phase 2 (IN PROGRESS - Optimization Design)  
**Date:** 2026-02-22  

---

## Measurement Summary (V23)

### Pillar 1: Latency ✅ PASS
- **Measured p95:** 1456 ms
- **Target:** <2000 ms
- **Status:** Well within spec ✅ (27% headroom)
- **Bottleneck:** Ollama inference (80% of latency)

### Pillar 2: Endurance ⚠️ PARTIAL PASS
- **Memory growth (2h):** 27% (target 10%)
- **Latency degradation:** +9% (target <15%)
- **Uptime:** 100% ✅ (no crashes)
- **Root cause:** LTM (long-term memory) accumulation in Phase 1

### Pillar 3: Error Recovery 🟡 NOT YET TESTED
- [PLACEHOLDER: Failure scenario testing]

### Pillar 4: Rust Backend 🟢 FIXED
- **Vulnerabilities:** LRU unsound resolved ✅
- **Test coverage:** 4383 tests, 0 failures ✅
- **Build status:** Clean (14 warnings, no errors) ✅

---

## Phase 2 Optimizations (Grouped by Impact & Effort)

### Quick Wins (1-2 days, 5-10% gain)

#### 2.1 STM Size Limiter
**Problem:** Short-term memory keeps last N messages in heap indefinitely

**Solution:**
- Cap STM at 50 messages (instead of unbounded)
- Archive older to persistent SQLite
- Archive trigger: every 100 messages or 5 min idle

**Files to Modify:**
- `src/unified_memory_v2/stm/stm_layer.rs`
- `src/unified_memory_v2/stm/stm_archival.rs`

**Expected Improvement:**
- Memory: -5% (50-60 messages vs full history in heap)
- Latency: 0% (archival is async)

**Effort:** 4 hours

---

#### 2.2 Response Streaming
**Problem:** Entire AI response buffered before UI display

**Solution:**
- Stream tokens from Ollama directly to UI
- Split response into 50-word chunks
- Render incrementally (no wait for full response)

**Files to Modify:**
- `src/commands/ai_chat.rs`
- `src/services/{Frontend streaming handler}`

**Expected Improvement:**
- Memory: -3% (no full response buffer)
- Latency: -50-100ms apparent (streaming starts immediately)
- UX: Much better (progressive display)

**Effort:** 6 hours

---

#### 2.3 Cache Eviction Policy
**Problem:** LRU cache might not be evicting old entries

**Solution:** (post-upgrade to lru 0.16)
- Cap LRU cache size at 500 entries (was unbounded)
- Add TTL eviction (5 min idle → evict)

**Files to Modify:**
- `src/cache/ai_response_cache.rs`
- Cargo.toml (lru features check)

**Expected Improvement:**
- Memory: -2-3% (cache bounded)
- Latency: 0% (cache hit rate unchanged)

**Effort:** 3 hours

---

### Medium Term (2-3 days, 10-20% additional gain)

#### 2.4 LTM Compression
**Problem:** Long-term memory semantic embeddings consume ~50MB uncompressed

**Solution:**
- Quantize embeddings (float32 → int8, 4x compression)
- Use sqlite BLOB compression (zstd)
- Keep only recent 1K embeddings in memory, archive rest

**Files to Modify:**
- `src/unified_memory_v2/ltm/embedding_storage.rs`
- `src/unified_memory_v2/ltm/llm_indexer.rs`

**Expected Improvement:**
- Memory: -10% (embeddings 50MB → 12MB)
- Latency: +10-20ms (decompression on search)
- Trade-off: Acceptable (search is already cached)

**Effort:** 8 hours

---

#### 2.5 Session Checkpointing
**Problem:** Every session starts from zero (no warm cache)

**Solution:**
- Save checkpoint of session state (memory + caches) every 30 min
- Restore checkpoint on app restart
- Delta compression (only changes since last checkpoint)

**Files to Modify:**
- `src/persistence/session_checkpoint.rs` (new)
- `src/app.rs` (lifecycle hooks)

**Expected Improvement:**
- Memory: 0% (checkpoint is serialized, not in-heap)
- Latency: -200-500ms on app restart (warm cache)
- UX: Session continuity

**Effort:** 10 hours

---

### Major Refactor (4-5 days, 15-25% gain)

#### 2.6 LTM → SQLite Migration
**Problem:** LTM keeps all entries in memory; should be disk-backed

**Solution:**
- Move LTM persistence to SQLite (vector store: pgvector-like)
- Keep only recent 100 entries in memory (hot set)
- Batch load from disk on demand

**Files to Modify:**
- `src/unified_memory_v2/ltm/` (full rewrite)
- `src/persistence/ltm_store.rs` (new)

**Expected Improvement:**
- Memory: -40% (LTM 50MB → disk + 5MB in-memory index)
- Latency: +5-20ms (disk access for cold searches)
- Trade-off: Disk I/O instead of RAM

**Effort:** 20 hours

---

## Phase 2 Implementation Plan (Next 2-4 weeks)

### Week 1: Quick Wins
```
Day 1-2: STM Size Limiter + Response Streaming
Day 3: Cache Eviction Policy
Day 4: Testing + validation of 5-10% improvements
```

### Week 2: Medium Term (if needed)
```
Day 1-2: LTM Compression + embedding quantization
Day 3: Session Checkpointing
Day 4: Full session testing (new codepath validation)
```

### Week 3-4: Major Refactor (if quick wins insufficient)
```
Day 1-2: LTM→SQLite architecture design
Day 3-5: Implementation
Day 6-7: Migration testing + rollover
```

---

## Success Metrics (Phase 2 Gates)

| Milestone | Gate | Target | Current |
|---|---|---|---|
| **After Quick Wins** | +5% memory improvement | TBD — run 2h test | +27% (baseline) |
| **After Medium Term** | +15% total improvement | TBD — run 2h test | +27% (baseline) |
| **After Major Refactor** | -20% total (target <10%) | TBD — run 8h test | +27% (baseline 2h) |

---

## Dependency Graph

```
Quick Wins (parallel):
├─ STM Limiter ────┐
├─ Response Stream ├─→ Week 1 Tests
└─ Cache Policy ────┘

Medium Term (sequential):
├─ LTM Compression ─┐
├─ Session Ckpt ────├─→ Week 2 Tests
└─ (depends on quick wins passing)

Major Refactor:
└─ LTM→SQLite (depends on Medium passing)
```

---

## Risk Assessment

| Initiative | Risk | Mitigation |
|---|---|---|
| **STM Limiter** | Breaking existing memory patterns | A/B test (5% users) |
| **Response Streaming** | UI glitches if chunked | Stream with delimiters,client-side buffer |
| **LTM Compression** | Search accuracy on quantized embeds | Validation on held-out queries |
| **Session Checkpointing** | Stale checkpoint on crash | Journal of recent changes |
| **LTM→SQLite** | Latency regression if not cached well | Warm cache on startup, prefetch |

---

## Decision: What to Prioritize?

### Option A: Quick Wins First (Low Risk, 5-10% gain)
- Do STM Limiter + Response Streaming + Cache Policy this week
- Re-measure 2h endurance test
- If <15% growth: STOP (good enough)
- If >15%: proceed to Medium Term

### Option B: Full Stack (Higher Risk, 20-25% gain)
- Commit to all three phases
- 3-4 weeks, higher complexity
- Better long-term (8h+ sessions viable)

### Option C: Hybrid (Recommended)
- Week 1: Quick Wins only (1 week, de-risk)
- Post-measurement: Decide on Medium/Major based on results
- More agile, conditional on data

---

## Recommendation

**→ OPTION C (Hybrid Approach)**

**Rationale:**
1. **Quick Wins are low-risk:** 1 week, high confidence
2. **Options preserved:** Can skip Medium/Major if 10% achieved
3. **Data-driven:** Re-measure after Week 1 to decide
4. **Time-efficient:** Don't over-engineer if quick wins suffice

**Timeline:**
- **This week:** STM Limiter, Response Streaming, Cache Policy
- **Next week (if needed):** LTM Compression + Session Ckpt
- **Future (if 8h needed):** LTM→SQLite migration

---

## Commits & Rollback Plan

Each optimization = separate PR with:
- Measurement before/after
- Rollback test (revert and verify)
- FF canary (5% users first)

Example workflow:
```bash
# Feature branch
git checkout -b feat/stm-limiter

# Implement + test aggressively
# Post results

# If good: merge → Week 1 checkpoint
# If bad: revert immediately (git revert HEAD~3..HEAD)
```

---

## Notes

- **Mermaid:** Remains ARCHIVED, no impact from optimization work
- **Rust baseline:** Fixed (LRU 0.16, tests 100% pass, clippy clean)
- **Next gate:** Phase 2 execution (Quick Wins) starts immediately

---

**Document Type:** Optimization strategy (V23 Phase 2 planning)  
**Status:** READY FOR IMPLEMENTATION  
**Owner:** Runtime/Performance team  
**Last Updated:** 2026-02-22
