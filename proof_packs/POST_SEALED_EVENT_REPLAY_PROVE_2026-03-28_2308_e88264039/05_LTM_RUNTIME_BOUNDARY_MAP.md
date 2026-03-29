# LTM_RUNTIME_BOUNDARY_MAP

## Canonical local memory (PROVEN)
- Canonical store: JSON files (snapshots.json + events.json)
- Location: ~/.local/share/TITANE_INFINITY/persistence/
- Events: 3 events after P1.11 (module=memory, append-only)
- Snapshots: 4 snapshots from P1.10d
- Status: PROVEN

## Derived/index layers (OUT OF SCOPE this cycle)
- in-memory EventLog (event_ids HashSet): ephemeral, per-process, derived from file
- in-memory SnapshotManager: ephemeral, per-process
- Both are re-loaded from files on each PERSISTENCE_ENGINE init
- Status: WIRED (used correctly for idempotence checks), not explicitly proven at runtime

## Event replay influence boundary (PROVEN)
- apply_event_to_state operates on SingularityState (shallow fields only)
- "memory" events: state.memory.total_memories += 1, state.memory.last_update_ms = ts
- "xp" events: state.metrics.ticks += amount
- "progress" events: state.cognition.depth = level
- "knowledge" events: state.memory.total_memories += 1, state.cognition.active_thoughts += 1
- "settings" events: state.metrics.last_update_ms = ts
- None of these reach LTM disk storage or AES-256-GCM encrypted layer
- Status: Boundary is CLEAR — event replay does not touch LTM

## What remains out of scope
- LTM AES-256-GCM layer (not tested in mock mode)
- UnifiedMemory STM/MTM item storage (not modified by event replay)
- db_service.rs (Conversation OS event store — separate from persistence engine)
- agenda/storage.rs (agenda_events.json — separate subsystem)
- semantic/vector_store.rs (index reconstruction — separate subsystem)
- External sync adapter (BLOCKED_ENV)
- Event replay for "xp", "progress", "knowledge", "settings" modules (wired but not runtime-exercised)

## LTM summary
LTM is not touched by the event path proven in this cycle.
The replay boundary is at SingularityState shallow fields.
LTM proof is explicitly out of scope and should remain a separate future cycle.
