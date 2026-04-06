# PRODUCTION RELEASE v28.23.0

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
| TITANE-Infinity_28.23.0_amd64.AppImage | c8cdb67d82254e9c8c9c10d88641fdc78fb16aceee7f8c44261328fba54b4766 |
| TITANE-Infinity_28.23.0_amd64.deb | 7a7a358b905ad6e5d231e8c96f6a329756267636a07950e9c4d7d753ebbeb586 |
| TITANE-Infinity-28.23.0-1.x86_64.rpm | 2810138c78b75af44ac1fbff2a0ecf0d59af425cefce1ebafa3bf3ab61fb6c09 |

## Verdict
**STABLE → SEALED**
