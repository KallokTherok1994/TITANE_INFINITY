# 04 Latest Refresh Truth

## Before refresh (observed)

- `deployment/latest/TITANE-Infinity_26.4.0_amd64.AppImage`
- `deployment/latest/TITANE-Infinity_26.4.0_amd64.deb`
- `deployment/latest/TITANE-Infinity-26.4.0-1.x86_64.rpm`
- no canonical `TITANE-Infinity_27.2.0_amd64.AppImage` / `.deb`

## Actions applied

- Copied fresh 27.2.0 artifacts from Tauri bundle output:
  - `TITANE-Infinity_27.2.0_amd64.AppImage`
  - `TITANE-Infinity_27.2.0_amd64.deb`
  - `titane-infinity` (release binary)
- Removed stale visible package artifacts:
  - `TITANE-Infinity_26.4.0_amd64.AppImage`
  - `TITANE-Infinity_26.4.0_amd64.deb`
  - `TITANE-Infinity-26.4.0-1.x86_64.rpm`
  - `Titan-Stable_26.2.0_amd64.AppImage`
  - `Titan-Stable_26.2.0_amd64.deb`

## After refresh (observed)

- `deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage` present
- `deployment/latest/TITANE-Infinity_27.2.0_amd64.deb` present
- `deployment/latest/titane-infinity` present
- stale 26.x visible package files removed

## Raw evidence

- `raw/04_latest_refresh_and_manifest.log`
- `raw/05_manifest_checksums_latest_verify.log`
