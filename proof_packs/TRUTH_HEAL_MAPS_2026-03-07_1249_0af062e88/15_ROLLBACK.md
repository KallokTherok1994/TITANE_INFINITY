Status: READY

Scoped rollback commands:

Proof pack rollback:
- `git restore -- proof_packs/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88`

AutoHeal rollback:
- `git restore -- scripts/autoheal/autoheal_rules.jsonl`
- `git restore -- registry/autofix-autoheal-rules.jsonl`

Combined rollback:
- `git restore -- proof_packs/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88 scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl`

Post-rollback checks:
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
