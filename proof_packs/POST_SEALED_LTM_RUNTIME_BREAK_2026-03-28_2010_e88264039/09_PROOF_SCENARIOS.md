# PROOF SCENARIOS — P1.13

## SCENARIO A — LTM WRITE / PERSIST

### Description
Trigger a bounded runtime path expected to write candidate memory, then verify canonical persistence surface changed.

### Execution
1. MemoryBridge.store() writes to UnifiedMemoryService.entries (in-memory array)
2. Check if any disk file is updated
3. Check if conversation_os_v1.db LTM table is updated
4. Check if titan_events.db has LTM entries

### Result
- In-memory write: PROVEN (entries array updated)
- Disk persistence: NOT FOUND (no file updated)
- conversation_os_v1.db: NOT AFFECTED (events/snapshots only)
- titan_events.db: NOT AFFECTED (persistence engine events only)

### Verdict
**BREAK_AT_PERSIST** — Write succeeds in memory but no persistence sink exists.

---

## SCENARIO B — LTM RECALL

### Description
Trigger a bounded recall path, verify recall uses the expected local source/scope.

### Execution
1. Store a memory entry via MemoryBridge.store()
2. Call MemoryBridge.retrieve() with keywords
3. Verify recall returns the stored entry

### Result
- In-memory recall: PROVEN (search finds stored entries)
- Disk recall: NOT TESTED (no disk persistence exists)
- Rust semantic search: NOT WIRED (memory_os/semantic_search.rs not connected)

### Verdict
**PARTIAL** — Recall works in-memory only. No disk or Rust-backed recall.

---

## SCENARIO C — LTM INJECTION / CONSUME

### Description
Verify whether recalled memory reaches injection, and whether injection produces observable behavioral/state effect.

### Execution
1. MemoryBridge.buildInjection() creates systemPromptAddition string
2. conversationEngine.ts passes context to provider
3. Provider (Ollama/titaneLocal) receives injected memory

### Result
- Injection string creation: PROVEN (buildInjection() works)
- Provider receives context: WIRED (conversationEngine → provider)
- Behavioral consumption: UNKNOWN (prior proof: HONEST_OFFLINE_DEGRADED)
- Answer uses memory fact: UNKNOWN (cannot verify without working provider)

### Verdict
**WIRED_BUT_UNPROVEN** — Injection reaches provider layer but consumption is unproven.

---

## SCENARIO D — FALSE RECALL GUARD

### Description
Exercise or bound a scenario where false recall would be detectable.

### Execution
1. Check for improbable-token guard: NOT PRESENT
2. Check for semantic deduplication: NOT PRESENT
3. Check for restart-boundary verification: NOT PRESENT
4. Check for pattern-based intent detection: PRESENT (RECALL_PATTERNS, STORE_PATTERNS)

### Result
- Pattern-based guard: PARTIAL (regex patterns for intent detection)
- Semantic deduplication: ABSENT
- Improbable-token guard: ABSENT
- Restart-boundary verification: ABSENT

### Verdict
**GUARD_PARTIAL** — Pattern-based only. No semantic or token-based false recall protection.

---

## SCENARIO E — EXTERNAL SYNC CLASSIFICATION

### Description
If config exists, test boundedly. If config missing, classify BLOCKED_ENV explicitly.

### Execution
1. Check TURSO_DATABASE_URL: NOT SET
2. Check TURSO_AUTH_TOKEN: NOT SET
3. Option1 sync service behavior: returns SYNC_MISSING_CONFIG

### Result
- External sync config: MISSING
- Sync service: WIRED but blocked by missing config
- Classification: BLOCKED_ENV

### Verdict
**BLOCKED_ENV** — External sync requires TURSO config which is not present. This is NOT a proof failure, it is an honest environment classification.