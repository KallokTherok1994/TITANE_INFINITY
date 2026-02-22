# MERMAID Standards (DOC-ONLY)

Phase: MERMAID_DOC_GUARDS_V1  
Ring: Doc + Tooling  
Statut: STABLE (DOC-ONLY)

## Objet

Mermaid est une carte documentaire, pas le territoire runtime. Les diagrammes décrivent les invariants et flux validés sans introduire de dépendance d'exécution.

## Règles canoniques

1. Un diagramme = une intention.
2. Source of Truth = `docs/diagrams/sources/*.mmd`.
3. Rendus = `docs/diagrams/rendered/*.md` générés par script.
4. Complexité maximale par diagramme: ≤ 30 nœuds/liaisons heuristiques.
5. Nommage stable: pas de synonymes multiples pour un même concept.
6. Éviter les éléments décoratifs inutiles (ex: cloud non nécessaire).

## Online-First Network Truth

- Tout élément réseau doit être taggé explicitement: `INTERNAL` ou `EXTERNAL`.
- Mentionner le contexte Auth/Token quand applicable (niveau doc).
- Mentionner Timeouts/Retry/Fallback (niveau doc) sur les surfaces réseau.
- Aucun endpoint non gouverné dans les diagrammes canons.

## Interdits

- CDN Mermaid ou dépendance externe d'exécution.
- Fetch externe pour rendre les diagrammes.
- Liens d'exécution ou mode in-app Mermaid.
- `startOnLoad` en rendu applicatif: antipattern (non utilisé ici).

## Styles recommandés

- `flowchart TD`
- `sequenceDiagram`
- `stateDiagram-v2`

## Gouvernance

- Mode strict: DOC + Tooling uniquement.
- Toute divergence déclenche `FAIL` via `verify:docs:mermaid`.
