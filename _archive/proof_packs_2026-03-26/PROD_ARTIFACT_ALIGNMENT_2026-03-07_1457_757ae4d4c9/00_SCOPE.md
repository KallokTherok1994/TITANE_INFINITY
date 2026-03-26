# 00_SCOPE

- Session: `PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9`
- Objective: align stable AppImage artifact version with canonical package version `27.2.0` and redeploy without full pipeline rebuild.
- Constraints:
  - No full rebuild/deploy pipeline rerun.
  - Minimal patch only.
  - Artifact expected: `Titan-Stable_27.2.0_amd64.AppImage`.
- Scope executed:
  - Update `runtime/stable/tauri.conf.json` version (`27.0.5` -> `27.2.0`).
  - AppImage-only build with `--bundles appimage`.
  - Targeted redeploy into `deployment/latest`.
  - Post-deploy integrity check + smoke evidence (`BOOT:READY`).
- Out of scope:
  - Full CI workflow rerun.
  - Non-artifact functional refactors.
