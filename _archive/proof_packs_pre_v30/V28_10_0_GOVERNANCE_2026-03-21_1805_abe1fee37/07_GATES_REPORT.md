| Gate | Status | Proof |
|------|--------|-------|
| tsc --noEmit | PASS | exit 0 |
| vitest run x3 | PASS | 3399/3399 each |
| cargo test --lib | PASS | 4463/4463 |
| G_NATIVE_BINARY_FRESHNESS | PASS | FRESH_RELEASE_BINARY |
| verify_instructions PASS=20 FAIL=0 | PASS | exit 0 |
| detect_recurrence G_AH_RECURRENCE_GUARD_PASS | PASS | 520 entries |
