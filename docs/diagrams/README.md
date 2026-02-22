# Mermaid Diagrams (DOC + GUARDS)

Phase: MERMAID_DOC_GUARDS_V1  
Ring: Doc + Tooling  
Statut: QUALIFIED (GUARDS)

## Processus d'ajout d'un diagramme

1. Créer ou mettre à jour un fichier `docs/diagrams/sources/<nom>.mmd`.
2. Vérifier que le diagramme respecte `docs/standards/MERMAID_STANDARDS.md`.
3. Exécuter `pnpm run render:docs:mermaid` pour générer le rendu markdown.
4. Exécuter `pnpm run verify:docs:mermaid` jusqu'à PASS reproductible.
5. Mettre à jour `docs/diagrams/CANON_INDEX.md` si nouveau diagramme canon.

## Gates locaux

- Render sync idempotent.
- Aucune source `.mmd` vide.
- Fences Mermaid intègres dans les rendus.
- Contraintes Online-First Network Truth respectées.
- Aucune dérive externe (`CDN`, `https://`) dans les blocs Mermaid.

## Stop-the-line (doc)

- Fichier canon manquant.
- `network_surface_online_first` absent ou incomplet.
- Diagramme dépassant la complexité autorisée.
- Rendu non synchronisé entre `sources/` et `rendered/`.
- Vérification Mermaid en `FAIL`.
