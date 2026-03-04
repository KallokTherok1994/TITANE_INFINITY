# 09_ARCHIVE_POLICY

## Règles strictes
1. Zéro suppression sans preuve: archive d’abord.
2. Emplacement obligatoire: `archive/<YYYY-MM-DD>/...`.
3. Chaque lot archivé contient un `README.md` avec:
   - raison d’archivage
   - provenance (chemin source)
   - date
   - owner
   - procédure rollback

## Nomenclature
- Scripts: `archive/<date>/scripts/<relative-path>`
- Docs legacy: `archive/<date>/docs/<relative-path>`
- Configs obsolètes: `archive/<date>/config/<relative-path>`

## Contrôles
- Ajouter gate CI: refus de suppression brute pour fichiers classifiés B/E.
- Vérifier qu’aucun import actif ne pointe vers archive.

## Rollback
- Restaurer depuis git: `git restore --source=HEAD~1 <path>` ou `git revert <commit>`.
