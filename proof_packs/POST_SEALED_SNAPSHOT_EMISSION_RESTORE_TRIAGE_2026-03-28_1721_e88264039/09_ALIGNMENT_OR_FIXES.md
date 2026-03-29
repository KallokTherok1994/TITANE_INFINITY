# ALIGNMENT_OR_FIXES

Applied (bounded) alignment
- Added `titan_force_snapshot_current` IPC command to attempt snapshot emission from the current engine when full backend is enabled.
- Mock/not-full builds return explicit error to prevent false snapshot claims.

Files
- src-tauri/src/persistence/commands.rs
- src-tauri/src/system/persona_engine/mod.rs
- src-tauri/tauri.conf.json
- src-tauri/capabilities/persistence.json
- src-tauri/src/main.rs
- src/lib/security.ts

Outcome
- Snapshot emission still blocked in mock backend; requires full backend.
