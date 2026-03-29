# MISSION — P1.12

## Primary objective

Prove at runtime that the 4 reducers left WIRED_BUT_UNPROVEN after P1.11 correctly mutate `SingularityState` when their corresponding events are replayed via `load_latest_state()`.

## Reducers in scope

1. `"xp"` → `state.metrics.ticks += payload["amount"] as u64`
2. `"progress"` → `state.cognition.depth = (payload["level"] as u8).min(10)`
3. `"knowledge"` → `state.memory.total_memories += 1` + `state.cognition.active_thoughts += 1`
4. `"settings"` → `state.metrics.last_update_ms = event.timestamp`

## Out of scope

- `"memory"` reducer → proven P1.11
- External sync (BLOCKED_ENV, TURSO_URL absent)
- LTM encrypted layer (mock mode)
- Any reducer beyond the 5 defined in `apply_event_to_state`

## Proof standard

Same as P1.11: real Tauri binary, real IPC, real file I/O, real WebDriver session. X3 independent runs. No mocks.

## Prior state

At entry to P1.12:
- 3 events in `events.json` (from P1.11)
- 4 snapshots in `snapshots.json` (from P1.10d)
- `memory` reducer: PROVEN (P1.11)
- `xp`, `progress`, `knowledge`, `settings` reducers: WIRED_BUT_UNPROVEN

## Exit state

At exit from P1.12:
- 15 events in `events.json` (3 P1.11 + 12 P1.12: 4 events × 3 runs)
- All 5 reducers: PROVEN
- Local persistence proof matrix: COMPLETE for all current reducers
