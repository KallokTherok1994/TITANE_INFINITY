# MEMORY CHAIN MATRIX

| Surface | UI Source | Hook/Store | Service | Invoke | Rust Command | Backend Module | Response Shape | Truth Status |
|---------|-----------|------------|---------|--------|--------------|----------------|----------------|--------------|
| Memory Dashboard | MemoryDashboard.tsx | usePersistentMemory | tauriClient.persistentMemoryRead | secureInvoke → validateCommand | `persistent_memory_read` | persistent_memory.rs (v19.2Ω) | MemoryReadResponse | BLOCKED_BY_WHITELIST (before patch) → PASSES after patch |
| STM/MTM/LTM counters | MemoryDashboard.tsx | usePersistentMemory.stats | tauriClient.persistentMemoryGetStats | secureInvoke | `persistent_memory_get_stats` | persistent_memory.rs | MemoryStats | PASS (in whitelist) |
| Bundles | MemoryDashboard.tsx | usePersistentMemory | tauriClient.persistentMemoryGetBundles | secureInvoke → validateCommand | `persistent_memory_get_bundles` | persistent_memory.rs | MemoryBundle[] | BLOCKED_BY_WHITELIST (before patch) → PASSES after patch |
| Memory entries list | Memory.tsx | useMemoryCore | tauriClient.memoryGetState | secureInvoke | `memory_get_state` | memory commands | MemoryState | PROVEN_RUNTIME |
| LTM conversation | Memory.tsx | useLTMContext | localStorage | N/A (local) | N/A | browser storage | ChatMessage[] | PROVEN_LOCAL |
| Semantic Search | MemoryDashboard FilterBar | usePersistentMemory.search | tauriClient.persistentMemoryRead | secureInvoke | `persistent_memory_read` | persistent_memory.rs | MemoryEntry[] | PASSES after patch |
| Memory Tree (devtools) | MemoryTree.tsx | local devtools state | N/A | N/A | N/A | N/A | local | MOCKED (intentional) |

## Root Cause — Chain Break Point
```
usePersistentMemory.refresh()
  → tauriClient.persistentMemoryRead → invoke('persistent_memory_read')
    → secureInvoke → validateCommand('persistent_memory_read')
      → COMMAND_WHITELIST.includes('persistent_memory_read') = FALSE ❌
      → throw "Security: Command not in whitelist"
  → catch → setState({ error: 'Erreur de chargement mémoire' })
```

## Patch Applied
`src/lib/security.ts` — COMMAND_WHITELIST:
- Added: `'persistent_memory_read'`
- Added: `'persistent_memory_get_bundles'`
