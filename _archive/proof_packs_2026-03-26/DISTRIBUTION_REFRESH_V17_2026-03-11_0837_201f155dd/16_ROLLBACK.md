# 16 Rollback

## Immediate rollback plan

1. Restore latest metadata/files to previous git state:
   - `git restore -- deployment/latest`
2. Remove V17 proof pack:
   - `git restore -- proof_packs/DISTRIBUTION_REFRESH_V17_2026-03-11_0837_201f155dd`
3. Remove V17 registry/autoheal entries:
   - `git restore -- scripts/autoheal/autoheal_rules.jsonl registry/ui-events.jsonl`

## Rollback risk

- LOW: V17 touched distribution artifacts and proof metadata only.
- No source code logic changes in `src/` or Rust backend command paths.

## Environment note

- `/usr/bin/titane-infinity` was not modified due sudo privilege block, so system package state is unchanged by this session.
