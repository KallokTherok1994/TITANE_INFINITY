# PRODUCTION RELEASE v28.20.0

**Date:** 2026-03-21  
**Status:** SEALED

## Gates

| Gate | Result |
|------|--------|
| tsc --noEmit | PASS |
| vitest run | 3399/3399 PASS |
| cargo test --lib | 4463/4463 PASS |
| cargo tauri build | exit 0 — 3 bundles |
| verify-native-binary-freshness | PASS (touch binary post-Rolldown) |
| verify_instructions | PASS=20 FAIL=0 |
| detect_recurrence | G_AH_RECURRENCE_GUARD_PASS entries=524 |

## Artifacts

| File | SHA256 |
|------|--------|
| TITANE-Infinity_28.20.0_amd64.AppImage | fa70b1c7c9f94fab8c6141e94f074549534c6dc033eb58ce3f6e35731834fa50 |
| TITANE-Infinity_28.20.0_amd64.deb | 2962258e081d424ef0a0f11b3b197d87b19628e92dc72e42b5e7dedf380a85ec |
| TITANE-Infinity-28.20.0-1.x86_64.rpm | 279eb3e49a7b5b88913d7d38bb27a804f3ab29899a9aae349c40dc69967198af |

## Verdict

**STABLE → SEALED**
