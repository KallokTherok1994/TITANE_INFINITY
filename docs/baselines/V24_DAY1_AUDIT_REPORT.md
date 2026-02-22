# V24 Week 1 — Day 1 Audit Report

**Date:** 2026-02-22  
**Status:** AUDIT COMPLETE — DESIGN READY FOR IMPLEMENTATION  

---

## Track A: STM Size Limiter — Code Audit

**File:** `src-tauri/src/neural_memory/stm.rs`  
**Current State:**

```rust
pub struct ShortTermMemory {
    entries: VecDeque<MemoryEntry>,
    max_capacity: usize,  // ← Default: 20
}

pub fn push(&mut self, mut entry: MemoryEntry) -> MemoryResult<()> {
    if self.entries.len() >= self.max_capacity {
        self.entries.pop_front(); // ← PROBLEM: Evicts oldest entry (data loss!)
    }
    self.entries.push_back(entry);
    Ok(())
}
```

**Key Findings:**
1. ✅ STM exists as VecDeque (good FIFO structure)
2. ❌ **Problem 1:** Default capacity is 20 items (too small for 2h session with frequent messages)
3. ❌ **Problem 2:** When capacity exceeded → entries are **discarded** (no archival)
4. ✅ Can add/remove entries by ID
5. ✅ Search functionality exists

**Memory Impact Analysis:**
- Current: 1 MemoryEntry ≈ 500 bytes (content + metadata)
- 20 items ≈ 10 KB in STM
- Discarded items never archived (lost forever)

**Week 1 Design:**
- Increase max_capacity from 20 → 50 (still reasonable memory)
- Implement async archival path:
  - When evicting entry from STM → archive to MTM instead of discard
  - Make archival async (non-blocking push)
  - Add optional TTL-based eviction (5 min idle → archive)

**Implementation Path:**
1. Add `stm_archival_enabled` flag to config
2. Add method `push_with_archival()` that triggers async archive callback
3. Update bridge to accept archival handler
4. Tests: Verify 51st entry triggers archival, not discard

**Expected Gain:** -2-5% memory (less frequently discard, better consolidation)

---

## Track B: Response Streaming — Code Audit

**File:** `src-tauri/src/commands/ai_chat.rs`  
**Current State:**

The AI chat command generates responses from AIRouter (external AI provider), which:
1. Calls Ollama (or other provider)
2. Buffers **entire response** in memory before returning
3. Sends full response to UI in one IPC call
4. UI receives + displays complete text

**Current Flow:**
```
[Ollama]
   ↓
[Buffer full response (e.g., 500 tokens in 500B)]
   ↓
[IPC: {"type": "response", "text": "[full 500-token response]"}]
   ↓
[UI receives + displays]
```

**Key Findings:**
1. ❌ **Problem 1:** TTFB (Time To First Byte) = full response time (~1000ms on average)
   - User sees nothing until all tokens received
   - Apparent latency = full latency (worse UX)
2. ❌ **Problem 2:** Memory spike when buffering large responses (rare, but possible)
3. ✅ IPC infrastructure exists for streaming (can emit multiple messages)

**Week 1 Design:**
- Modify AIRouter to support **token streaming callback** instead of full buffer
- For each token received from Ollama:
  - Emit IPC message: `{"type": "response_chunk", "chunk": "text", "index": N}`
  - UI appends chunk to display (progressive rendering)
- Benefits:
  - TTFB drops from 1000ms → 100ms (first token visible immediately)
  - Memory: No full response buffer needed
  - UX: Immediate visual feedback (user sees AI "thinking")

**Implementation Path:**
1. Add streaming interface to AIRouter (`stream_response()`)
2. Modify response parsing to emit chunks every 50-100 tokens
3. Add IPC event handler for UI streaming receiver
4. Test: Verify streamed vs buffered produce identical final text

**Expected Gain:** -3-5% memory (no full buffer), -50-100ms *apparent* latency (UX improvement, backend latency unchanged)

---

## Track C: Cache Eviction Policy — Code Audit

**File:** `src-tauri/src/cache/mod.rs`  
**Current State:**

```rust
pub struct IntelligentCache {
    data: Arc<DashMap<CacheKey, CacheEntry>>,
    lru: Arc<DashMap<CacheKey, Instant>>,        // ← Tracks LRU times
    config: CacheConfig,
}

pub struct CacheConfig {
    pub max_entries: usize,      // ← Default: 1000 (!!!!)
    pub default_ttl: Duration,   // ← Default: 5 seconds
    pub enable_persistence: bool,
}
```

**Key Findings:**
1. ❌ **Problem 1:** Default max_entries = 1000 (way too high for limited memory)
   - Each entry ≈ 1KB (response cache)
   - 1000 entries ≈ 1 MB just for cache (unacceptable)
2. ❌ **Problem 2:** TTL is per-entry (5s default), but not aggressively enforced
3. ✅ LRU tracking exists (uses DashMap for concurrent tracking)
4. ✅ `evict_lru()` method exists (called on insertion when limit exceeded)

**Memory Impact Analysis:**
- 1000 cache entries × 1KB per entry ≈ 1-2 MB (needless waste)
- In 2h session: cache probably hits 500-800 entries steadily
- Eviction not aggressive enough (only on insertion, not on background)

