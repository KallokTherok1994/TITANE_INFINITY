# LOCAL_PERSISTENCE_RUNTIME_PROOF_SPEC

## Proof Scenarios After This Fix

### S_SNAPSHOT_EMIT (mock mode)
- Pre-condition: DB initialized (titan_persistence_init called)
- Action: invoke titan_force_snapshot_current
- Expected: Ok(()) returned, snapshot saved to SQLite
- Verify: titan_list_snapshots returns 1+ entries
- Status: UNBLOCKED by this cycle's fix

### S_LOAD_STATE
- Pre-condition: S_SNAPSHOT_EMIT completed
- Action: invoke titan_load_state
- Expected: SingularityState returned (non-null)
- Verify: state is the default SingularityState (init_timestamp_ms, metrics.ticks=0, etc.)
- Status: UNBLOCKED

### S_RESTORE_ROUNDTRIP
- Pre-condition: S_LOAD_STATE completed
- Action:
  1. JSON-serialize loaded state (baselineJson)
  2. invoke titan_force_snapshot(stateJson: baselineJson)
  3. invoke titan_recover_state
- Expected: recoveredState matches baselineState
- Verify: SHA-256 hash equality
- Status: UNBLOCKED (no events between snapshots = deterministic)

### S_NO_LOSS_COUNTER
- Pre-condition: S_RESTORE_ROUNDTRIP completed
- Action: compare preStatus.snapshots_created vs postStatus.snapshots_created
- Expected: postStatus >= preStatus + 1 (for titan_force_snapshot call)
- Note: titan_force_snapshot_current also increments the counter (fix BP2)
- Status: UNBLOCKED by fix BP2

### S_NO_LOSS_EVENTS
- Pre-condition: S_RESTORE_ROUNDTRIP completed
- Action: compare preStatus.events_persisted vs postStatus.events_persisted
- Expected: events_persisted >= 0 (monotonic)
- Status: UNBLOCKED (no regression possible from snapshot-only ops)

## E2E Runtime Proof
All 5 scenarios above are wired into the E2E restore harness (online-chat-proof-ui.wdio.test.js).
Runtime proof requires: Tauri desktop app build + WDIO execution.
Build prerequisite: cargo build (default features, mock mode) + npm run build.
Status: WIRED — blocked only by desktop execution environment availability.

## What this proof does NOT cover
- Full-engine state capture (AIChatState.engine().snapshot()) — full-feature build broken
- External sync — BLOCKED_ENV
- No-loss across process restart — requires persistent SQLite (different test scenario)
