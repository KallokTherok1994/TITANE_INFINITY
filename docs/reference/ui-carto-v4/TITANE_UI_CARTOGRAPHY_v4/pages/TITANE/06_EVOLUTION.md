# TITANE — Évolution

## Statut
- Pill **Évolution** visible.
- Aucune capture du contenu.

## Rôle produit (cible)
Centre de pilotage des améliorations contrôlées :
- roadmap et cycles (Ω),
- propositions de changements (patches),
- audits / preuves / scellement,
- journalisation dans l’INDEX ULTIME.

## UI attendue
- Liste de “cycles” avec statut (draft/running/pass/fail).
- “Proposals” : diff, rationale, risques, rollback.
- GATES : checklists bloquantes, logs, artefacts.

## Risques / warnings
- Mode “auto” qui modifie sans trace → interdit par constitution.
- Absence de rollback → instabilité.

## Tests
- Simulation d’un cycle FAIL : UI doit afficher cause et next steps.

## Risques
- Trop de pouvoir sans garde‑fous → dérive.
- Absence de trace → impossible de diagnostiquer.

## Tests
- Création d’un cycle : génération fichiers registry, rollback.
- Gate bloquant : si fail, UI doit afficher les preuves manquantes.
