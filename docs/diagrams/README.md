# Mermaid Diagrams (DOC + GUARDS)

## Navigation

- Sources canons: `docs/diagrams/sources/*.mmd`
- Rendus générés: `docs/diagrams/rendered/*.md`
- Index canon: `docs/diagrams/CANON_INDEX.md`
- Standards: `docs/standards/MERMAID_STANDARDS.md`

## Commandes

- Générer les rendus: `pnpm run render:docs:mermaid`
- Vérifier strictement: `pnpm run verify:docs:mermaid`

## Règle opératoire

Ajouter/modifier un diagramme = mettre à jour la source `.mmd`, relancer render sync, puis obtenir `PASS` sur verify.
