# 00_PLAN.md

Phase: P8 Quality-of-Answer Lane
Date (UTC): 2026-02-26
Statut: READY

## Objectif
- Imposer une politique de sortie FR vérifiable (mode, citations, non-prouvé, self-check).

## Rings impactés
- Ring 2/3 (policy engine), Ring 4 (render final).

## Gates cibles
- `G8_OUTPUT_POLICY_ENFORCED`
- `G8_CITATIONS_WHEN_SEARCH_USED`
- `G8_EXPLICIT_UNKNOWN_WHEN_UNPROVEN`
- `G8_SELF_CHECK_PRESENT`

## Rollback prévu
- Gate policy derrière flag; retour au formatter antérieur truthful.