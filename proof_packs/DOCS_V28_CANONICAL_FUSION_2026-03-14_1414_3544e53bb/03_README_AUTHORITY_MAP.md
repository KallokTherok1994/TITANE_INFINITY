A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (cartographie autorite des README dans `README.md`, `docs/**/README*.md`)
C) RISK: P1
D) PLAN: 1) classifier README prioritaires 2) isoler front door canon 3) isoler hub docs canon 4) marquer legacy/archive.
E) PROOFS: obtenues = `_docs_readme_list.log`, lectures directes des README prioritaires.
F) ROLLBACK: suppression du proof pack uniquement.

# 03 README AUTHORITY MAP

## Autorites cibles (unicite)

- Canon public front door: `README.md` -> `ROOT_CANONICAL` (`PROVEN_BY_REPO`)
- Canon navigation docs: `docs/README.md` -> `DOCS_CANONICAL` (`PROVEN_BY_REPO`)

## README prioritaires

- `docs/diagrams/README.md` -> `SUBSYSTEM_CANONICAL` (diagrammes/Mermaid)
- `docs/api/README.md` -> `SUBSYSTEM_CANONICAL` (API)
- `docs/backend/README.md` -> `SUBSYSTEM_CANONICAL` (backend)
- `docs/user/README.md` -> `SUPPORTIVE`

## Zones a deprecier/archiver

- `docs/00_core/README_v27.0.0.md` -> `LEGACY`
- `docs/00_core/README_OLD.md` + variantes `README__*.md.md` -> `DUPLICATE`/`LEGACY`
- `docs/archive/**`, `docs/99_ARCHIVE/**`, `docs/backup_*/**` -> `ARCHIVE`

## Conclusion autorite

- Chaine d'autorite unique definie conceptuellement, mais non appliquee par rewrite car gate local bloque.
