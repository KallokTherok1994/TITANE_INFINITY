# 04 Governance Gates

## Required Gates

1. `bash scripts/autoheal/detect_recurrence.sh`
- Status: `PASS`
- Markers:
  - `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
  - `PASS: G_AH_RECURRENCE_GUARD_PASS`

2. `bash scripts/verify_instructions.sh`
- Status: `PASS`
- Marker: `SUMMARY: PASS=20 FAIL=0`

## Evidence Files

- `proof_packs/PROD_DEPLOY_TOKEN_EXEC_2026-03-13_2057_5b164aa87/raw/04_autoheal_gate.txt`
- `proof_packs/PROD_DEPLOY_TOKEN_EXEC_2026-03-13_2057_5b164aa87/raw/05_instruction_gate.txt`

## Gate Verdict

- `GOVERNANCE_VERDICT: PASS`
