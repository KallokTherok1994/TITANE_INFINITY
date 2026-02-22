# MERMAID Standards (DOC-ONLY)

Phase: MERMAID_V1_DOC_GUARDS  
Ring: Doc + Tooling  
Statut: DOC=STABLE ; GUARDS=QUALIFIED

## But

Mermaid est une carte doc, pas le runtime. Les diagrammes décrivent des invariants et flux de référence sans dépendance d'exécution.

## 5 diagrammes canons

1. `architecture_4_ring`
2. `data_flow_chat`
3. `omega_pipeline_v2`
4. `certification_gates`
5. `network_surface_online_first`

## Naming strict + pas de cosmétique

- Un diagramme = une intention.
- Source of truth = `docs/diagrams/sources/*.mmd`.
- Les rendus se font uniquement via script vers `docs/diagrams/rendered/*.md`.
- Pas de variantes synonymes pour un même concept.
- Pas d'éléments décoratifs non nécessaires.

## Network Truth (online-first)

- Toute arête réseau doit expliciter `INTERNAL` ou `EXTERNAL`.
- Auth/Token doivent être mentionnés au niveau doc si applicables.
- Timeout/Retry/Fallback doivent être mentionnés au niveau doc.
- Aucun endpoint non gouverné.

## Limite de complexité

- Maximum `<= 30` liens (heuristique sur `-->`, `---`, `==>`, `..>`, `=>`).
- Au-delà: segmentation du diagramme obligatoire.

## Interdits

- CDN Mermaid.
- URL externes (`http://`, `https://`) dans les blocs Mermaid.
- Endpoints non gouvernés.

## Process

- Ajouter un diagramme = mettre à jour `CANON_INDEX.md` + passer `verify:docs:mermaid`.
