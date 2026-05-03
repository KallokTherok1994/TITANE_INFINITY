# 19 Rollback Plan

If rollback required:

1. `git restore -- src/App.tsx`
2. `git restore -- scripts/autoheal/autoheal_rules.jsonl`
3. `git restore -- registry/ui-events.jsonl`
4. Re-run gates:
   - `bash scripts/autoheal/detect_recurrence.sh`
   - `bash scripts/verify_instructions.sh`
