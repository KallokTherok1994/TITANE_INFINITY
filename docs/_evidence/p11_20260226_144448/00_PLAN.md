# 00_PLAN.md

Phase: P11 Tools/Engines Lane
Date (UTC): 2026-02-26
Statut: READY

## Objectif
- Extensibilité outillée en contrat strict + permissions default-deny, uniquement read-only safe.

## Rings impactés
- Ring 2/3 (tool contract/policy), Ring 4 (tool invocation UX).

## Gates cibles
- `G11_TOOL_CONTRACT_ENFORCED`
- `G11_TOOL_TRACE_REQUIRED`
- `G11_TOOL_NO_REAL_WRITES`
- `G11_TOOL_BUDGETED`
- `G11_TOOL_PERMISSIONS_DEFAULT_DENY`

## Rollback prévu
- Désactivation registry tools par flag; retrait en append-only.