# DEV — Vue d’ensemble

## But
Donner une lecture immédiate de l’état du système (santé, QA, orchestrations, alertes) + conscience système.

## Composition UI
### KPI Row (cards)
- Santé globale (%)
- Singularity / One Core (statut)
- QA score (%)
- Orchestration (local)
- Engines actifs (compteur)
- Alertes (compteur)

### Bloc “Conscience Système”
- Niveau (ex. 3)
- Cohérence (ex. 94.0%)
- Mode (ex. normal)

## Interactions
- Hover : tooltip sur métriques.
- Click : deep-link vers la page source (QA, Security, Orchestration…).

## Risques / améliorations
- Les KPI doivent être “null-safe” (sinon UNKNOWN/NaN).
- Ajouter “Dernière mise à jour” + action “Rafraîchir”.

