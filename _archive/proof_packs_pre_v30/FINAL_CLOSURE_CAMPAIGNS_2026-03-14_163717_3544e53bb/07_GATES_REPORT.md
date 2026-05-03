# 07 GATES REPORT

## G5 (standalone)

- Result: `FAIL`
- Reason: missing PROD token requirements (expected in non-PROD lane)
- Evidence: `raw/05_g5.log`

## G7 (standalone)

- Result: `PASS`
- Evidence: `raw/06_g7.log`

## run-all

- Result: orchestration complete, not premature
- Summary: `Passed 5/9`, `Failed 4/9`
- Fails: `G4`, `G5`, `G6`, `G9`
- Evidence: `raw/07_runall.log`
- Upstream summary: `docs/_evidence/gate-runs/RUN_2026-03-14T16-30-22Z_SUMMARY.md`
