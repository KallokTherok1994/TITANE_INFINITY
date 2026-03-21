# Gates Report — v28.7.0

| Gate | Status | Evidence |
|------|--------|----------|
| G_TSC | PASS | tsc --noEmit exit 0 |
| G_ESLINT | PASS | prior session, no src changes |
| G_VITEST | PASS | 3399/3399 tests pass |
| G_CARGO_TEST | PASS | 4463/4463 tests pass, 7 ignored |
| G_NATIVE_BINARY_FRESHNESS | PASS | FRESH_RELEASE_BINARY — binary MTIME >= buildInputs |
| G_VERIFY_INSTRUCTIONS | PASS | PASS=20 FAIL=0 |
| G_AH_RECURRENCE | PASS | G_AH_RECURRENCE_GUARD_PASS (515 entries) |
| G_ARTIFACTS_PRESENT | PASS | AppImage 88M + deb 18M + rpm 18M confirmed |
| G_CHECKSUMS_RECORDED | PASS | RELEASE_ARTIFACTS_CHECKSUMS_28.7.0.txt |
| G_ROLLBACK_AVAILABLE | PASS | git revert HEAD documented |
| G_SEAL_FILE_CREATED | PASS | RELEASE_v28.7.0_SEALED.txt |

All 11 gates: PASS
