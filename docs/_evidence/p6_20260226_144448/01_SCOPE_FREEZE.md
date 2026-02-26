# 01_SCOPE_FREEZE.md

Phase: P6
Statut: STABLE

## Périmètre autorisé
- `docs/_evidence/p6_20260226_144448/**`
- Vérifications non destructives (`git status`, `pnpm run verify:invariants-governed`)

## Interdits
- Aucun build/deploy PROD sans tokens exacts.
- Aucun changement runtime applicatif en P6.