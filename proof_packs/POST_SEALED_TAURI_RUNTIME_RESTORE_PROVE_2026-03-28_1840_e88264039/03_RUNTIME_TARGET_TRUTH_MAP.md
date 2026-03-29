# RUNTIME_TARGET_TRUTH_MAP

## Intended Tauri Target
- Binary: src-tauri/target/debug/titane-infinity
- Mode: embedded assets (tauri://localhost)
- Feature set: default = ["custom-protocol", "mock"]

## Launched Target
- Binary: src-tauri/target/debug/titane-infinity (fresh, 18:30, post-P1.10c)
- Driver: tauri-driver --port 4444
- Session: wry v0.54.4 linux
- Display: :1 (Xvfb)
- Session IDs observed: 5b794cbf (run1), new session per run

## Backend IPC Reachability
- titan_persistence_init: REACHABLE ✓
- titan_get_persistence_status: REACHABLE ✓ (returns PersistenceStatusDto)
- titan_list_snapshots: REACHABLE ✓ (returns Vec<SnapshotInfo>)
- titan_load_state: REACHABLE ✓ (returns SingularityState or null)
- titan_force_snapshot_current: REACHABLE ✓ (mock path, emits default state)
- titan_force_snapshot(stateJson): REACHABLE ✓ (takes JSON, stores snapshot)
- titan_recover_state: REACHABLE ✓ (returns SingularityState from latest snapshot)

## Freshness / Artifact Truth
- Binary built at: 2026-03-28 18:30:12 UTC-4
- P1.10c fixes committed to source at: 2026-03-28 ~17:45
- Binary is NEWER than source changes → includes all P1.10c fixes
- Binary policy verdict: FRESH_DEBUG_BINARY (workspaceAhead=false)

## WRY Stability
- Run 1, 2, retry: stable (session held through both tests)
- Run 3: WRY session invalidated after chat test, before restore test
- Classification: PRE-EXISTING instability (seen in prior cycles), not persistence-related
- Frequency: 1/4 runs (25%) — intermittent WRY crash

## Chat Proof (prerequisite for restore)
All 4 runs: singleTurnTest PASSED (chat response received from Ollama/gemma2:2b)
