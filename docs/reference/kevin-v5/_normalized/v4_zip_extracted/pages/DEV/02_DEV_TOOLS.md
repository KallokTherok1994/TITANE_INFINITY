# DEV — Dev Tools

## But
Orchestrer des opérations de maintenance/dev (patch, refactor, rewrite, audit, test, rollback) depuis un cockpit.

## UI observée
- Barre d’icônes : Patch / Refactor / Rewrite / Audit / Test / Rollback
- Panneau “Patch Operation”
  - description
  - bouton “Exécuter Patch”

## Contrats attendus
- Mode “dry-run” par défaut
- Affichage des changements (diff) avant application
- Journalisation locale obligatoire (registry append-only)

## Risques
- Actions destructives sans confirmation.
- Manque de verrouillage (concurrency) si plusieurs ops simultanées.

## Recommandations
- 2 étapes : “Préparer” → “Appliquer”
- Confirmation “taper APPLY”
- Rollback auto généré (patch inverse).

