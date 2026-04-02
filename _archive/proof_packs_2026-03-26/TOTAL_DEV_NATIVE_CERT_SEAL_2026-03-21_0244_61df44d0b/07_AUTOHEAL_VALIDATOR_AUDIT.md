# 07_AUTOHEAL_VALIDATOR_AUDIT

AutoHeal institutionalization:

- Added `AH-2026-03-20-NATIVE-BINARY-FRESHNESS-SEAL-001` in `scripts/autoheal/autoheal_rules.jsonl`.
- Family mapping:
  - symptom: stale runtime false-blocker narratives
  - cause: missing governed freshness preflight
  - prevention: validator + runner hard block + shared policy

Validator evidence:

- `bash scripts/autoheal/detect_recurrence.sh` => PASS
- `bash scripts/verify_instructions.sh` => PASS
- `bash scripts/verify/verify-native-binary-freshness.sh` => FAIL currently (expected under workspace-ahead)

Conclusion:

- anti-recurrence mechanism is operational and loud.
