# REDUCER_MAP — P1.12

## Canonical reducer table (from `apply_event_to_state` in `src-tauri/src/persistence/mod.rs`)

| module | event_type | State mutation | Field type | Default |
|--------|-----------|----------------|------------|---------|
| `"memory"` | `"add"` | `state.memory.total_memories += 1` + `state.last_sync_ms = ts` | u64 | 0 |
| `"xp"` | any | `state.metrics.ticks += payload["amount"] as u64` + `state.last_sync_ms = ts` | u64 | 0 |
| `"progress"` | any | `state.cognition.depth = (payload["level"] as u8).min(10)` + `state.last_sync_ms = ts` | u8 | 0 |
| `"knowledge"` | any | `state.memory.total_memories += 1` + `state.cognition.active_thoughts += 1` + `state.last_sync_ms = ts` | u64 / u32 | 0 / 0 |
| `"settings"` | any | `state.metrics.last_update_ms = event.timestamp` + `state.last_sync_ms = ts` | u64 | now() |
| any other | — | `state.last_sync_ms = ts` only | — | — |

## Proof property per reducer

### xp
- **Emit**: `{ module: "xp", event_type: "gain", payload: { amount: 100 } }`
- **Assert**: `postState.metrics.ticks === preState.metrics.ticks + 100`
- **Cross-run**: monotonically increasing by 100 each run

### progress
- **Emit**: `{ module: "progress", event_type: "set", payload: { level: 7 } }`
- **Assert**: `postState.cognition.depth === 7`
- **Cross-run**: idempotent (always 7 after replay of latest progress event with level=7)

### knowledge
- **Emit**: `{ module: "knowledge", event_type: "learn", payload: {} }`
- **Assert**: `postState.memory.total_memories === preState.memory.total_memories + 1` AND `postState.cognition.active_thoughts === preState.cognition.active_thoughts + 1`
- **Cross-run**: monotonically increasing by 1 each run for both fields

### settings
- **Emit**: `{ module: "settings", event_type: "update", payload: {} }` (last in batch)
- **Assert**: `postState.metrics.last_update_ms > preState.metrics.last_update_ms` AND `postState.metrics.last_update_ms === postState.last_sync_ms`
- **Cross-run**: always newer timestamp; identity with last_sync_ms holds because settings is emitted last

## Batch emit order

1. xp (amount=100)
2. progress (level=7)
3. knowledge (payload={})
4. settings (payload={}) ← last, so its timestamp = last_sync_ms after replay

## Settings identity property

`settings` event is always emitted last. `titan_persist_event` sets `state.last_sync_ms = event.timestamp` for every event. After replay of the full batch, `last_sync_ms` = timestamp of last event = settings event timestamp. The settings reducer also sets `state.metrics.last_update_ms = event.timestamp`. Therefore:

**`postState.metrics.last_update_ms === postState.last_sync_ms`**

This holds if and only if the settings reducer is correctly applied AND no later event was emitted after it.
