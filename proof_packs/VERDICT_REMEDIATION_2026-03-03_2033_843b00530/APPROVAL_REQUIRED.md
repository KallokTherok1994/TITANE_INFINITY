# APPROVAL REQUIRED (NON-CODE GATE)

## Statut

- `action_required` est traité comme `BLOCKED_APPROVAL`.

## Où agir

1. Ouvrir la Pull Request dans GitHub.
2. Ouvrir l'onglet `Checks` et les règles de protection (si affichées).
3. Fournir l'approbation/review demandée (security gate / required approval).
4. Relancer le workflow bloqué si nécessaire.

## Condition exacte attendue

- Le workflow passe de `action_required` à exécutable/complété après approbation requise.

## Pourquoi non corrigeable par code

- Le blocage dépend d'une politique GitHub externe au dépôt local (approbation humaine / sécurité).
