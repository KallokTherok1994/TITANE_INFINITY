# LTM BOUNDARY MAP — P1.13

## Canonical Local Memory (Proven)

| Layer | Location | Proven | Notes |
|-------|----------|--------|-------|
| Events append-only | titan_events.events.json | YES | Persistence engine, append-only |
| Snapshots | titan_events.snapshots.json | YES | Persistence engine, snapshot emission |
| Conversation OS | conversation_os_v1.db (503KB) | YES | SQLite, events+snapshots+provider_decisions |
| STM/MTM in-memory | UnifiedMemoryService.entries | YES | Volatile, lost on restart |

## Derived/Index Layers (Non-canonical)

| Layer | Location | Proven | Notes |
|-------|----------|--------|-------|
| LTM JSON file | memory/ltm.json | NO | Static artifact, not runtime-sourced |
| Memory index | memory/memory-index.json | NO | Derived, not canonical |
| Cognitive state | memory/cognitive.json | NO | Derived dashboard |
| Semantic memory DB | data/cognitive/semantic_memory.db | NO | Derived index, not canonical |
| Memory backups | memory/backup/*.json.backup | NO | Backup artifacts, not canon |

## Replay Influence Boundary

| Reducer | Proven | LTM Impact |
|---------|--------|------------|
| Memory reducer | YES (event replay) | Mutates SingularityState only, NOT LTM disk |
| XP reducer | YES | No LTM impact |
| Progress reducer | YES | No LTM impact |
| Knowledge reducer | YES | No LTM impact |
| Settings reducer | YES | No LTM impact |

**Key finding**: Event replay mutates shallow SingularityState fields. It does NOT reach LTM disk storage or encrypted layer. LTM proof is a separate cycle (this one).

## Scope Boundaries

### IN SCOPE (this cycle)
- TypeScript LTM runtime path (write/persist/recall/inject/consume)
- Rust module existence verification (memory_os/, unified_memory_v2/)
- False recall guard assessment
- External sync classification

### OUT OF SCOPE
- Wiring Rust modules to TypeScript (architecture change)
- Redesigning UnifiedMemoryService for disk persistence
- Provider reliability fix
- External sync implementation
- Broad memory subsystem redesign

## What Remains Out of Scope
- **Rust ↔ TS bridge**: Requires architecture redesign (persistence command wiring, IPC expansion)
- **Provider reliability**: Requires provider infrastructure fix
- **External sync**: BLOCKED_ENV, requires TURSO config
- **Encrypted vault**: Memory Vault exists but not part of LTM runtime path