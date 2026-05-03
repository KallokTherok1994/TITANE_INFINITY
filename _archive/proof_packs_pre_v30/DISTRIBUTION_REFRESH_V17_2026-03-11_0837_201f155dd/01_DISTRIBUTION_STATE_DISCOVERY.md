# 01 Distribution State Discovery

## Source / Release Reality

- Branch: `v15_total_audit_20260311_080118`
- HEAD: `201f155dd`
- origin/MAIN: `201f155dd` (aligned)
- App version (`src-tauri/tauri.conf.json`): `27.2.0`
- Last V16 commit: `201f155dd` (sealed V16 proof)

## Bundle Reality (before V17 refresh)

- `src-tauri/target/release/bundle/deb`: not present in worktree target
- Shared target (`REPO_CLONE_TEST`) initially had stale `Titan-Stable_27.0.5` bundles
- `deployment/latest` did not contain `TITANE-Infinity_27.2.0_amd64.AppImage` or `.deb`

## Latest Reality (before V17 refresh)

- Present: `TITANE-Infinity_26.4.0_amd64.AppImage`, `TITANE-Infinity_26.4.0_amd64.deb`
- Present: stale rpm `TITANE-Infinity-26.4.0-1.x86_64.rpm`
- Missing: canonical 27.2.0 AppImage and deb files expected by wrapper and manifest

## Manifest Reality (before V17 refresh)

- `MANIFEST_v27.2.0.json` referenced 27.2.0 files and old commit `02bce9c7...`
- Files referenced by manifest were absent in `deployment/latest`
- `CHECKSUMS.sha256` was not aligned with real canonical 27.2.0 files

## Install Reality (before V17 refresh)

- `/usr/bin/titane-infinity` remained stale:
  - mtime: 2026-03-07
  - SHA256: `da985ffeec4e1c510a54a7b71f999f881950badde235363ed5bd0d8f616fb067`

## Test Reality (before V17 refresh)

- No post-package runtime proof from real distributed 27.2.0 artifacts

## Raw evidence

- `raw/01_state_discovery.log`
- `raw/02_gap_analysis.log`
