# PRODUCTION RECALL TRUTH MAP — P1.13b

## Entry point
`conversation_generate` in `src-tauri/src/conversation_engine/commands.rs`

## Recall path (before fix)
```
conversation_generate
  → router_decision.wants_memory = true
  → orchestrator.unified_memory.write().await.recall(&message, 5)
  → UnifiedMemory.recall() searches STM (VecDeque), MTM (Vec), LTM (.mem files)
  → STM: empty at startup
  → MTM: empty at startup
  → LTM: index restored from .mem files but entries are disk-based
  → Result: 0 items returned (no entries to find)
```

## Recall path (after fix)
```
conversation_generate
  → PERSISTENT_MEMORY_LOADED AtomicBool guard (one-time load)
  → resolve_persistent_memory_base_path(&app_handle)
  → orchestrator.unified_memory.write().await.load_persistent_entries(&pm_base_path)
  → Reads persistent_memory/intermediate/entries.json
  → Converts entries → MemoryItem, loads into STM
  → router_decision.wants_memory = true
  → orchestrator.unified_memory.write().await.recall(&message, 5)
  → STM now contains loaded entries
  → Result: entries returned if query matches
```

## Parallel recall path (already working, untouched)
```
conversationEngine.ts (frontend)
  → tauriClient.persistentMemoryGetContext({ modeId, query })
  → IPC: persistent_memory_get_context
  → persistent_memory.rs reads entries, calculates relevance, builds context string
  → Returns { context, usedEntries }
  → Injected into system prompt as ## PERSISTENT_MEMORY_CONTEXT
  → Passed to conversation_generate via systemPrompt field
Status: PROVEN (already working before this fix)
```

## Status
- Before fix: BROKEN (always 0 items from unified_memory.recall)
- After fix: WIRED_BUT_UNPROVEN (compiles, tests pass, runtime proof requires app launch)

## Owner
conversation_generate → orchestrator.unified_memory