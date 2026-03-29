# LOCAL SCOPE BOUNDARY MAP

## Included in Seal
- UnifiedMemory::load_persistent_entries() — bridge from persistent_memory to STM
- UnifiedMemory::recall() — semantic search across STM/MTM/LTM
- persist_explicit_memory_write_facts() — write to entries.json
- conversation_generate injection — MEMORY_CONTEXT block in system prompt
- Response metadata — memoryRecallIds, memoryRecallCount
- False recall guard — no entry = no recall (SC3)
- x3 stability — deterministic behavior (SC4)

## Excluded from Seal
- External sync (TURSO) — BLOCKED_ENV (no real config)
- Provider/control-plane — not part of this lock
- Full Rust memory_os/unified_memory_v2 bridge — future work
- Semantic deduplication guard — future enhancement
- Restart-boundary verification — future enhancement

## BLOCKED_ENV
- TURSO_DATABASE_URL: NOT SET
- TURSO_AUTH_TOKEN: NOT SET
- External sync explicitly excluded, not a proof failure

## Future Work (Not in Scope)
- Full IPC bridge from TypeScript → Rust memory_os
- LTM disk persistence via Rust backend
- Semantic false recall guard
- Cross-session restart-boundary verification
