# LOCAL_PERSISTENCE_RUNTIME_MAP

## Canonical Store
- Implementation: JSON files (see database.rs — "Migrate to rusqlite" pending)
- Events: ~/.local/share/TITANE_INFINITY/persistence/titan_events.events.json
- Snapshots: ~/.local/share/TITANE_INFINITY/persistence/titan_events.snapshots.json
- Final state: 4 snapshots, 0 events
- All 4 snapshots: schema_version=1, blob_b64_len=932, state = SingularityState::default()
- Owner: PERSISTENCE_ENGINE (global Lazy<Arc<RwLock<PersistenceEngine>>>)
- Proof source: DB file inspection + runtime log
- Status: PROVEN

## Append-Only Events
- events.json: 0 events (no titan_persist_event calls during proof runs)
- events_persisted: 0 in all runs
- Append mechanism: WIRED, not exercised in restore proof cycle
- Status: WIRED_BUT_UNPROVEN (by design — restore harness doesn't generate events)

## Snapshot Emission (PROVEN at runtime)
- Run 1: titan_force_snapshot_current (no prior snapshots) → default state snapshot
  + titan_force_snapshot(baselineJson) → second snapshot
  preSnapshots=0 → postSnapshots=2
- Run 2, retry: titan_load_state (loads run1's snapshot) → skip titan_force_snapshot_current
  + titan_force_snapshot(baselineJson) → one new snapshot
  preSnapshots=N → postSnapshots=N+1
- snapshots_created counter: correctly 0→2 (run1) or 0→1 (subsequent runs)
- Owner: PERSISTENCE_ENGINE.force_snapshot + DB.save_snapshot
- Status: PROVEN

## Restore Path (PROVEN at runtime)
- titan_load_state → DB.load_latest_snapshot → Snapshot.to_state → SingularityState
- titan_recover_state → identical to load_latest_state
- No events to replay (events.json empty)
- baselineState retrieved from DB in all 3 successful runs
- Owner: PersistenceEngine.load_latest_state
- Status: PROVEN

## No-Loss Comparison (PROVEN at runtime)
- baselineHash = hashJson(baselineState) = SHA256(JSON.stringify(baselineState))
- recoveredHash = hashJson(recoveredState) = SHA256(JSON.stringify(recoveredState))
- baselineHash === recoveredHash in all 3 successful runs:
  d161cf82dcae711f2af2b90c9cd9f277fa152770c1bb7710f72e61a12c9f3a49
- Interpretation: No silent drop, no silent duplication, no field mutation
- Status: PROVEN

## Full Status Matrix
| Component | Owner | Status | Proof Source |
|-----------|-------|--------|-------------|
| Canonical JSON store | PersistenceDB | PROVEN | DB file: 4 snapshots |
| Snapshot emission | force_snapshot | PROVEN | E2E run1 log |
| Snapshot load | load_latest_state | PROVEN | E2E all runs |
| Restore path | recover_state | PROVEN | E2E all runs, hash equality |
| No-loss comparison | hashJson | PROVEN | E2E all runs, same hash |
| Event log | persist_event | WIRED_BUT_UNPROVEN | Not exercised |
| Event replay | apply_event_to_state | WIRED_BUT_UNPROVEN | Not exercised |
