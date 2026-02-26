# 00_PLAN.md

Phase: P9 Search v2
Date (UTC): 2026-02-26
Statut: READY

## Objectif
- Search v2 conforme provider: stockage transitoire TTL+purge, headers rate-limit, pas de DB long terme résultats Brave.

## Rings impactés
- Ring 3 (services/search/compliance), Ring 4 (trace disclosure).

## Gates cibles
- `G9_PROVIDER_COMPLIANCE_ENFORCED`
- `G9_RATE_LIMIT_HEADERS_USED`
- `G9_TRANSIENT_CACHE_ONLY`
- `G9_DEDUP_SCORING_TRACEABLE`
- `G9_MULTI_QUERY_BUDGETED`
- `G9_OFFLINE_REUSE_COMPLIANT`

## Rollback prévu
- Désactivation features v2 via flags; retour Search v1 honnête.