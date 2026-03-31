# 04 Test Matrix

## Baseline runs (pre-fix)

- `smoke`: not green x3 (historical run1 failure with `invalid session id`).
- `full`: not green x3 (historical assertion failure on chat state persistence).

## Post-fix runs (decision set)

- Command authority: `scripts/qa/run_x3.sh`
- Aggregated in: `08_TESTS_X3.log`

### Full suite

- ID: `full_postfix3`
- Runs: 3
- Exit codes: `0, 0, 0`
- Status: `PASS`

### Smoke suite

- ID: `smoke_postfix3`
- Runs: 3
- Exit codes: `0, 0, 0`
- Status: `PASS`

