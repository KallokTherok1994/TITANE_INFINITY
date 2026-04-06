# 02 — MEMORY AUTHORITY MAP

## Authorities Present (3 separate, non-unified systems)

| System | File | Wired to Chat | Persistence |
|--------|------|---------------|-------------|
| core::UnifiedMemory | src-tauri/src/core/modules/unified_memory.rs | YES (ChatOrchestratorState) | LTM disk (fixed) |
| memory_os::MemoryOS | src-tauri/src/memory_os/ | NO | LTM: real JSON files |
| unified_memory_v2 | src-tauri/src/unified_memory_v2/ | NO | STM/MTM/LTM: real JSON per tier |

## Chat uses: core::UnifiedMemory ONLY
- `state.unified_memory: Arc<RwLock<UnifiedMemory>>` (ChatOrchestratorState line 176)
- `store_in_unified_memory()` called at line 629 post-response
- `recall()` is NEVER called before building a chat prompt

## MEMORY_AUTHORITY_SPLIT: YES (3 systems) — 2 unused by chat

## canonical vs derived
- Canonical for chat: core::UnifiedMemory STM/MTM/LTM in-memory + LTM disk (after fix)
- memory_os and v2 are parallel implementations — not canonical for chat

## Persistence authority (after fix)
- STM: RAM only (VecDeque) — intentional session window
- MTM: RAM only (Vec) — intentional session-to-session window
- LTM: disk JSON at ~/.local/share/titane-infinity/ltm/*.mem (FIXED)

## Recovery authority (after fix)
- init() now calls restore_ltm_from_disk() — scans *.mem, deserializes MemoryItem, rebuilds index
