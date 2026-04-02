# 07_GATES_REPORT

## Mandatory Governance Gates

- `bash scripts/autoheal/detect_recurrence.sh` -> `PASS` (`entries=206`)
- `bash scripts/verify_instructions.sh` -> `PASS` (`SUMMARY: PASS=20 FAIL=0`)

## Build / Runtime Validation

- `cargo build --release` (`src-tauri`) -> `PASS`
- WDIO S1 baseline -> `PASS`
- WDIO S2 nominal x3 -> `PASS`
- WDIO S3 forced degraded -> `PASS`
- WDIO UI proof -> `PASS`
- `pnpm run lint -- src/lib/tauriClient.ts` -> `PASS` (no lint error emitted)

## Additional Check (Non-blocking for timeout patch)

- `cargo test offline_sim_disabled_for_unset_and_falsey_values` (and second test) -> `BLOCKED`
- Reason: unrelated compile errors in `tests/omega_p2_performance_test.rs` (`OmegaConversationBridge::new` arity mismatch), outside touched files.

Overall gate status for this timeout tuning scope: `PASS`
