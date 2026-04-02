# VERDICT

- Session: `PROD_BUILD_DEPLOY_RETRY_2026-03-07_1417_757ae4d4c9`
- Final verdict: `BLOCKED_PROD`

## Why

- Security scope fix is valid and enforced (`P3_FORBIDDEN_SCAN` pass).
- Build succeeded (`BUILD_EXIT_CODE=0`).
- Deploy succeeded (`DEPLOY_EXIT_CODE=0`).
- Post-deploy integrity check failed for AppImage version coherence:
- package version `27.2.0` vs deployed AppImage `Titan-Stable_27.0.5_amd64.AppImage`.

## Core Evidence

- `raw/02_scope_gate_validation.exitcode`
- `raw/03_build.summary.txt`
- `raw/05_deploy.summary.txt`
- `raw/06_version_integrity.txt`
- `06_POST_DEPLOY_CHECKS.md`
