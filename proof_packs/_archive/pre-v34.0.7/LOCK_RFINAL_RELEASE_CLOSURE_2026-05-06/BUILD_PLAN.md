# RFINAL — Build Plan

**Date:** 2026-05-06

## Build Sequence

1. `pnpm install --frozen-lockfile` — dependency sync (no lockfile modification)
2. `pnpm run build` — frontend Vite production build → `dist/`
3. `pnpm tauri build` — Tauri release bundle → `src-tauri/target/release/bundle/`

## Expected Artifacts

| Artifact | Path | Type |
|---|---|---|
| AppImage | `src-tauri/target/release/bundle/appimage/*.AppImage` | Linux portable |
| DEB | `src-tauri/target/release/bundle/deb/*.deb` | Debian package |
| RPM | `src-tauri/target/release/bundle/rpm/*.rpm` | RPM package (if configured) |
| Binary | `src-tauri/target/release/titane-infinity` | Raw binary |

## Safety Rules

- Source files: NOT modified
- Lock files: NOT modified
- Version: NOT bumped (33.0.9 already set)
- If any build step fails: BLOCKED_BUILD, no release created
