# Mermaid Diagrams (DOC + GUARDS)

## Navigation

- Sources canons: `docs/diagrams/sources/*.mmd`
- Rendus générés: `docs/diagrams/rendered/*.md`
- Index canon: `docs/diagrams/CANON_INDEX.md`
- Standards: `docs/standards/MERMAID_STANDARDS.md`
- Baseline lock: `docs/diagrams/MERMAID_BASELINE_LOCK.json`
- Status report: `docs/diagrams/MERMAID_STATUS.md`

## Commandes

- Générer les rendus: `pnpm run render:docs:mermaid`
- Vérifier strictement: `pnpm run verify:docs:mermaid`
- Diff intelligence: `pnpm run verify:docs:mermaid:diff`
- Status report (check): `pnpm run verify:docs:mermaid:status`

## Règle opératoire

Ajouter/modifier un diagramme = mettre à jour la source `.mmd`, relancer render sync, puis obtenir `PASS` sur verify.
