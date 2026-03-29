# BOOTSTRAP — P1.12

## Entry state

### Runtime binary
- Path: `src-tauri/target/debug/titane-infinity`
- Built: 2026-03-28T18:30:00Z (P1.10c patch build)
- No rebuild needed for P1.12

### Persistence files on disk at P1.12 entry

**`~/.local/share/TITANE_INFINITY/persistence/titan_events.events.json`**
- 3 events (from P1.11 runs)
- All module=memory, event_type=add
- Timestamps: [1774739078237, 1774739194213, 1774739259729]

**`~/.local/share/TITANE_INFINITY/persistence/titan_events.snapshots.json`**
- 4 snapshots (from P1.10d runs)
- snap[3].timestamp = 1774737743232

### Pre-state loaded via `titan_load_state` at P1.12 Run 1 entry

```json
{
  "metrics": { "ticks": 0, "last_update_ms": 1774737315894 },
  "memory": { "total_memories": 3 },
  "cognition": { "depth": 0, "active_thoughts": 0 },
  "last_sync_ms": 1774739259729
}
```

Note: `total_memories=3` reflects the 3 memory events from P1.11 replayed from snapshot[3].

### IPC commands used

| Command | Purpose |
|---------|---------|
| `titan_persistence_init` | Initialize persistence engine |
| `titan_load_state` | Load snapshot + replay events → SingularityState |
| `titan_persist_event` | Emit a single event (append to events.json) |
| `titan_get_persistence_status` | Read counters (events_persisted, snapshots_created) |

### E2E gate

Test activated by: `TITANE_MULTI_REDUCER_PROOF=1`
Test file: `e2e/desktop/online-chat-proof-ui.wdio.test.js`
Test name: `'proves multi-reducer event replay coverage: xp / progress / knowledge / settings'`
Timeout: 120000ms per run
