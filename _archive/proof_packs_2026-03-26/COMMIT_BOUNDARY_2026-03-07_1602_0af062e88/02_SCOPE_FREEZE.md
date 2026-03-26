# PHASE 1 - SCOPE FREEZE

In scope:
- Commit-boundary execution only.
- Split-bucket staging/commit proof.
- Readiness recalculation from current git truth.

Out of scope:
- Reopening TREE_CLOSURE governance work.
- Runtime campaign restudy.
- Destructive cleanup.
- Broad staging (`git add .`, `git add -A`).

Boundary law frozen:
- Stage/commit only exact documented bucket paths.
- On ambiguity or contamination: stop and classify `BLOCKED`.

Rollback baseline:
- `git restore --staged <exact bucket paths>`
- `git reset --soft HEAD~1` if commit rollback required.

