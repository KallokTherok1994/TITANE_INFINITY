# 06_GOVERNANCE_STATUS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `light governance checks`

C) RISK: `P0`

D) PLAN:
1. Run `detect_recurrence`.
2. Run `verify_instructions`.
3. Capture exits and log tails.

E) PROOFS:
- `bash scripts/autoheal/detect_recurrence.sh`
  - `raw/recheck_detect_recurrence.exit` -> `0`
  - `raw/recheck_detect_recurrence.tail20.txt`
- `bash scripts/verify_instructions.sh`
  - `raw/recheck_verify_instructions.exit` -> `0`
  - `raw/recheck_verify_instructions.tail20.txt`

GOVERNANCE_STATUS = `PASS`

F) ROLLBACK:
- Validation-only commands.
