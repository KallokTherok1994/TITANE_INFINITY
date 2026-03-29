# BREAKPOINT_ANALYSIS

## BP1 — titan_force_snapshot_current mock stub returns error

**File**: src-tauri/src/persistence/commands.rs (lines 133-137, before fix)
**Root cause**: When `titan_force_snapshot_current` was added, the mock fallback was
written as a stub that rejects all calls with "requires full backend". The PERSISTENCE_ENGINE
is fully functional in mock mode; only the AIChatState dependency is absent.
**Impact**: The E2E restore harness calls `titan_force_snapshot_current` when no snapshots
exist. The IPC error causes `invokeTauriCommand` to throw, failing the test.
**Fix**: Mock stub now calls `PERSISTENCE_ENGINE.force_snapshot(SingularityState::default())`.
This emits a real snapshot to SQLite; the rest of the harness proceeds normally.
**Risk**: LOW — mock path only, default state is well-defined, no data loss possible.

## BP2 — status.snapshots_created never incremented

**File**: src-tauri/src/persistence/mod.rs (force_snapshot fn)
**Root cause**: `force_snapshot` updated `snapshot_manager.record_snapshot` and
`status.last_snapshot` but not `status.snapshots_created`. Pattern for `events_persisted`
(incremented in `persist_event`) was not applied to `snapshots_created`.
**Impact**: The E2E harness assertion `postStatus.snapshots_created >= preStatus.snapshots_created + 1`
always fails since the counter stays at 0 regardless of how many snapshots are created.
**Fix**: Add `self.status.snapshots_created += 1;` in `force_snapshot` after `record_snapshot`.
**Risk**: LOW — counter fix only, all 85 persistence tests pass, no API change.

## Verification
- cargo check (mock mode): PASS — 0 errors
- cargo test --lib -- persistence: PASS — 85/85
- Full-feature build: 7 pre-existing errors UNRELATED to this fix (E0428 etc.)
- These pre-existing full-feature errors are a separate concern for a future cycle.

## What remains blocked
- Full-engine state capture (AIChatState path): BLOCKED — 7 full-feature build errors
- External sync: BLOCKED_ENV — TURSO_URL not set
- No-loss proof via E2E runtime: NOT YET RUN (requires desktop E2E execution)
