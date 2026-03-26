A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (rapport de blocage Phase A)
C) RISK: P0
D) PLAN: 1) acter blocage A1 2) borner confiance 3) interdire B1/B2 4) proposer next action.
E) PROOFS: obtenues = 01 + 02 + 03.
F) ROLLBACK: suppression du pack précheck.

# 04 BLOCK REPORT

## Pourquoi c’est bloqué

- A1 échoue: `DIVERGED_FROM_MAIN` + worktree dirty non borné docs.
- Hard rule activée: aucune fusion canonique sur vérité locale non sûre.

## Ce qui est fiable

- Autorité Git distante: `origin/MAIN` (`PROVEN_BY_REPO`).
- Autorité version repo: `package.json` + `CHANGELOG.md` (`PROVEN_BY_REPO`).
- Présence des surfaces canoniques docs (`LOCALLY_VERIFIED`).

## Ce qui ne peut pas être mis à jour maintenant

- `README.md` rewrite
- `docs/README.md` rewrite
- toute exécution B1/B2

## Statut V28

- `V28_UNPROVEN` avec `BLOCKED_VERSION_DRIFT`.

## Action suivante (unique)

- Préserver puis réaligner le workspace sur `origin/MAIN`, puis relancer la mission pour autoriser une exécution docs contrôlée.
