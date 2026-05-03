# V25 Gates Report

Executed after V25 fixes + proof updates:

- `bash scripts/autoheal/detect_recurrence.sh` => PASS
	- `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
	- `PASS: G_AH_RECURRENCE_GUARD_PASS`
	- `INFO: entries=164`

- `bash scripts/verify_instructions.sh` => PASS
	- `SUMMARY: PASS=20 FAIL=0`

- `pnpm run verify:registry` => PASS
	- `registry sync not required`
	- `registry-integrity: PASS`
	- `registry-quality: PASS`

Gate verdict:
- `PASS`

Post-edit rerun:
- Same PASS results retained after postbuild evidence updates.
