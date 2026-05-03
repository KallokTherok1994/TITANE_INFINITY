# 03 Post Deploy Checks

## Artifact and version checks

- Package version: `27.2.0`
- `deployment/latest/Titan-Stable_27.2.0_amd64.AppImage`: present
- `deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage`: present
- `deployment/latest/TITANE-Infinity_27.2.0_amd64.deb`: present
- `deployment/latest/TITANE-Infinity-27.2.0-1.x86_64.rpm`: present
- Legacy blocker artifact `deployment/latest/Titan-Stable_27.0.5_amd64.AppImage`: absent

Evidence:

- `raw/40_postcheck.summary.env`
- `raw/42_sha256_latest_versioned.txt`
- `raw/66_deployment_manifest_fields.txt`

## Smoke runtime

- Stable AppImage smoke run (90s timeout): `exit=124` (keepalive) with `SMOKE_FATAL_MARKERS=0`.
- Classification: `PASS` (alive process during timeout and no fatal markers).

Evidence:

- `raw/41_smoke_stable_appimage.log`
- `raw/69_smoke_log_tail.txt`
