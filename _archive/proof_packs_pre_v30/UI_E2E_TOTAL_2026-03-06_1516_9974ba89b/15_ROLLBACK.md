# ROLLBACK PLAN

## E2E Fix Rollback

- `git restore -- e2e/desktop/ui-driver.wdio.js`

## Proof-pack Rollback

- `git restore -- proof_packs/UI_E2E_TOTAL_2026-03-06_1516_9974ba89b`

## AutoHeal Rollback

- Remove last JSONL line added in `scripts/autoheal/autoheal_rules.jsonl` and re-run validators.

## Post-rollback Checks

- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`

