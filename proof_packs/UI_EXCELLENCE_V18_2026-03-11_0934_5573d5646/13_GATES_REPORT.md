# 13 Gates Report

## Mandatory Gates

1. `bash scripts/autoheal/detect_recurrence.sh`
   - Exit: `0`
   - Key markers: `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`, `PASS: G_AH_RECURRENCE_GUARD_PASS`
   - Evidence: `raw/16a_detect_recurrence.log`
2. `bash scripts/verify_instructions.sh`
   - Exit: `0`
   - Summary marker: `SUMMARY: PASS=20 FAIL=0`
   - Evidence: `raw/16b_verify_instructions.log`

## Gate Verdict

- Global gates status: `PASS`.
