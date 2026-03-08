# 06 Final Fix Loop

## Iteration 1
- Root cause: `set -e` + post-increment arithmetic (`((var++))`) caused immediate abort.
- Files fixed:
  - `scripts/verify/pre-deployment-check.sh`
  - `scripts/verify/verify-preprod.sh`
- Before proofs: `raw/46b_*`, `raw/47b_*`
- After proofs: `raw/48_*`, `raw/49_*`

## Iteration 2
- Root cause: strict-mode parsing/state defects (`pnpm audit` stream parse and undefined `level` under `set -u`).
- Files fixed:
  - `scripts/verify/pre-deployment-check.sh`
  - `scripts/verify/verify-preprod.sh`
- Before proofs: `raw/48_*`, `raw/49_*`
- After proofs: `raw/50_*`, `raw/51_*`

## Fix Count
- `2` accepted fixes (`<=3` policy).
