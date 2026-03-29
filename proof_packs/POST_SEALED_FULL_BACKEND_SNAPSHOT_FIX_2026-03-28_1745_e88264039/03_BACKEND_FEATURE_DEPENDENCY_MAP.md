# BACKEND_FEATURE_DEPENDENCY_MAP

## Snapshot Emission Path

| Command | Feature Gate | Dependency | Mock Available |
|---------|-------------|------------|----------------|
| titan_force_snapshot(state_json) | NONE | PERSISTENCE_ENGINE | YES |
| titan_force_snapshot_current (full path) | full + !mock | AIChatState.core_collection.engine() | NO |
| titan_force_snapshot_current (mock path — FIXED) | mock or !full | SingularityState::default() | YES (after fix) |

## Required Full Features for True Current-State Snapshot
- AIChatState: registered only when feature="full" + not(feature="mock")
- core_collection.engine(): requires full engine initialization
- engine.snapshot(): requires live SingularityEngine running

## Mock Path Limits (before fix)
- Returned Err("requires full backend") — BLOCKS the restore harness
- PERSISTENCE_ENGINE itself is available in all modes (no feature gate)
- SingularityState implements Default + Serialize + Deserialize in all modes

## Mock Path Limits (after fix)
- Emits SingularityState::default() as snapshot — harness can proceed
- Recovered state will be the default state (not a live engine state)
- Hash comparison: baselineHash === recoveredHash (both derived from same default)
- This proves the persistence path, NOT the full-engine state capture path

## Restore Path Dependency
1. titan_persistence_init — no gate
2. titan_list_snapshots — no gate
3. titan_force_snapshot_current — FIXED (mock: default state)
4. titan_load_state — no gate
5. titan_force_snapshot(json) — no gate
6. titan_recover_state — no gate
7. titan_get_persistence_status — no gate (snapshots_created now incremented — FIXED)

## No-Loss Proof Dependency
- Requires: pre-snapshot state, post-snapshot state, recovered state
- Hash comparison requires consistent serialization roundtrip
- SingularityState serde roundtrip: stable (no floats at top level, timestamps as u64)

## Counter Fix
- status.snapshots_created was never incremented → FIXED
- Pattern follows status.events_persisted (incremented in persist_event)
- Now incremented in force_snapshot after snapshot_manager.record_snapshot

## Full-Backend Build Status
- 7 pre-existing compile errors in full feature build (E0428, E0432, E0433, E0599, E0716)
- These are unrelated to snapshot emission path
- Full-backend build is NOT a prerequisite for this bounded fix
