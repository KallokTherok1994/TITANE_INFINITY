# PRODUCTION RELEASE v28.22.0

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
| TITANE-Infinity_28.22.0_amd64.AppImage | bbe89d3f9e99e7dcb4c01aa78124912ef9b90e05b1b6dd45f008ce6e1124a304 |
| TITANE-Infinity_28.22.0_amd64.deb | 94206ac4b021143f4c369c289aca1e19eb61e86ee41812f946ed560c34eec690 |
| TITANE-Infinity-28.22.0-1.x86_64.rpm | d79f0cd2e24449711fa61d3d9a7fe9ccf314851404d5274254b5a82990183b9d |

## Verdict
**STABLE → SEALED**
