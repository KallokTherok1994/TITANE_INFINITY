# ROLLBACK

Rollback commands:

1. `git restore -- src/App.tsx`
2. `git restore -- scripts/autoheal/autoheal_rules.jsonl`
3. `git restore -- registry/ui-events.jsonl`
4. `git restore -- proof_packs/FRONTEND_CONNECTION_INTEGRITY_V13_2026-03-11_0645_ce5e2ad1e`

Re-validation after rollback:

- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
