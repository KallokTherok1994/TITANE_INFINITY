# ROLLBACK (Safe, no history rewrite)

If you need to undo this run and revert DEPLOYMENT_READY append:

## Check current HEAD
```bash
git log --oneline -1
```

## Revert the doc commit (safe, append-only preserved)
```bash
git revert --no-edit HEAD
git push origin HEAD
```

This preserves append-only history while negating the latest DEPLOYMENT_READY append
via a new commit. No history is rewritten.

## If you need to revert the revert
```bash
git revert --no-edit HEAD
git push origin HEAD
```

All operations are append-only and reversible.
