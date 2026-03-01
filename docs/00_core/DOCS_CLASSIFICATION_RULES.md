# DOCS_CLASSIFICATION_RULES

Règles déterministes appliquées:

- `README*`, `CONTRIBUTING*`, `SECURITY*` -> `docs/00_core/`
- `CHANGELOG*` -> `docs/90_release/`
- `DEPLOYMENT*`, `PRODUCTION*`, `GO_LIVE*` -> `docs/90_release/`
- `PHASE*`, `REPORT*`, `SUMMARY*` -> `docs/91_reports/`
- `FIX*`, `HOTFIX*` -> `docs/92_maintenance/`
- `CHAT*`, `CONVERSATION*` -> `docs/93_conversation/`
- `MERMAID*` -> `docs/_archive/mermaid/`
- `LOG*`, `RUN*`, `EXECUTION*` -> `docs/_archive/runs/`
- `ANALYSE*`, `AUDIT*` -> `docs/91_reports/`
- `legacy*`, `old*`, archives historiques -> `docs/_archive/legacy/`
- Autres -> `docs/01_misc/`

Exceptions KEEP:

- `README.md` racine
- `.github/**/*.md`
- fichiers déjà sous `docs/`

Règle UNKNOWN:

- Toute cible non résoluble de manière déterministe est marquée `UNKNOWN` dans `INVENTORY_MD.csv` (colonne `notes`).
