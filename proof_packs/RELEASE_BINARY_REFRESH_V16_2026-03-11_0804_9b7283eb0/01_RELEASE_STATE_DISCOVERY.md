# 01 Release State Discovery

## Source Reality
- Branch: v15_total_audit_20260311_080118
- HEAD: 9b7283eb0 (proof(v14): seal frontend runtime truth)
- origin/MAIN: 9b7283eb0 ✓ aligned
- V12 commit: ce5e2ad1e fix(ui): normalize zoom scale
- V13 commit: e673aff05 proof(v13): seal frontend connection integrity map
- V14 commit: 9b7283eb0 proof(v14): seal frontend runtime truth

## Build Reality
- package.json version: 27.2.0 (via tauri.conf.json)
- tauri.conf.json.version: 27.2.0
- frontendDist: ../dist
- beforeBuildCommand: corepack pnpm exec vite build
- dist: PRESENT (rebuilt 2026-03-11 08:08) ✓

## Artifact Reality
- deployment/latest/TITANE-Infinity_26.4.0_amd64.AppImage: 2026-03-06 (stale)
- deployment/latest/TITANE-Infinity_26.4.0_amd64.deb: 2026-03-06 (stale)
- deployment/latest/MANIFEST_v27.2.0.json: release_date=2026-02-23, tag_commit=02bce9c7c
- CHECKSUMS reference TITANE-Infinity_27.2.0_amd64.deb but file NOT present

## Install Reality
- /usr/bin/titane-infinity: 30335704 bytes, mtime=2026-03-07, SHA16=da985ffeec4e1c51
- STALE: pre-V12 (zoom fix) and pre-V13 (route dedup fix)

## tauri-wrapper.sh Binary Selection
Without TAURI_DEV_SERVER_URL:
1. TAURI_BINARY_PATH (env) → unset
2. runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage → NOT PRESENT
3. src-tauri/target/release/bundle/appimage/...AppImage → NOT PRESENT
4. deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage → NOT PRESENT (only 26.4.0)
5. src-tauri/target/release/titane-infinity → NOT PRESENT (building...)
6. /usr/bin/titane-infinity → SELECTED (stale)

## Runtime Reality (pre-rebuild)
- All WDIO runs use /usr/bin/titane-infinity (stale)
- UI displayed = old binary = pre-V12/V13 fixes