**Week 1 Design:**
- Reduce cap: 1000 → 500 entries (50% reduction)
- Add background eviction task:
  - Every 60 seconds: scan cache for expired entries (TTL)
  - Evict oldest 10% by LRU if still > 500
- Reduce default TTL: 5s → 2s (for chat responses)
  - Reasoning: Response cache hit rare after 2s (user moved on)

**Implementation Path:**
1. Update `CacheConfig::default()`: max_entries: 500
2. Add background eviction task in cache init
3. Modify `set()` to trigger eviction if DashMap len > 500
4. Tests: Insert 600 entries, verify cache ≤ 500, verify TTL cleanup

**Expected Gain:** -2-3% memory (cap from 1000 → 500 + TTL cleanup)

---

## Summary: 3-Track Changes Required

| Track | File(s) | Change | Effort | Memory Gain |
|---|---|---|---|---|
| **A: STM** | `neural_memory/stm.rs`, `bridge.rs`, `config.rs` | Add archival callback on eviction | 4h | -2-5% |
| **B: Response Stream** | `commands/ai_chat.rs`, frontend UI | Stream tokens vs buffer | 6h | -3-5% |
| **C: Cache Eviction** | `cache/mod.rs` | Cap 500 + TTL + background evict | 3h | -2-3% |
| **Total** | — | — | **13h** | **-8-10%** |

---

## Design Decisions (Ready for Implementation)

### Track A: STM Archival Trigger
- **Trigger:** When STM.push() sees len >= max_capacity AND max_capacity reached
- **Action:** Evicted entry passed to async archival handler (non-blocking)
- **Handler:** Archive to MTM or persistence layer (depends on importance)
- **Config:** `stm_archival_enabled: true` (default), `stm_archival_interval: 5min` (TTL-based)

**Pseudocode:**
```rust
impl ShortTermMemory {
    pub fn push_with_archival(
        &mut self,
        entry: MemoryEntry,
        archival_handler: Option<ArchivalFn>,
    ) -> MemoryResult<()> {
        if self.entries.len() >= self.max_capacity {
            if let Some(old_entry) = self.entries.pop_front() {
                // Archive instead of discard
                if let Some(handler) = archival_handler {
                    handler(old_entry).await; // Non-blocking
                }
            }
        }
        self.entries.push_back(entry);
        Ok(())
    }
}
```

### Track B: Response Streaming Protocol
- **IPC Event Format:**
  ```json
  // Initial chunk (for UI initialization)
  {"type": "ai_response_start", "response_id": "uuid"}
  
  // Data chunks (streamed)
  {"type": "ai_response_chunk", "response_id": "uuid", "text": "Hello", "index": 0}
  {"type": "ai_response_chunk", "response_id": "uuid", "text": " world", "index": 1}
  
  // End marker
  {"type": "ai_response_end", "response_id": "uuid", "total_tokens": 2}
  ```
- **Chunk Size:** 50-100 tokens per IPC call (balance latency vs overhead)
- **Client-Side:** UI buffers chunks, appends to display (no rerender cost)

### Track C: Cache Eviction Strategy
- **Size Cap:** max_entries = 500
- **TTL:** default_ttl = 2s (not 5s)
- **Background Task:** Every 60s, clean up expired entries
- **Eviction Order:** Oldest LRU first (natural for DashMap iteration)

---

## Baseline Measurement Coordination

**Kick-off:** Immediately after this audit (Day 1 EOD)

**Pre-Optimization Measurement (Baseline):**
- Build current TITANE from main branch
- Run 2-hour session: 80 messages over 120 min (1 message every 90 sec)
- Capture memory every 5 minutes
- Record response latencies for each message

**Expected:** Memory +27% (per V23 endurance test)

**Post-Optimization Measurement (Day 4):**
- Build TITANE with all 3 optimizations merged
- Same 2-hour test
- Compare memory curves

**Success Criteria:**
- Memory growth <15% (target: 8-10% reduction from 27%)
- Latency p95 unchanged (still <2000ms)
- Zero crashes

---

## Risks & Mitigations

| Risk | Probability | Mitigation |
|---|---|---|---|
| **STM archival callback not called in time** | Low | Unit test: verify push triggers callback |
| **Response streaming causes UI glitches** | Low | A/B test streamed vs buffered output |
| **Cache eviction too aggressive (cache thrashing)** | Low | Monitor hit rate, adjust cap if needed |
| **Baseline measurement takes >2h (Ollama slow)** | Medium | Start early, add buffer time |
| **Merge conflicts on Day 3** | Low | 3 independent tracks (no overlap) |

---

## Next Steps (Day 2: Implementation)

- [ ] Create 3 feature branches: `feat/stm-limiter`, `feat/response-streaming`, `feat/cache-eviction`
- [ ] Implement Track A: STM archival logic (4 hours)
- [ ] Implement Track B: Response streaming (6 hours)
- [ ] Implement Track C: Cache cap + TTL (3 hours)
- [ ] Unit tests for each track
- [ ] Build & verify: `cargo test --all`

---

## Decision: Ready to Proceed?

✅ **YES** — All 3 tracks have clear design, low risk, measurable impact.

**Proceeding to Day 2 Implementation Phase.**

---

**Document Type:** Audit report (V24 Week 1 Day 1)  
**Status:** COMPLETE — READY FOR IMPLEMENTATION  
**Owner:** Runtime optimization team  
**Created:** 2026-02-22
