# Prod Build — Step 11

## Command
cargo tauri build (via tauri-cli 2.10.0)

## Key Output
Compiling titane-infinity v28.6.0 (/home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri)
Finished `release` profile [optimized] target(s) in 10m 35s
Built application at: src-tauri/target/release/titane-infinity

Bundling TITANE-Infinity_28.6.0_amd64.deb (/src-tauri/target/release/bundle/deb/TITANE-Infinity_28.6.0_amd64.deb)
Bundling TITANE-Infinity-28.6.0-1.x86_64.rpm (/src-tauri/target/release/bundle/rpm/TITANE-Infinity-28.6.0-1.x86_64.rpm)
Bundling TITANE-Infinity_28.6.0_amd64.AppImage (/src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.6.0_amd64.AppImage)

Finished 3 bundles at:
  src-tauri/target/release/bundle/deb/TITANE-Infinity_28.6.0_amd64.deb
  src-tauri/target/release/bundle/rpm/TITANE-Infinity-28.6.0-1.x86_64.rpm
  src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.6.0_amd64.AppImage

## Warnings
WARN: Failed to add __TAURI_BUNDLE_TYPE variable — non-critical, updater plugin warning only

## Exit Code
PROD_BUILD_EXIT:0

## Artifacts
- AppImage: 91,314,680 bytes (91MB) — 2026-03-21 10:34
- deb:      18,675,798 bytes (18.7MB) — 2026-03-21 10:32
- rpm:      18,670,096 bytes (18.7MB) — 2026-03-21 10:32
