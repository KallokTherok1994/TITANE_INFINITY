# 10_ROLLBACK

Rollback scope:
- No product or workflow mutation occurred in this run.
- Rollback is documentation-level only.

If this proof pack is committed and later rejected:
```bash
git revert <commit_sha_with_this_pack> --no-edit
```

If this proof pack is only local/untracked:
- No rollback action required.
