# GATE_REPORT

Session: DEPLOYMENT_LATEST_STABLE_RESYNC_2026-03-15_2337_5b71a826c
Date: 2026-03-15T23:37:12Z

Checks:
- PASS: `rg -n '"version": "28.0.0"' deployment/latest/MANIFEST.json`
- PASS: `rg -n 'Titan-Stable_28.0.0_amd64' deployment/latest/CHECKSUMS.sha256 deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt`
- PASS: `bash scripts/autoheal/detect_recurrence.sh`
- PASS: `bash scripts/verify_instructions.sh`

Evidence:
- `deployment/latest/MANIFEST.json` now publishes version `28.0.0`
- `deployment/latest/CHECKSUMS.sha256` references `Titan-Stable_28.0.0_amd64.AppImage` and `Titan-Stable_28.0.0_amd64.deb`
- `deployment/latest/SHA256SUMS.txt` mirrors the same 28.0.0 artifact set
- `deployment/latest/SIZES.txt` mirrors the same 28.0.0 artifact set
