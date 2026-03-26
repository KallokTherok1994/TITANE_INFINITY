# 01_VERSION_ALIGNMENT

## Inputs

- Canonical package version (`package.json`): `27.2.0`
- Stable config before fix (`runtime/stable/tauri.conf.json`): `27.0.5`
- Stable config after fix (`runtime/stable/tauri.conf.json`): `27.2.0`

## Build Evidence

- Build command: `corepack pnpm exec tauri build --config runtime/stable/tauri.conf.json --bundles appimage`
- Build log: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/02_APPIMAGE_BUILD.log`
- Build summary: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/02_appimage_build.summary.txt`
- Exit code: `APPIMAGE_BUILD_EXIT_CODE=0`
- Output candidate: `src-tauri/target/release/bundle/appimage/Titan-Stable_27.2.0_amd64.AppImage`

## Result

Version alignment is achieved for stable AppImage production artifact naming and content lineage.
