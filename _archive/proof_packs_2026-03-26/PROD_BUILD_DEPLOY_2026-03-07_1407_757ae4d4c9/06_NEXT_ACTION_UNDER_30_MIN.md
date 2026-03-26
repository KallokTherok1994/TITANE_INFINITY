# Next Action (<= 30 min)

## Immediate Unblock Plan

- Review `scripts/check_forbidden_files.sh` scope and align ignore set to exclude non-release paths (`.tools/`, `.venv/`, historical `proof_packs/`, reports backups) while preserving real secret detection.
- Move env files out of build context or switch to approved template mechanism expected by the scanner.
- Re-run `TITANE_BUILD_ASSUME_YES=1 ./runtime/stable/build.sh`.

## Timebox

- Estimated operator action: 15-30 minutes.

## Status

- `BLOCKED`: waiting for workspace policy cleanup before retriggering full prod chain.
