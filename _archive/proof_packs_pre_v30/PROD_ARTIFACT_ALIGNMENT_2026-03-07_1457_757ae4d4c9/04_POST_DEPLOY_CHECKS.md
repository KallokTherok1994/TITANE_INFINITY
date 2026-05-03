# 04_POST_DEPLOY_CHECKS

## Integrity

- PACKAGE_VERSION: `27.2.0`
- APPIMAGE_PATH: `deployment/latest/Titan-Stable_27.2.0_amd64.AppImage`
- APPIMAGE_VERSION: `27.2.0`
- APPIMAGE_SHA256: `020845e77ee49a19714900618dfa7f8b71eb6532dfc9624bd49ac3d4b12fa0ed`
- APP_VERSION_MATCH: `YES`

## Smoke

- Smoke evidence log: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/04_smoke_appimage.log`
- Marker check: `BOOT:READY` found in log.
- BOOT_READY: `YES`

## Deploy Cross-check

- Deploy execution log: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/03_DEPLOY_EXECUTION.log`
- Confirmed replacement of old stable artifact:
  - Removed: `deployment/latest/Titan-Stable_27.0.5_amd64.AppImage`
  - Active: `deployment/latest/Titan-Stable_27.2.0_amd64.AppImage`

## Gate Outcome

- Post-deploy check status: `PASS`
