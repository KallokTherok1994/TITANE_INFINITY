# 02 Stale Binary Hypothesis Analysis

## Established Timeline

| Event | Date | SHA / Info |
|-------|------|------------|
| `/usr/bin/titane-infinity` built | 2026-03-07 07:05 | da985ffeec4e1c51 |
| V12 zoom fix committed | 2026-03-11 | ce5e2ad1e |
| V13 route dedup fix committed | 2026-03-11 | e673aff05 |
| V14 proof committed (9b7283eb0) | 2026-03-11 | HEAD |

## Root Cause

The installed binary `/usr/bin/titane-infinity` was built ON 2026-03-07, which is 4 days BEFORE the V12 and V13 source fixes. Even if the source code is correct, the runtime always uses the stale binary.

## Stale Binary Evidence

```
ls -la /usr/bin/titane-infinity
size=30335704  SHA16=da985ffeec4e1c51  mtime=2026-03-07
```

## Wrapper Fallback Path (confirmed)

1. TAURI_BINARY_PATH → not set
2. runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage → NOT PRESENT
3. src-tauri/target/release/bundle/appimage/ → NOT PRESENT
4. deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage → NOT PRESENT
5. src-tauri/target/release/titane-infinity → NOT PRESENT (building...)
6. /usr/bin/titane-infinity → SELECTED (STALE)

## Fix Strategy

- `pnpm exec vite build` → DONE 2026-03-11 08:08 ✓
- `cargo build --release` → IN PROGRESS since 2026-03-11 08:09
- Post-build: use `TAURI_BINARY_PATH=<new_binary>` for WDIO proof

## Verdict

STALE_INSTALLED_BINARY_CONFIRMED — runtime was showing pre-fix UI
