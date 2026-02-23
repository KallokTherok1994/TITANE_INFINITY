# Rollback — Sealed Release v27.0.5

Ring impacté: Ring 0 (docs) + Ring 4 (deployment artifacts)
Status: STABLE

## Non-destructive rollback

```bash
git restore -- runtime/stable/tauri.conf.json
git restore -- deployment/latest/MANIFEST.json
git restore -- deployment/latest/SHA256SUMS_v27.0.5.txt
git restore -- deployment/latest/SIZES_v27.0.5.txt
git restore -- deployment/latest/titane-infinity
```

## Commit-level rollback

If needed, revert release sealing commits in reverse order:

```bash
git revert --no-edit b51b0013
git revert --no-edit 4848464c
git revert --no-edit a1bf79e2
```

## Tag rollback

If release must be invalidated remotely:

```bash
git tag -d v27.0.5-prod
git push origin :refs/tags/v27.0.5-prod
```

Re-tagging should be done only after a new qualified sealing cycle.
