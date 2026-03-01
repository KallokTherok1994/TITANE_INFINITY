# DOCS_MIGRATION_PLAN

## Phases exécutées
1. Inventaire exhaustif des `.md` versionnés.
2. Classification déterministe et génération `INVENTORY_MD.csv`.
3. Migration via `git mv` avec gestion de collisions.
4. Scan des liens internes avant/après.
5. Correction automatique des liens basée sur `MOVE_MAP_APPLIED.csv`.
6. Génération proof pack append-only.
7. Validation finale + verdict.

## Politique de sécurité
- Aucune suppression irréversible.
- Historique préservé via `git mv`.
- Stop-the-line actif sur liens cassés.
