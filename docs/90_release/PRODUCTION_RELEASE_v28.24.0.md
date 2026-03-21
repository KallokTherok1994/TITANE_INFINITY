# PRODUCTION RELEASE v28.24.0

**Date:** 2026-03-21 | **Status:** SEALED

## Gates
| Gate | Result |
|------|--------|
| tsc --noEmit | PASS |
| vitest run | 3399/3399 PASS |
| cargo test --lib | 4463/4463 PASS |
| cargo tauri build | exit 0 — 3 bundles |
| verify-native-binary-freshness | PASS (touch post-Rolldown) |
| verify_instructions | PASS=20 FAIL=0 |
| detect_recurrence | G_AH_RECURRENCE_GUARD_PASS entries=524 |

## Artifacts
| File | SHA256 |
|------|--------|
| TITANE-Infinity_28.24.0_amd64.AppImage | 73a51647dc9dcf035bb17f5ba78b0da5e7d8209824539073c14e9e3c45099428 |
| TITANE-Infinity_28.24.0_amd64.deb | 2b09b74518b27710fa6a3ab5b8ba4f73c5279c4a0e9b6c88fc8021ec2630e412 |
| TITANE-Infinity-28.24.0-1.x86_64.rpm | 14659e88b59a0d4b8c955a6b47134ad54bad932a8a7179d7e1523739fe7164c7 |

## Verdict
**STABLE → SEALED**
