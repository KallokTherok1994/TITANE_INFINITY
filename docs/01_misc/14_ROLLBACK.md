# 14_ROLLBACK

## Rollback rapide (non destructif)
1. Restaurer uniquement le proof pack:
   - `git restore --source=HEAD --staged --worktree proof_packs/CLEANUP_AUDIT_2026-02-28_1703_21359b1eb`
2. Restaurer tous les changements locaux si nécessaire:
   - `git restore --staged --worktree .`

## Rollback ciblé par fichier
- `git restore -- proof_packs/CLEANUP_AUDIT_2026-02-28_1703_21359b1eb/00_EXEC_SUMMARY.md`
- Répéter pour chaque fichier listé dans `15_FILES_CHANGED.md`.

## Rollback par commit (si commit créé ultérieurement)
- `git revert <sha_commit_cleanup_pack>`

## Règle
Aucune commande destructive (`reset --hard`, `clean -fd`) n’est requise dans ce plan.
