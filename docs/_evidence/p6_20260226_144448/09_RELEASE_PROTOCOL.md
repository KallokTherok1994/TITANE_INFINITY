# 09_RELEASE_PROTOCOL.md

Phase: P6
Statut: STABLE

## Protocole R1→R6
1. **R1 Repo clean**: `git status --short` doit être vide.
2. **R2 Gates de base**: `pnpm run verify:invariants-governed` en x3.
3. **R3 Token gate PROD**: exiger `GO_FOR_PROD_BUILD__TITANE_INFINITY` exact.
4. **R4 Build autorisé**: lancer build uniquement si token présent.
5. **R5 Hash artifacts**: calcul SHA-256 + tailles, alignement manifest.
6. **R6 Registry append-only**: mise à jour preuves sans réécriture historique.

## Stop-the-line
- Absence token à R3 = BLOCKED immédiat.