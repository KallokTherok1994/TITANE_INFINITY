# LANE_SELECTION

## Selected Lane: C — APPLY_BOUNDED_FULL_BACKEND_FIX

## Justification

All four LANE C prerequisites are satisfied:

1. **Exact backend breakpoint is identified**: ✓
   - BP1: mock stub in commands.rs returns error instead of emitting snapshot
   - BP2: snapshots_created counter never incremented in force_snapshot

2. **Full-backend requirement is proven**: ✓ (for the live-engine path)
   The full AIChatState path truly requires feature="full" + not(feature="mock").
   The PERSISTENCE_ENGINE path works in all modes — the mock fix is valid.

3. **One bounded fix candidate is real**: ✓
   - Fix 1: 6 lines in commands.rs (mock stub body)
   - Fix 2: 1 line in mod.rs (snapshots_created += 1)
   Total: 7 lines changed

4. **Rollback is simple**: ✓
   `git restore src-tauri/src/persistence/commands.rs src-tauri/src/persistence/mod.rs`

5. **Immediate reproof is possible**: ✓
   cargo check passes, 85 persistence tests pass.
   E2E runtime proof requires desktop execution (Tauri app build).

6. **No broad backend redesign needed**: ✓
   Changes are isolated to persistence layer.
   No provider, engine, IPC, or routing changes.

## Why not LANE A or B?
- Breakpoints were fully identified at discovery → no need for triage-only
- Fix was clearly safe and bounded → no need for probe-only

## Why not LANE D?
- PERSISTENCE_ENGINE works in mock mode
- Fix does not require full backend execution
