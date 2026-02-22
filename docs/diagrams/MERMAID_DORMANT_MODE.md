# Mermaid Dormant Mode

## 1. State

Mermaid System Status: **DORMANT (since V11)**

## 2. What Dormant Means

- Aucun changement attendu
- Aucun refactor
- Aucun ajout de diagramme
- Aucun ajustement esthetique
- Aucun nouveau guard

## 3. Allowed Changes

Seulement si :

- Surface reseau change
- Architecture 4-ring change
- Provider/API change
- Bug demontre

## 4. Mandatory Reactivation Procedure

Avant toute modification :

- `pnpm run op:mermaid`
- `bash scripts/verify/mermaid-proof-pack.sh`

Creer `CHANGE_REQUEST.md`.
Passer par tous les guards.
