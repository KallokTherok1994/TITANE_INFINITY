# 00_PLAN.md

Phase: P10 Memory v2
Date (UTC): 2026-02-26
Statut: READY

## Objectif
- Contrôle mémoire utilisateur (pin/forget/inspect), provenance stricte, retention/purge, séparation stricte des résultats provider.

## Rings impactés
- Ring 3 (memory services), Ring 4 (UI controls).

## Gates cibles
- `G10_MEMORY_PROVENANCE_ALWAYS`
- `G10_PIN_FORGET_AUDITED`
- `G10_RETENTION_POLICY_APPLIED`
- `G10_NO_PROVIDER_RESULTS_IN_USER_MEMORY`

## Rollback prévu
- Désactivation controls via flags; schéma mémoire lisible maintenu.