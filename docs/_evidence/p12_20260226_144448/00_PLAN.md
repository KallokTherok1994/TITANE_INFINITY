# 00_PLAN.md

Phase: P12 Observability/Ops
Date (UTC): 2026-02-26
Statut: READY

## Objectif
- Diagnostic local robuste sans fuite: dashboard réel, support pack redacted, vue incidents cohérente.

## Rings impactés
- Ring 3 (metrics/failures), Ring 4 (dashboard/export UX).

## Gates cibles
- `G12_DASHBOARD_REAL_DATA`
- `G12_SUPPORT_PACK_NO_SECRETS`
- `G12_FAILURES_VIEW_CONSISTENT`

## Rollback prévu
- Masquer dashboard/export; conserver tables et contrats.