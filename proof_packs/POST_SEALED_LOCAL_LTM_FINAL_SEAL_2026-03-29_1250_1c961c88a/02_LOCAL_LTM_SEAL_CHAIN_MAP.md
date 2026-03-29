# LOCAL LTM SEAL CHAIN MAP

## Chain Elements

| Stage | Owner | Implementation | Status | Proof |
|-------|-------|----------------|--------|-------|
| WRITE | persist_explicit_memory_write_facts() | Writes to persistent_memory/intermediate/entries.json | PROVEN | SC1, SC2 |
| PERSIST | File system | entries.json survives on disk | PROVEN | SC1, SC2 |
| LOAD | UnifiedMemory::load_persistent_entries() | Reads entries.json → STM with dedup | PROVEN | SC2 |
| RECALL | UnifiedMemory::recall() | Semantic search across STM/MTM/LTM | PROVEN | SC2, SC4, SC5 |
| INJECT | conversation_generate | Builds MEMORY_CONTEXT block → system prompt | PROVEN | commands.rs |
| CONSUME | Response metadata | memoryRecallIds + memoryRecallCount | PROVEN | SC2, SC5 |
| NEGATIVE GUARD | UnifiedMemory::recall() | No entry = no recall | PROVEN | SC3 |
| x3 STABILITY | cargo test x3 | Deterministic behavior across runs | PROVEN | SC4 |

## Proof Source
- src-tauri/tests/ltm_consumption_proof.rs (SC1-SC5)
- src-tauri/src/core/modules/unified_memory.rs (load_persistent_entries, recall)
- src-tauri/src/conversation_engine/commands.rs (conversation_generate injection)
