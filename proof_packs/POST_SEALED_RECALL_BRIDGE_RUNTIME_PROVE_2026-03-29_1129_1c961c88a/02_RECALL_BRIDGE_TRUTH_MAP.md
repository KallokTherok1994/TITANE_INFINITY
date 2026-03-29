# P1.13c — RECALL BRIDGE TRUTH MAP

## Production Recall State

| Component | Status | Evidence |
|-----------|--------|----------|
| persistent_memory_write_entry | WORKING | Writes to entries.json |
| load_persistent_entries() | IMPLEMENTED | unified_memory.rs lines ~530-600 |
| AtomicBool guard | IMPLEMENTED | PERSISTENT_MEMORY_LOADED in commands.rs |
| unified_memory.recall() | WORKING | Searches STM/MTM/LTM |
| MEMORY_CONTEXT injection | IMPLEMENTED | commands.rs: memory_recall_block |
| memoryRecallIds metadata | IMPLEMENTED | commands.rs: response.metadata |

## Data Flow

```
User writes: "Memorise: code=ORION"
    ↓
persist_explicit_memory_write_facts()
    ↓
persistent_memory/intermediate/entries.json
    ↓ (on next conversation_generate)
PERSISTENT_MEMORY_LOADED.swap(true, SeqCst)
    ↓ (first call only)
load_persistent_entries(&pm_base_path)
    ↓
UnifiedMemory.stm.push_back(MemoryItem)
    ↓
unified_memory.recall("ORION", 5)
    ↓
MEMORY_CONTEXT block injected
    ↓
response.metadata.memoryRecallIds = ["entry-id"]