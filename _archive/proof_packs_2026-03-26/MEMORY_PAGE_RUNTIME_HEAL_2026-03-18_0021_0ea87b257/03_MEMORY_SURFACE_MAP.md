# MEMORY SURFACE MAP

| Surface | Visible | Mounted | Source of Truth | Backend Required | Status |
|---------|---------|---------|-----------------|-----------------|--------|
| Memory tab shell (src/pages/Memory.tsx) | YES | YES | useMemoryCore → tauriClient.memoryGetState | YES | PROVEN_RUNTIME |
| STM/MTM/LTM counters (Memory.tsx ModuleCards) | YES | YES | useMemoryCore.entries (encrypted count) | YES | PROVEN_RUNTIME |
| LTM Conversation card | YES | YES | useLTMContext (localStorage + conversationId) | NO (local) | PROVEN_RUNTIME |
| MemoryDashboard (src/components/chat/MemoryDashboard.tsx) | YES | YES | usePersistentMemory → persistent_memory_read | YES | ERROR_STATE (before patch) → BLOCKED_BY_BACKEND |
| STM/MTM/LTM counters (Dashboard footer) | YES | YES | usePersistentMemory.sessionCount/intermediateCount/longTermCount | YES | ERROR_STATE (before patch) |
| Stats panel (Dashboard) | YES | YES | usePersistentMemory.stats | YES | ERROR_STATE (before patch) |
| Memory entries list (Dashboard) | YES | YES | usePersistentMemory.entries | YES | ERROR_STATE (before patch) |
| Filter bar / search | YES | YES | Local state | NO | VISIBLE_ONLY |
| Retry button (MemoryDashboard error state) | YES | YES | usePersistentMemory.refresh() | YES | ERROR_STATE |
| MemoryTree (devtools) | YES (devtools only) | YES | devtools local state | NO | MOCKED |
| Semantic Search | YES (Dashboard search input) | YES | usePersistentMemory.search() | YES | BLOCKED_BY_BACKEND (same root cause) |

## Note on Source Mismatch
- Memory.tsx uses `useMemoryCore` (separate hook, different commands: `memory_get_state`)
- MemoryDashboard uses `usePersistentMemory` (persistent 3-level system)
- These are different intentional subsystems — no MEMORY_SOURCE_MISMATCH violation

## Anti-Lie Assessment
- MemoryDashboard correctly shows a RED error banner when backend fails (not silent zeros)
- Error text: "Erreur: {error.message}" — truthful
- Retry button triggers real `refresh()` — not a lie
- STM=0/MTM=0/LTM=0 only shown in the footer of working dashboard — only shown after stats load
