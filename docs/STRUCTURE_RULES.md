# STRUCTURE_RULES

## Racine canonique minimale autorisée
- src/
- src-tauri/
- docs/
- scripts/
- tests/ (si présent)
- reports/
- proof_packs/
- archive/
- dist/

## Règles de gouvernance
1. Toute documentation durable va dans `docs/`.
2. Les artefacts de run/log/export vont dans `reports/` ou `proof_packs/`.
3. Le legacy est conservé sans suppression et orienté vers `archive/`.
4. Les déplacements se font exclusivement via `git mv`.
5. Aucun nouveau dossier racine hors liste canonique.
6. Nommage gouverné: `kebab-case` pour tout nouveau dossier/fichier documentaire.
7. Aucun `.md` versionné hors `docs/` (exceptions `README.md` et `.github/**/*.md`).
