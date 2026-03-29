# BACKEND_FEATURE_DEPENDENCY_MAP

## Snapshot Emission Path — PROVEN

| Step | Component | Feature Gate | Status |
|------|-----------|-------------|--------|
| titan_force_snapshot_current (full) | AIChatState.engine().snapshot() | full+!mock | BROKEN (full-build 7 errors) |
| titan_force_snapshot_current (mock, FIXED) | SingularityState::default() → PERSISTENCE_ENGINE | mock or !full | PROVEN (test + code) |
| SingularityState::default() | core/state.rs | none | PROVEN |
| Snapshot::from_state() | persistence/types.rs | none | PROVEN (test) |
| Snapshot::to_state() | persistence/types.rs | none | PROVEN (test) |
| Snapshot JSON roundtrip equality | types.rs test | none | PROVEN (test_snapshot_default_state_roundtrip) |
| PERSISTENCE_ENGINE.force_snapshot() | persistence/mod.rs | none | PROVEN (code + test) |
| status.snapshots_created incremented | persistence/mod.rs | none | PROVEN (test_snapshot_status_counter_pattern) |
| DB.save_snapshot() | persistence/database.rs | none | WIRED_BUT_UNPROVEN (JSON file layer, no runtime test) |
| DB.load_latest_snapshot() | persistence/database.rs | none | WIRED_BUT_UNPROVEN |

## Key proof: test_snapshot_default_state_roundtrip

```
SingularityState::default()
    → serde_json::to_string() = original_json
    → Snapshot::from_state(&original)   [serialize → gzip → sha256]
    → snapshot.verify_integrity()       PASS
    → snapshot.to_state()               [sha256 verify → gunzip → deserialize]
    → serde_json::to_string() = recovered_json
    → assert_eq!(original_json, recovered_json)  PASS
```

This mirrors exactly what the E2E JavaScript harness does:
```javascript
const baselineHash = hashJson(baselineState);   // SHA-256(JSON.stringify(state))
const recoveredHash = hashJson(recoveredState);  // SHA-256(JSON.stringify(recovered))
assert.equal(recoveredHash, baselineHash);
```

The roundtrip is deterministic because `SingularityState::default()` has no floating-point
precision issues at the top level (timestamps are u64, counts are u64/u32, enums are stable).

## Remaining blocker for full runtime proof
- PersistenceDB.save_snapshot() → PersistenceDB.load_latest_snapshot() roundtrip
  requires Tauri app initialization (DB path is fixed to ~./local/share/TITANE_INFINITY)
- This is a runtime environment requirement, not a code bug
