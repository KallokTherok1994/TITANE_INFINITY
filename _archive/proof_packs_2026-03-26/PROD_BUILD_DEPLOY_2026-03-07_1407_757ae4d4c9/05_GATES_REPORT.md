# Gates Report

## Production Chain Gates

- Build hardening gate (`P3_FORBIDDEN_SCAN`): `FAIL`
- Deploy continuation gate: `BLOCKED`

## Governance Validators

- `bash scripts/autoheal/detect_recurrence.sh`: `PASS` (`raw/18_detect_recurrence.exitcode = 0`)
- `bash scripts/verify_instructions.sh`: `PASS` (`raw/19_verify_instructions.exitcode = 0`)
- Evidence summary: `raw/20_governance_checks.summary.txt`

## Net Session State

- `BLOCKED`: build/deploy objective not achieved because mandatory build gate failed.
