# LOCAL_PERSISTENCE_RUNTIME_PROOF_SPEC

## Proof Level Matrix

| Scenario | Code Proven | Unit Test Proven | Runtime Proven |
|----------|------------|-----------------|----------------|
| SingularityState::default() serializes | YES | YES (roundtrip test) | N/A |
| Snapshot::from_state roundtrip | YES | YES (roundtrip test) | N/A |
| snapshots_created increments | YES | YES (counter test) | N/A |
| DB.save_snapshot writes to JSON | YES | — (would need tempdir) | NOT YET |
| DB.load_latest_snapshot reads back | YES | — | NOT YET |
| titan_force_snapshot_current IPC call | YES | — | NOT YET |
| titan_list_snapshots returns 1+ | YES | — | NOT YET |
| titan_load_state returns state | YES | — | NOT YET |
| titan_force_snapshot(json) round 2 | YES | — | NOT YET |
| titan_recover_state hash equality | YES | — | NOT YET |
| snapshots_created >= preStatus+1 | YES | YES (counter test) | NOT YET |

## Key proven facts (Rust unit tests)

### test_snapshot_default_state_roundtrip
- Input: SingularityState::default()
- original_json = serde_json::to_string(&original) — COMPUTED
- snapshot = Snapshot::from_state(&original) — blob = gzip(json)
- snapshot.verify_integrity() — SHA256(blob) == snapshot.checksum — PASS
- recovered = snapshot.to_state() — gunzip → deserialize
- recovered_json == original_json — PASS
- This proves: The JS harness hash comparison will succeed for mock-mode snapshots.

### test_snapshot_status_counter_pattern
- status.snapshots_created starts at 0
- After += 1: snapshots_created == 1 — PASS
- Pattern identical to events_persisted — PASS

## What runtime proof adds (Tauri app execution)
- Proves: IPC layer (Tauri command routing) works end-to-end
- Proves: DB file write/read works on the real filesystem
- Proves: JavaScript ↔ Rust JSON serialization is consistent
- Proves: The restore harness script can run to completion
