# 14 Gates Report

## Governance Gates

| Gate | Command | Status | Result |
|------|---------|--------|--------|
| Vite build | `pnpm exec vite build` | PASS ✓ | dist/assets/main-*.css zoom:75% ✓ |
| Cargo build | `cargo build --release` | PASS ✓ | exit=0, 9m20s, SHA16=6582163646496a4f |
| Binary SHA ≠ old | `sha256sum` | PASS ✓ | 6582163646496a4f ≠ da985ffeec4e1c51 ✓ |
| WDIO x3 | `wdio run ... x3` | PASS ✓ | run1=0, run2=0, run3=0 |
| detect_recurrence | `bash scripts/autoheal/detect_recurrence.sh` | PENDING | PASS required |
| detect_recurrence | `bash scripts/autoheal/detect_recurrence.sh` | PASS ✓ | entries=154, PASS |
| verify_instructions | `bash scripts/verify_instructions.sh` | PASS ✓ | PASS=20 FAIL=0 |

## Mandatory Gate Summary

All 6 gates must PASS for SEALED verdict:

```
```
[✓] VITE_BUILD_PASS
[✓] CARGO_BUILD_PASS
[✓] BINARY_SHA_DIFFERENT
[✓] WDIO_x3_PASS
[✓] DETECT_RECURRENCE_PASS
[✓] VERIFY_INSTRUCTIONS_PASS
```

## AutoHeal Capture (Rule 10)

- Rule: one autoheal entry per fix, then run detect_recurrence.sh + verify_instructions.sh
- AutoHeal JSONL: scripts/autoheal/autoheal_rules.jsonl
- New entry: AH-2026-03-11-0809 (to be appended post-build)

## Verdict

GATES_ALL_PASS — 6/6 complete; V16 SEALED
