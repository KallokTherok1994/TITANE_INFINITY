# PERSISTENT MEMORY TRUTH MAP — P1.13b

## Write path
```
Frontend: memoryEngine.ts → secureInvoke('persistent_memory_write_entry')
Backend: persistent_memory.rs → persistent_memory_write_entry()
Storage: persistent_memory/{level}/entries.json (JSON file, encrypted for long_term)
```

## Read path (persistent_memory_get_context)
```
Frontend: conversationEngine.ts → tauriClient.persistentMemoryGetContext()
Backend: persistent_memory.rs → persistent_memory_get_context()
Returns: { context: string, usedEntries: string[] }
Injection: Frontend injects into system prompt as ## PERSISTENT_MEMORY_CONTEXT
Status: PROVEN (already working before this fix)
```

## Read path (unified_memory.recall — AFTER FIX)
```
Backend: conversation_generate → unified_memory.load_persistent_entries()
Source: persistent_memory/intermediate/entries.json
Target: UnifiedMemory STM (VecDeque)
Conversion: JSON Value → MemoryItem (importance, content_type, tags mapping)
Dedup: Skips entries already in STM/MTM/LTM by id
Status: WIRED (compiles, tests pass)
```

## Bridge strategy
- Load persistent entries into UnifiedMemory STM at first conversation_generate call
- One-time load via AtomicBool guard
- Dedup by id prevents duplicates on subsequent calls
- No changes to persistent_memory module itself
- No changes to IPC contract
- No changes to frontend

## Owner
persistent_memory: persistent_memory.rs (Rust backend)
bridge: conversation_engine/commands.rs + unified_memory.rs
