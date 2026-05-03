# ROLLBACK

Cette run n'a effectue aucune mutation produit/config/workflow.

Si ce pack est commit puis doit etre annule:
```bash
git revert <commit_sha_with_this_pack> --no-edit
```

Si ce pack reste local/untracked:
- aucune action de rollback requise.
