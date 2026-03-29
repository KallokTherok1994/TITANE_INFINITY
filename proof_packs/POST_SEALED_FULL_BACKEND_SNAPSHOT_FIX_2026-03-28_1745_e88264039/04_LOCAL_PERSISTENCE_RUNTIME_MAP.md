# LOCAL_PERSISTENCE_RUNTIME_MAP

## Canonical Store
- SQLite via PERSISTENCE_ENGINE (global RwLock<PersistenceEngine>)
- DB path: ~/.titane/persistence/*.sqlite (initialized on titan_persistence_init)
- Status: QUALIFIED (proven in prior cycles)

## Append-Only Events
- titan_persist_event → PERSISTENCE_ENGINE.persist_event → DB.save_event
- status.events_persisted incremented ✓
- Status: PROVEN (prior cycles)

## Snapshot Emission
- titan_force_snapshot(state_json) → works in all modes (no feature gate)
- titan_force_snapshot_current → FIXED (mock: default state, full: live engine state)
- PersistenceEngine.force_snapshot → DB.save_snapshot + snapshot_manager.record_snapshot
- status.snapshots_created now incremented ✓ (this cycle fix)
- Status: UNBLOCKED (after this cycle's fix)

## Restore Path
- titan_load_state → load_latest_state (snapshot + event replay)
- titan_recover_state → identical to load_latest_state
- titan_list_snapshots → list_snapshots from DB
- Status: WIRED — runnable after snapshot emission (harness can execute)

## No-Loss Comparison Path
- Pre-snapshot hash: hashJson(baselineState) from titan_load_state
- Post-snapshot hash: hashJson(titan_recover_state())
- No events between the two snapshots = deterministic recovery
- Status: WIRED — provable in mock mode with bounded harness

## Full-Engine State Capture (full feature only)
- AIChatState.core_collection.engine().snapshot()
- Requires: feature = "full" + not(feature = "mock")
- Full-backend build: 7 pre-existing errors (BROKEN — unrelated to this fix)
- Status: BLOCKED (pre-existing full-feature build failures)

## Initialization Sequence
1. titan_persistence_init → PersistenceEngine::initialize → SQLite open/create
2. titan_force_snapshot_current → snapshot #1 (default state in mock)
3. titan_load_state → returns snapshot #1's state
4. titan_force_snapshot(json) → snapshot #2
5. titan_recover_state → returns snapshot #2's state (+ event replay)
6. titan_get_persistence_status → snapshots_created = 2
