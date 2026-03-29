# X3_RUNS

## Run configuration

- Harness: e2e/desktop/online-chat-proof-ui.wdio.test.js
- Runner: scripts/e2e/run-online-chat-proof-ui.sh
- Env: TITANE_RESTORE_PROOF=1, TITANE_NATIVE_BINARY_MODE=debug
- Binary: src-tauri/target/debug/titane-infinity (18:30, post-P1.10c)
- Driver: tauri-driver --port 4444
- Display: :1 (Xvfb)
- Ollama model: gemma2:2b

---

## Run 1 — Cold start

- Session: 5b794cbf
- preSnapshots: 0
- singleTurnTest: PASS (chat response from gemma2:2b)
- restoreProofTest flow:
  1. titan_persistence_init → OK
  2. titan_get_persistence_status → snapshots_created=0, events_persisted=0
  3. titan_list_snapshots → [] (empty)
  4. titan_load_state → null (no snapshots)
  5. titan_force_snapshot_current → OK (emits default state, snapshots_created→1)
  6. titan_load_state → SingularityState::default() (baselineState)
  7. baselineJson = JSON.stringify(baselineState)
  8. baselineHash = SHA256(baselineJson) = d161cf82dcae711f2af2b90c9cd9f277fa152770c1bb7710f72e61a12c9f3a49
  9. titan_force_snapshot({stateJson: baselineJson}) → OK (snapshots_created→2)
  10. titan_recover_state → recoveredState
  11. recoveredHash = hashJson(recoveredState) = d161cf82dcae711f2af2b90c9cd9f277fa152770c1bb7710f72e61a12c9f3a49
  12. assert baselineHash === recoveredHash → PASS
  13. postSnapshots: 2
- snapshots_created: 0→2
- events_persisted: 0
- Exit: 0 (PASS)

---

## Run 2 — Warm start (preSnapshots=2)

- Session: new session
- preSnapshots: 2
- singleTurnTest: PASS
- restoreProofTest flow:
  1. titan_persistence_init → OK
  2. titan_get_persistence_status → snapshots_created=0 (fresh process), events_persisted=0
  3. titan_list_snapshots → [snap1, snap2]
  4. titan_load_state → baselineState (loaded from latest snapshot)
  5. (preSnapshots>0 AND baselineState not null → skip force_snapshot_current)
  6. baselineJson = JSON.stringify(baselineState)
  7. baselineHash = d161cf82... (same state as run1)
  8. titan_force_snapshot({stateJson: baselineJson}) → OK (snapshots_created→1)
  9. titan_recover_state → recoveredState
  10. recoveredHash = d161cf82... → PASS
  11. postSnapshots: 3
- snapshots_created: 0→1
- events_persisted: 0
- Exit: 0 (PASS)

---

## Run 3 — WRY session invalidation (FAIL, non-persistence)

- Session: new session
- singleTurnTest: PASS (chat works)
- restoreProofTest: FAIL
  - Cause: WRY session invalidated between singleTurnTest and restoreProofTest
  - Error: session ID no longer valid
  - Classification: PRE-EXISTING WRY instability — not a persistence code failure
- Exit: 1 (FAIL — WRY)
- Persistence verdict: N/A (test did not reach persistence assertions)

---

## Run 3 Retry — Warm start (preSnapshots=3)

- Session: new session
- preSnapshots: 3
- singleTurnTest: PASS
- restoreProofTest flow:
  1. titan_persistence_init → OK
  2. titan_list_snapshots → [snap1, snap2, snap3]
  3. titan_load_state → baselineState (from latest)
  4. (preSnapshots>0 → skip force_snapshot_current)
  5. titan_force_snapshot({stateJson: baselineJson}) → OK (snapshots_created→1)
  6. titan_recover_state → recoveredState
  7. recoveredHash = d161cf82... → PASS
  8. postSnapshots: 4
- snapshots_created: 0→1
- events_persisted: 0
- Exit: 0 (PASS)

---

## X3 summary table

| Run | preSnaps | postSnaps | baselineHash | recoveredHash | snapshots_created | Exit |
|-----|----------|-----------|--------------|---------------|-------------------|------|
| 1 | 0 | 2 | d161cf82... | d161cf82... | 0→2 | 0 PASS |
| 2 | 2 | 3 | d161cf82... | d161cf82... | 0→1 | 0 PASS |
| 3 | — | — | — | — | — | 1 WRY |
| 3r | 3 | 4 | d161cf82... | d161cf82... | 0→1 | 0 PASS |

3 successful runs. Hash constant across all runs. DB: 4 snapshots total.

## Canonical hash

d161cf82dcae711f2af2b90c9cd9f277fa152770c1bb7710f72e61a12c9f3a49

This hash is the SHA256 of JSON.stringify(SingularityState::default()) as serialized by Rust serde_json and roundtripped through the persistence chain. Stability across runs confirms deterministic serialization with no drift.
