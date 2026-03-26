# PHASE 8 - ROLLBACK PLAN

## Rollback Targets

Governance commit in this lane: `d859691c8`.

## Fast Revert (preferred)

- `git revert d859691c8`

## Targeted Restore (if revert not desired)

- `git restore -- registry/proofpack-index.jsonl`
- `git restore -- registry/heavy-artifacts-manifest.jsonl`
- `git restore -- registry/local-only-historical-residue.jsonl`
- `git restore -- scripts/autoheal/autoheal_rules.jsonl`

## Non-Tracked Lane Artifacts

If lane-level policy docs must be removed locally:

- remove `proof_packs/HISTORICAL_RESIDUE_POLICY_2026-03-07_1651_f5819cee9.md`
- remove `proof_packs/ARCHIVE_POINTER_MANIFEST_2026-03-07_1651_f5819cee9.md`

No destructive removal of historical proof-pack directories is part of rollback.

