# Gate Report

Date: 2026-03-15
Commit: a987137c8
Scope: deployment metadata coherence after certified deploy

## Commands and Results

1. `bash scripts/deployment/certified-deploy.sh --target both --deploy-path deployment/latest --manifest-update --verbose`
- Result: PASS
- Key markers:
  - `CERTIFICATION VERIFIED: All gates operational`
  - `Test Files 216 passed (216)`
  - `Tests 3223 passed (3223)`
  - `AppImage deployed: Titan-Stable_27.2.0_amd64.AppImage`
  - `DEB deployed: Titan-Stable_27.2.0_amd64.deb`

2. `rg -n '"version": "27.2.0"' deployment/latest/MANIFEST.json`
- Result: PASS
- Evidence: line 4 contains `"version": "27.2.0"`

3. `rg -n 'Titan-Stable_27.2.0_amd64' deployment/latest/CHECKSUMS.sha256 deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt`
- Result: PASS
- Evidence: all 3 files reference the same Titan-Stable 27.2.0 artifact pair

4. `bash scripts/autoheal/detect_recurrence.sh`
- Result: PASS
- Evidence:
  - `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
  - `PASS: G_AH_RECURRENCE_GUARD_PASS`

5. `bash scripts/verify_instructions.sh`
- Result: PASS
- Evidence: `SUMMARY: PASS=20 FAIL=0`

## Files Changed

- `scripts/deployment/certified-deploy.sh`
- `deployment/latest/MANIFEST.json`
- `deployment/latest/CHECKSUMS.sha256`
- `deployment/latest/SHA256SUMS.txt`
- `deployment/latest/SIZES.txt`
- `scripts/autoheal/autoheal_rules.jsonl`

## Notes

- Script now selects newest artifacts deterministically (`ls -1t ... | head -n1`).
- Manifest version is inferred from deployed artifact name when available.
- Sidecar files (`CHECKSUMS.sha256`, `SHA256SUMS.txt`, `SIZES.txt`) are regenerated from deployed files each run.
