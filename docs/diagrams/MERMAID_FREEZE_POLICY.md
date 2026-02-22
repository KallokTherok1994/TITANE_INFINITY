# Mermaid Freeze Policy

Mermaid system is considered feature-complete as of V9.

## Rules

- Aucun nouveau guard sans justification exceptionnelle.
- Aucun nouveau workflow sans validation strategique.

## Modifications autorisees

- Correction de bug
- Evolution architecture reelle
- Mise a jour surface reseau

Toute evolution exige une Change Request.

## Why freeze?

La stabilite et la lisibilite priment sur la sophistication.

## Regression Sentinel

Avant toute release majeure de TITANE∞ :

- `pnpm run op:mermaid`
- `bash scripts/verify/mermaid-proof-pack.sh`

Archiver le proof pack.

## Governance Boundary (V13)

Mermaid ne couvre que :

- Architecture 4-Ring
- Surface réseau online-first
- Pipeline certification
- Data flow critique

Mermaid ne couvre pas :

- UX
- Feature roadmap
- Performance tuning
- Optimisation interne engines
- Documentation marketing
