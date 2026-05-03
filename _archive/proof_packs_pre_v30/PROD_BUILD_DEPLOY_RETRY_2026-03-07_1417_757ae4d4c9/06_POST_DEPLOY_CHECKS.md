# Post-Deploy Checks

## Deploy Status

- Deploy exit code: `0`
- Deploy summary: `raw/05_deploy.summary.txt`
- Deploy log: `05_DEPLOY_EXECUTION.log`

## Artifact Availability

- Availability evidence: `raw/06_artifact_availability.txt`
- Result: deployed AppImage and DEB paths exist.

## Version Integrity

- Integrity evidence: `raw/06_version_integrity.txt`
- `PACKAGE_VERSION=27.2.0`
- Deployed AppImage name indicates `27.0.5`.
- Deployed DEB name indicates `27.2.0`.
- Integrity outcome: `APP_VERSION_MATCH=NO`, `DEB_VERSION_MATCH=YES`.

## Smoke Runtime Check

- Smoke log: `raw/06_smoke_runtime.log`
- Smoke summary: `raw/06_smoke_runtime.summary.txt`
- Derived smoke analysis: `raw/06_smoke_analysis.txt`
- Observed boot markers include `BOOT:READY` events.

## Post-Deploy Decision

- `BLOCKED`: production integrity not fully coherent because deployed AppImage version does not match package/release version.
