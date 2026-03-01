# DOCS_MIGRATION_PLAN

## Phases exécutées
1. Inventaire exhaustif des `.md` versionnés.
2. Classification déterministe et génération `INVENTORY_MD.csv`.
3. Migration résiduelle via `git mv` (si nécessaire) avec gestion de collisions.
4. Scan des liens internes avant/après.
5. Correction automatique des liens (max 3 boucles) basée sur `MOVE_MAP.csv` + résolution déterministe.
6. Génération proof pack append-only.
7. Validation finale + verdict + commit principal.

## Politique de sécurité
- Aucune suppression irréversible.
- Historique préservé via `git mv`.
- Stop-the-line actif sur liens cassés.
