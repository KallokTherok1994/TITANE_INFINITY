# LANE_SELECTION

## Selected lane
LANE C - APPLY_BOUNDED_RESTORE_OR_SYNC_FIX

## Justification
- Restore/no-loss proof was blocked by missing harness path.
- A small, bounded harness step was feasible and safe (WDIO test invoking titan_* commands).
- Rollback is trivial (single test file revert).
- Immediate x3 rerun was possible and performed.
