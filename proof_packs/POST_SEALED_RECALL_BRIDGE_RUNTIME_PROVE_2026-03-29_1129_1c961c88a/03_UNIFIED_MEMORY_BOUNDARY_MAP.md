# P1.13c — UNIFIED MEMORY BOUNDARY MAP

## Component Boundaries

```
┌─────────────────────────────────────────────────┐
│ conversation_generate (commands.rs)              │
│  ├── PERSISTENT_MEMORY_LOADED (AtomicBool)       │
│  ├── resolve_persistent_memory_base_path()       │
│  ├── load_persistent_entries() [calls]           │
│  ├── unified_memory.recall() [calls]             │
│  └── memory_recall_block [formats]               │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ UnifiedMemory (unified_memory.rs)                │
│  ├── stm: VecDeque<MemoryItem>                  │
│  ├── mtm: Vec<MemoryItem>                       │
│  ├── ltm: HashMap<MemoryId, MemoryMetadata>     │
│  ├── load_persistent_entries(&mut self, path)    │
│  ├── recall(&mut self, query, max) → Vec<Item>  │
│  └── matches_query(content, tags, query) → bool │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ persistent_memory/intermediate/entries.json      │
│  └── Vec<PersistentMemoryEntry>                 │
└─────────────────────────────────────────────────┘
```

## No Contract Changes

- IPC contract unchanged: `{ ok, content, error }`
- Frontend contract unchanged
- Memory types unchanged