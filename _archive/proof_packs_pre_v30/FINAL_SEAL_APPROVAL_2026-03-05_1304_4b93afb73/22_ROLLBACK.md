# ROLLBACK

## If no commit is made

Remove only this proof pack folder:

```bash
rm -rf proof_packs/FINAL_SEAL_APPROVAL_2026-03-05_1304_4b93afb73
```

## If commit is made

Use non-destructive revert:

```bash
git revert --no-edit <commit_sha>
```

## Notes

- No history rewrite.
- No `git reset --hard`.
