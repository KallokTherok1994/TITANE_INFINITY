# Deployment Latest Stable Resync - 2026-03-15

Date: 2026-03-15T23:37:12Z
Base commit: 5b71a826c
Scope: deployment/latest metadata synchronization with stable runtime 28.0.0 artifacts

Problem:
- `deployment/latest` still published 27.2.0 metadata while stable runtime and launcher had already moved to 28.0.0.

Root cause:
- No explicit post-rebuild synchronization step had updated `deployment/latest/MANIFEST.json` and sidecar files after stable lane rebuild.

Applied fix:
- Copied stable 28.0.0 artifacts to `deployment/latest`:
  - `Titan-Stable_28.0.0_amd64.AppImage`
  - `Titan-Stable_28.0.0_amd64.deb`
- Regenerated:
  - `deployment/latest/MANIFEST.json`
  - `deployment/latest/CHECKSUMS.sha256`
  - `deployment/latest/SHA256SUMS.txt`
  - `deployment/latest/SIZES.txt`

Observed checksums:
- AppImage: `fc0e324f7b3f11668429a571120371faca36d80c265e1b845a860a9dad0ce2c5`
- DEB: `bde75a447151345b05426597b0bf5f6c1740d1ff7a7552c7fcf30c521735ff1a`
- MANIFEST: `5029a1688d49a80feff358292391771e97c9e48efd4e7849f7401132cfa0846b`

Verification commands:
- `rg -n '"version": "28.0.0"' deployment/latest/MANIFEST.json`
- `rg -n 'Titan-Stable_28.0.0_amd64' deployment/latest/CHECKSUMS.sha256 deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
