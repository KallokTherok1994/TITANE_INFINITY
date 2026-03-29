# REPLAY_DEPENDENCY_MAP

## Replay path

```
titan_load_state (IPC)
  └── PERSISTENCE_ENGINE.read().await
      └── load_latest_state(&self)
          ├── db.load_latest_snapshot() → Snapshot → to_state() → SingularityState S0
          └── db.load_events_since(snapshot.timestamp) → Vec<TitanEvent>
              └── for each event: apply_event_to_state(&mut S0, event)
                  → returns S0 + all events with timestamp > snapshot.timestamp
```

## apply_event_to_state reducer map

| Module | Action | State field mutated | Observed in proof |
|--------|--------|---------------------|-------------------|
| "xp" | "add" | state.metrics.ticks += amount | NOT exercised P1.11 |
| "memory" | "add" | state.memory.total_memories += 1 | PROVEN P1.11 |
| "memory" | any | state.memory.last_update_ms = event.timestamp | PROVEN P1.11 |
| "progress" | any | state.cognition.depth = level.min(10) | NOT exercised P1.11 |
| "knowledge" | any | state.memory.total_memories += 1, state.cognition.active_thoughts += 1 | NOT exercised P1.11 |
| "settings" | any | state.metrics.last_update_ms = event.timestamp | NOT exercised P1.11 |
| any | any | state.last_sync_ms = event.timestamp | PROVEN P1.11 |

## Replay filter

- Condition: `event.timestamp > snapshot.timestamp`
- P1.11 events: ts=[1774739078237, 1774739194213, 1774739259729]
- P1.10d snapshot[3]: ts=1774737743232
- All 3 events satisfy ts > 1774737743232 ✓ (all replayed correctly)

## Comparison method

JavaScript assertion:
```javascript
assert.equal(postMemoryCount, preMemoryCount + 1)
```
Direct field comparison: `state.memory.total_memories` before and after event emission + replay.

## Monotonic proof (cross-run replay)

| Run | preMemoryCount | Events loaded from file | Expected | postMemoryCount |
|-----|---------------|------------------------|----------|-----------------|
| 1 | 0 | 0 prior events | 0+1=1 | 1 ✓ |
| 2r | 1 | 1 prior event | 1+1=2 | 2 ✓ |
| 3 | 2 | 2 prior events | 2+1=3 | 3 ✓ |

Each run picks up ALL prior events from the file and replays them on top of snap[3].
This proves: events survive process restart, are loaded correctly, replay is deterministic.

## Replay path status

| Step | Owner | Status |
|------|-------|--------|
| db.load_latest_snapshot() | PersistenceDB | PROVEN (P1.10d) |
| db.load_events_since(ts) | PersistenceDB | PROVEN (P1.11) |
| apply_event_to_state("memory") | PersistenceEngine | PROVEN (P1.11) |
| apply_event_to_state("xp") | PersistenceEngine | WIRED_BUT_UNPROVEN |
| apply_event_to_state("progress") | PersistenceEngine | WIRED_BUT_UNPROVEN |
| apply_event_to_state("knowledge") | PersistenceEngine | WIRED_BUT_UNPROVEN |
| apply_event_to_state("settings") | PersistenceEngine | WIRED_BUT_UNPROVEN |

## LTM replay influence boundary

- `apply_event_to_state` only mutates shallow SingularityState fields (metrics.ticks, memory.total_memories, cognition.depth, etc.)
- Does NOT reach LTM disk storage
- Does NOT reach AES-256-GCM encrypted LTM layer
- LTM remains out of scope for event replay proof

## Status: PROVEN (for "memory" module replay path)
