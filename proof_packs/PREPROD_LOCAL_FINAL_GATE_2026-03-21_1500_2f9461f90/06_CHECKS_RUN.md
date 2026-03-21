# Checks Run

| Check | Command | Result |
|-------|---------|--------|
| G_NATIVE_BINARY_FRESHNESS | bash scripts/verify/verify-native-binary-freshness.sh | PASS (FRESH_RELEASE_BINARY) |
| G_VERIFY_INSTRUCTIONS | bash scripts/verify_instructions.sh | PASS=20 FAIL=0 |
| G_AH_RECURRENCE | bash scripts/autoheal/detect_recurrence.sh | G_AH_RECURRENCE_GUARD_PASS (511 entries) |
| vitest | pnpm test | 3399/3399 PASS |
| cargo test --lib | cargo test --lib | 4463 PASS, 0 FAIL (after fix) |
| cargo test --release | N/A — tauri_plugin_dialog linker error in test mode (pre-existing, not caused by changes) | SKIPPED (non-regression) |

## Notes
- `pnpm test` flaky: DesignCenter.truth-chain.test.tsx:88 passes when run alone — pre-existing suite-parallel contamination, NOT caused by this session's changes.
- `cargo test --release` linker failure is pre-existing: tauri_plugin_dialog native deps unavailable in test binary. The production binary (built via `tauri build`) is unaffected.
