# Rollback

Mode: non-destructif (revert commits)

## Option A: rollback complet de la sequence

Depuis la branche de travail:

```bash
git revert --no-edit 4b93afb73 6a4375b5f e18737ba8 304d6616a 90ca3a261
```

Puis:

```bash
pnpm -s lint && pnpm -s check && cargo test --manifest-path src-tauri/Cargo.toml
```

## Option B: rollback partiel

- Revert ciblé d'un commit:

```bash
git revert --no-edit <commit_sha>
```

- Revalider gate associee (scan/test/script) avant de continuer.

## Notes

- Aucun `reset --hard` requis.
- La stash de pre-sync a ete preservee lors du traitement des conflits; elle peut etre inspectee via `git stash list` puis appliquee manuellement si necessaire.
