# PRODUCTION RELEASE v28.25.0

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
| TITANE-Infinity_28.25.0_amd64.AppImage | ec9cafb72ace748d2ae1755c0a63cef30d17267b26a80fd4ef35d052d97e6da2 |
| TITANE-Infinity_28.25.0_amd64.deb | 1e0e7b3f720f65c388829c1795bd0395fd0121ce5ac99e4c8b160828348ac66f |
| TITANE-Infinity-28.25.0-1.x86_64.rpm | f56fb8131ed21709a5fb87605dab31f2689190ccb57301bd1de4189f1df3d572 |

## Verdict
**STABLE → SEALED**
