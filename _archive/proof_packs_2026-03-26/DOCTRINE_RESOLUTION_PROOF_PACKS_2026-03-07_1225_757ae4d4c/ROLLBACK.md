# ROLLBACK

Aucune mutation produit/config n'a ete faite.

Si ce pack est commit puis rejete:
```bash
git revert <commit_sha_with_this_pack> --no-edit
```

Si ce pack reste local/non suivi:
- aucune action rollback requise.
