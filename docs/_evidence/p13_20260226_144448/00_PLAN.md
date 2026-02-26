# 00_PLAN.md

Phase: P13 Cross-platform & Packaging
Date (UTC): 2026-02-26
Statut: READY

## Objectif
- Qualifier builds/smokes Windows/macOS/Linux avec matrice CI et vérification paths DB/perms.

## Rings impactés
- CI/workflows + Ring 4 runtime startup paths.

## Gates cibles
- `G13_CI_MATRIX_BUILDS`
- `G13_SMOKE_TESTS_PASS`
- `G13_PATHS_OK_PER_OS`

## Rollback prévu
- Revert workflow matrix/smoke; conserver exécution locale actuelle.