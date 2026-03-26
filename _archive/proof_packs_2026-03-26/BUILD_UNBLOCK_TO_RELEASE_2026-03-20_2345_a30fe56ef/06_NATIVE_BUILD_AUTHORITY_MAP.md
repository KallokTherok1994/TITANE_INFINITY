# 06 NATIVE BUILD AUTHORITY MAP
Build command: pnpm exec tauri build (tauri-cli 2.10.0, Node 22.22.1)
Build time: 9 minutes 04 seconds
Compile result: Finished `release` profile [optimized] target(s) — EXIT 0

## Artifacts produced (this session, fresh)
| Artifact | Size | Timestamp |
|----------|------|-----------|
| titane-infinity (binary) | 41M | 2026-03-20 23:44:12 |
| TITANE-Infinity_28.5.0_amd64.AppImage | 90M | 2026-03-20 23:44:12 |
| TITANE-Infinity_28.5.0_amd64.deb | 21M | 2026-03-20 23:42:00 |
| TITANE-Infinity-28.5.0-1.x86_64.rpm | 21M | 2026-03-20 23:42:20 |

## Freshness verdict
Binary built AFTER HEAD commit (a30fe56ef at 23:32, binary at 23:44) — FRESH ✅
HEAD-only change was RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt (no Rust/TS source change).

## Stale artifact risk
dist-28.0.0.tar.gz: STALE — do not use.
Old 28.0.0 .deb in bundle/deb/: STALE — superseded by 28.5.0 artifacts.

G_NATIVE_BUILD_AUTHORITY=PASS
