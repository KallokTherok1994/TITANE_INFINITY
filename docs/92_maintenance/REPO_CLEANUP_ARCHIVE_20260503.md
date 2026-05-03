# Repo Cleanup Archive Report — 2026-05-03

## Scope

Bounded repo housekeeping focused on clearly obsolete staging and backup surfaces that were still visible in active paths.

## Archived surfaces

- `.archive_cleanup/`
- `docs/backup_20251218_122526/`
- `docs/backup_20251218_122540/`
- `docs/backup_20251218_123316/`
- `super_prompts/`

## New canonical location

All four surfaces now live under:

`docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/`

## Explicit non-moves

The following were intentionally kept in place:

- `_archive/` — canonical historical archive
- `legacy/` — documented legacy code surface
- `documentation/` — still used by `scripts/sync-docs.sh`

## Rationale

- Reduce root/docs noise without destructive deletion.
- Consolidate obsolete backups into the existing archive policy described by `README.md` and `docs/CARTOGRAPHY_COMPLETE.md`.
- Avoid breaking historical restore paths by moving, not deleting.

## Rollback

```bash
mv docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/root_archive_cleanup_legacy .archive_cleanup
mv docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526 docs/backup_20251218_122526
mv docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540 docs/backup_20251218_122540
mv docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316 docs/backup_20251218_123316
```

## Verification

- paths no longer present at root/docs active surface
- archive targets present under `docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/`
- structure/doctrine validators rerun after the move
