# 11 GATES RECHECK

## Mandatory governance gates

- `G_AH_RECURRENCE_GUARD_PASS`: `PASS`
- `verify_instructions` summary: `PASS=20 FAIL=0`

Latest evidence files:

- `raw_detect_recurrence_after_ci_fix_5.log`
- `raw_verify_instructions_after_ci_fix_5.log`

## CI gate reality on PR head

- Rust Docker targeted gate: `FAIL` (`22787313247`)
- Additional PR checks also contain failures (`raw_pr_checks_174_final.txt`)

Status: `FAIL` (governance local gates pass, CI gates remain red)

