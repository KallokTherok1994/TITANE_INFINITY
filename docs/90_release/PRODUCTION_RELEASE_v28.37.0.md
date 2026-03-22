# PRODUCTION RELEASE v28.37.0

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
| detect_recurrence | G_AH_RECURRENCE_GUARD_PASS entries=527 |

## Artifacts
| File | SHA256 |
|------|--------|
| TITANE-Infinity_28.37.0_amd64.AppImage | e87305c40b690409e6ca238bba3697e3f73b718d465b04617f69c4cc3c1193f3 |
| TITANE-Infinity_28.37.0_amd64.deb | 65a2c1df4cc7ab67cf2a43d065dd12649cbb9525087e7e99bdce5eb2391f9427 |
| TITANE-Infinity-28.37.0-1.x86_64.rpm | 0272e0a5260471428496e1751c6d88b450ce061ae73d76f3cd4c83b815622b9e |

## Verdict
**STABLE → SEALED**
