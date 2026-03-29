# MAPPING — P1.12

## REDUCER_DISPATCH_MAP

```
titan_persist_event(TitanEventDto)
  └─► PersistenceEngine::persist_event()            [src-tauri/src/persistence/mod.rs]
       ├─ db.insert_event(event)                    [src-tauri/src/persistence/database.rs]
       │    └─ events.json (atomic write)
       ├─ event_log.push(event)                     [in-memory]
       ├─ events_persisted += 1                     [in-memory counter]
       └─ dirty = true

titan_load_state()
  └─► PersistenceEngine::load_latest_state()        [src-tauri/src/persistence/mod.rs]
       ├─ db.load_latest_snapshot()                 → Snapshot or default
       │    └─ snapshot.to_state()                  → SingularityState base
       └─ db.load_events_since(snapshot.timestamp)  → Vec<TitanEvent>
            └─ for each event: apply_event_to_state()
                 ├─ "xp"       → state.metrics.ticks += payload["amount"]
                 ├─ "progress" → state.cognition.depth = payload["level"].min(10)
                 ├─ "knowledge"→ state.memory.total_memories += 1
                 │               state.cognition.active_thoughts += 1
                 ├─ "settings" → state.metrics.last_update_ms = event.timestamp
                 ├─ "memory"   → state.memory.total_memories += 1
                 └─ any        → state.last_sync_ms = event.timestamp
```

## FIELD_LOCATION_MAP

| Field | Struct | File |
|-------|--------|------|
| `metrics.ticks` | `EngineMetrics` | `src-tauri/src/core/types.rs:91` |
| `metrics.last_update_ms` | `EngineMetrics` | `src-tauri/src/core/types.rs` |
| `cognition.depth` | `CognitionState` | `src-tauri/src/core/state.rs:319` |
| `cognition.active_thoughts` | `CognitionState` | `src-tauri/src/core/state.rs:317` |
| `memory.total_memories` | `UnifiedMemory` | `src-tauri/src/core/modules/unified_memory.rs:39` |
| `last_sync_ms` | `SingularityState` | `src-tauri/src/core/state.rs` |

## IPC_REGISTRATION_MAP

| Command | Registration | Line |
|---------|-------------|------|
| `titan_persist_event` | `main.rs` | 2220 |
| `titan_persist_event` | `capabilities/persistence.json` | 15 |
| `titan_load_state` | `main.rs` | ~2210 |
| `titan_get_persistence_status` | `main.rs` | ~2215 |

## PROOF_DEPENDENCY_MAP

```
P1.12 (multi-reducer replay)
  depends on: P1.11 (titan_persist_event IPC proven)
  depends on: P1.10c (binary built with correct persistence engine)
  depends on: P1.10d (snapshot+restore path proven — load_latest_state baseline)
  extends: LOCAL_EVENT_REPLAY_PROOF_SPEC.md §3 (replay proof rules)
```
