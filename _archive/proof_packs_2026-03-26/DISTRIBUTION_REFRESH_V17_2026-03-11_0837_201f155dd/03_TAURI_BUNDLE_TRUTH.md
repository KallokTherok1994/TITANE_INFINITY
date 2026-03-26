# 03 Tauri Bundle Truth

## Commands executed

- `cargo tauri build --bundles appimage` (exit=0)
- `cargo tauri build --bundles deb` (exit=0)

Note: a first combined run (`deb,appimage`) was interrupted after deb generation; clean proof was re-established with explicit per-bundle reruns.

## Build environment

- Node: `v24.0.0` (local tools)
- pnpm: `10.30.2`
- cargo: `1.94.0`
- CARGO_TARGET_DIR: `/home/titane-os/Documents/GitHub/REPO_CLONE_TEST/TITANE_INFINITY/src-tauri/target`

## Generated artifacts

- AppImage: `/home/titane-os/Documents/GitHub/REPO_CLONE_TEST/TITANE_INFINITY/src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.2.0_amd64.AppImage`
- deb: `/home/titane-os/Documents/GitHub/REPO_CLONE_TEST/TITANE_INFINITY/src-tauri/target/release/bundle/deb/TITANE-Infinity_27.2.0_amd64.deb`

## Bundle truth hashes

- AppImage SHA256: `640c11346eb7102b6dedd6bc68496c5cc56842510407fe256dacf461c517638f`
- deb SHA256: `105f2cf3e133b97505372c9e1541e578adb530ab53d6abc310826095de85760e`

## Raw evidence

- `raw/03b_tauri_bundle_appimage.log`
- `raw/03c_tauri_bundle_deb.log`
