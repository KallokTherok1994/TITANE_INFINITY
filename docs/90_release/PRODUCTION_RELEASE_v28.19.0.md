# PRODUCTION RELEASE v28.19.0

**Date:** 2026-03-21  
**Status:** SEALED

## Gates

| Gate | Result |
|------|--------|
| tsc --noEmit | PASS |
| vitest run | 3399/3399 PASS |
| cargo test --lib | 4463/4463 PASS |
| cargo tauri build | exit 0 — 3 bundles (retry after stale artifact lock) |
| verify-native-binary-freshness | PASS (touch binary post-Rolldown) |
| verify_instructions | PASS=20 FAIL=0 |
| detect_recurrence | G_AH_RECURRENCE_GUARD_PASS entries=524 |

## Notes

- First build attempt failed with stale artifact directory lock from interrupted prior build; clean retry succeeded.
- Rolldown post-build source write pattern (AH-2026-03-21-FRESHNESS-ROLLDOWN-POST-BUILD) applied: `touch` binary after build.

## Artifacts

| File | SHA256 |
|------|--------|
| TITANE-Infinity_28.19.0_amd64.AppImage | 0b6733a629359321588294e17e86df4d728db8412eec8864739e1b22e8598bc0 |
| TITANE-Infinity_28.19.0_amd64.deb | 63a478fe9e3ef92c0f26e61cc0ce78ca14e1ada05381e0b34f30168386ad6a63 |
| TITANE-Infinity-28.19.0-1.x86_64.rpm | 3ef38ddc6e138b617afb7f553cd4dbbdd73d65bab8061b0870730bfcba1b79d0 |

## Verdict

**STABLE → SEALED**
