# LTM RUNTIME TRUTH MAP — P1.13

## Write Path

| Stage | Owner | Runtime Surface | Status | Proof |
|-------|-------|----------------|--------|-------|
| User intent detection | MemoryBridge.ts | detectIntent() | PROVEN | Pattern matching works |
| Store to UnifiedMemory | MemoryBridge.ts | store() → unifiedMemory.store() | PROVEN | In-memory write |
| Importance calculation | MemoryBridge.ts | store() heuristics | PROVEN | Tier auto-determined |
| Disk persistence | NONE | N/A | BROKEN | No disk write path exists |
| Rust backend write | memory_os/ltm.rs | NOT WIRED | BROKEN | Module exists but not connected to TS |

## Persistence Sink

| Sink | Path | Active at Runtime | Status |
|------|------|-------------------|--------|
| JS in-memory array | UnifiedMemoryService.entries | YES | PROVEN (volatile) |
| memory/ltm.json | memory/ltm.json | NO | Static file, not read/written by runtime |
| unified_memory.db | NOT FOUND | NO | BROKEN — does not exist at runtime path |
| conversation_os_v1.db | runtime/memory/conversation_os_v1.db | YES | PROVEN (events/snapshots only, not LTM) |
| titan_events.db | ~/.local/share/TITANE_INFINITY/persistence/ | YES | PROVEN (persistence engine, not LTM) |
| Rust memory_os | src-tauri/src/memory_os/ | NO | WIRED_BUT_UNPROVEN — not connected to TS runtime |

## Recall Path

| Stage | Owner | Runtime Surface | Status | Proof |
|-------|-------|----------------|--------|-------|
| Keyword extraction | MemoryBridge.ts | detectIntent().keywords | PROVEN | Extracts keywords |
| UnifiedMemory recall | UnifiedMemoryService | recall() | PROVEN | In-memory search |
| Relevance sorting | MemoryBridge.ts | buildInjection() | PROVEN | Importance + recency scoring |
| Rust semantic search | memory_os/semantic_search.rs | NOT WIRED | BROKEN | Module exists but not connected |

## Injection Path

| Stage | Owner | Runtime Surface | Status | Proof |
|-------|-------|----------------|--------|-------|
| Build injection string | MemoryBridge.ts | buildInjection() | PROVEN | Creates systemPromptAddition |
| Context envelope | conversationEngine.ts | persistentMemoryGetContext() | WIRED | Connects to providers |
| Provider injection | titaneLocal.ts / ollama.ts | injectedMemoryBlock | WIRED | Accepts memory context |
| Rust bridge | memory_os/memory_os_bridge.rs | NOT WIRED | BROKEN | Module exists but not connected |

## Consumption Signal

| Stage | Owner | Runtime Surface | Status | Proof |
|-------|-------|----------------|--------|-------|
| LLM processes injected context | Provider (Ollama/titaneLocal) | Model inference | UNKNOWN | Prior proof: HONEST_OFFLINE_DEGRADED |
| Answer uses memory fact | LLM output | Response text | UNKNOWN | Cannot verify without working provider |
| False recall detection | MemoryBridge.ts | Pattern-based guard | PARTIAL | No semantic deduplication |

## Summary
- WRITE: PROVEN in-memory, BROKEN at disk persistence
- PERSIST: BROKEN — no runtime disk persistence for LTM
- RECALL: PROVEN in-memory, BROKEN at disk/Rust search
- INJECT: WIRED but unproven behavioral effect
- CONSUME: UNKNOWN — provider state unreliable
- FALSE RECALL GUARD: PARTIAL — pattern-based only