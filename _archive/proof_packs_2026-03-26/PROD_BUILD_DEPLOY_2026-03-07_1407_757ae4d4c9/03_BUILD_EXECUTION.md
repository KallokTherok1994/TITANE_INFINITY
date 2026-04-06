# Build Execution

## Command Path

- Canonical command used: `TITANE_BUILD_ASSUME_YES=1 ./runtime/stable/build.sh`
- Primary deterministic run evidence:
- `raw/12_build_attempt3.log`
- `raw/12_build_attempt3.exitcode`
- `raw/12_build_attempt3.summary.txt`

## Result

- Build exit code: `1`
- Gate failure marker: `P3_FORBIDDEN_SCAN: FAIL - 8 violations detected`
- Security blockers include forbidden patterns detected in workspace (`*.env`, `*.key`, `*.pem`, `*secret*.txt`, `*.backup`, `*.tmp`).

## Stop-The-Line Decision

- `FAIL`: build gate failure is blocking for production continuation.
- Deploy step remains gated and is not executed.
