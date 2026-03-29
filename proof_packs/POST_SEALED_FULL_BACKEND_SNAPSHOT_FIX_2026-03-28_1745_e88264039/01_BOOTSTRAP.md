# BOOTSTRAP

## HEAD
e88264039

## Branch
MAIN

## Version
28.88.0 (package.json + Cargo.toml)

## git status (relevant diffs)
- src-tauri/capabilities/persistence.json — titan_force_snapshot_current added to capability list
- src-tauri/src/main.rs — titan_force_snapshot_current registered as Tauri command
- src-tauri/src/persistence/commands.rs — new command added (full + mock stubs)
- src-tauri/src/system/persona_engine/mod.rs — lock_or_recover! macro call fix
- src-tauri/tauri.conf.json — titan_force_snapshot_current added to allowlist

## Sentinel validity
VALID — working tree diffs are all accounted for and classified.
No unauthorized mutations detected beyond the registered product trigger.

## Product trigger classification
PRESENT — src-tauri diffs confirm titan_force_snapshot_current was added but mock stub
was non-functional (returned error). This is the trigger that blocked snapshot emission.

## Cargo features
default = ["custom-protocol", "mock"]
mock = []  — active in default build
full = []  — requires explicit --features full --no-default-features

## Snapshot emission: full-backend required?
PARTIALLY — `titan_force_snapshot_current` (full path) requires AIChatState which is
only available with feature="full" + not(feature="mock"). However, the persistence engine
itself (PERSISTENCE_ENGINE, force_snapshot) works in all feature modes.
The fix: mock stub now calls PERSISTENCE_ENGINE.force_snapshot(SingularityState::default()).

## Restore/no-loss runnable?
YES — after fix, the harness can:
1. Emit snapshot via titan_force_snapshot_current (mock: default state)
2. Load state via titan_load_state
3. Snapshot again via titan_force_snapshot
4. Recover via titan_recover_state
5. Compare hashes

## External sync
BLOCKED_ENV — TURSO_URL / SYNC_TOKEN not set.

## Recommended lane
LANE C — APPLY_BOUNDED_FULL_BACKEND_FIX (selected and executed)
