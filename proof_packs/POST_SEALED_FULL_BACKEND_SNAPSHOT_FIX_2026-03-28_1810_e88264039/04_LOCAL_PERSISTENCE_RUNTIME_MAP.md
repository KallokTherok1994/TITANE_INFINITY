# LOCAL_PERSISTENCE_RUNTIME_MAP

## Canonical Store
- Implementation: JSON files (not SQLite — see database.rs comment "Migrate to rusqlite")
- Events: ~/.local/share/TITANE_INFINITY/persistence/titan_events.events.json
- Snapshots: ~/.local/share/TITANE_INFINITY/persistence/titan_events.snapshots.json
- Current state: files EXIST, both EMPTY (never exercised by Tauri app)
- Status: QUALIFIED (prior cycles) + accessible in this session

## Append-Only Events
- titan_persist_event → PersistenceEngine.persist_event → DB.insert_event → events.json
- status.events_persisted incremented ✓
- Status: PROVEN (prior cycles)

## Snapshot Emission
- titan_force_snapshot_current (mock): SingularityState::default() → Snapshot::from_state
- Snapshot: compress(serde_json::to_vec(state)) + SHA256 checksum
- DB.save_snapshot: base64(compressed_blob) → snapshots.json (keep last 10)
- status.snapshots_created += 1 ✓ (P1.10c fix)
- Serialization roundtrip: PROVEN by test_snapshot_default_state_roundtrip
- DB file layer: WIRED, accessible at known path
- Status: UNBLOCKED (code + test proven; DB layer write not yet exercised at runtime)

## Restore Path
- titan_load_state → PersistenceEngine.load_latest_state → DB.load_latest_snapshot + event replay
- titan_recover_state → identical to load_latest_state (same implementation)
- titan_list_snapshots → DB.list_snapshots
- Status: WIRED_BUT_UNPROVEN (code complete, runtime not executed)

## No-Loss Comparison
- Pre-snapshot: hashJson(titan_load_state()) or hashJson(titan_recover_state())
- Post-snapshot: hashJson(titan_recover_state())
- Equality required: Snapshot::to_state() → serde_json → JS JSON roundtrip
- Roundtrip proven: test_snapshot_default_state_roundtrip (PASS)
- Status: WIRED — provable after Tauri app runtime

## DB Layer Detail
- save_snapshot: read file → append record → write tmp → atomic rename
- load_latest_snapshot: read file → take last record → decode base64 → decompress
- Concurrency: Mutex<Option<PathBuf>> (minimal guard)
- Note: Production comment says "Migrate to rusqlite" — current impl is file-based JSON
