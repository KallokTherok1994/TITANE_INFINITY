# Gates Report — AH-DEPLOY-META-012

## Gate Evidence

1. Recurrence guard
- Command: `bash scripts/autoheal/detect_recurrence.sh`
- Result: PASS
- Evidence: `G_AH_RULE_CAPTURED_FOR_EACH_FIX`, `G_AH_RECURRENCE_GUARD_PASS`, `entries=321`

2. Instruction verification
- Command: `bash scripts/verify_instructions.sh`
- Result: PASS
- Evidence: `SUMMARY: PASS=20 FAIL=0`

3. Artifact checksum integrity
- Command: `sha256sum -c deployment/latest/CHECKSUMS.sha256`
- Result: PASS (4/4)

4. Versioned checksum integrity
- Command: `sha256sum -c deployment/latest/SHA256SUMS_v28.0.0.txt`
- Result: PASS (4/4)

## Gate Verdict
PASS
