# PRODUCTION RELEASE v28.36.0

**Date:** 2026-03-21 | **Status:** SEALED

## Gates
| Gate | Result |
|------|--------|
| tsc --noEmit | PASS |
| vitest run | 3399/3399 PASS |
| cargo test --lib | 4463/4463 PASS |
| cargo tauri build | exit 0 — 3 bundles |
| verify-native-binary-freshness | PASS |
| verify_instructions | PASS=20 FAIL=0 |
| detect_recurrence | G_AH_RECURRENCE_GUARD_PASS entries=526 |

## Artifacts
| File | SHA256 |
|------|--------|
| TITANE-Infinity_28.36.0_amd64.AppImage | 7f59b2c528e2209fa99d7dc29898df6d366663361dce23bf742c8fae4d604bec |
| TITANE-Infinity_28.36.0_amd64.deb | 9127648fd71ad101618a11cda0b3c5eb61a64b021412b2ed4e955988b2eb1e57 |
| TITANE-Infinity-28.36.0-1.x86_64.rpm | 2cdc41dac2117f00163ca26d6478661f31f5f7fa4728f1c27c6730627075e455 |

## Verdict
**STABLE → SEALED**
