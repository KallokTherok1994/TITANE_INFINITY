# 11_UNBLOCK_EXECUTION_RUNBOOK.md

Date (UTC): 2026-02-26

## Objet
- Procédure opérationnelle exacte pour lever le blocage P6 et reprendre P7→P13 sans dérive.

## Précondition obligatoire
- Token exact présent dans l’environnement shell courant:
  - `GO_FOR_PROD_BUILD__TITANE_INFINITY`

## Vérification précondition
```bash
printenv GO_FOR_PROD_BUILD__TITANE_INFINITY
```

## Séquence d’exécution (ordre immuable)
1. Revalider invariants gouvernés:
```bash
pnpm run verify:invariants-governed
```
2. Exécuter protocole P6 build/hash (x3) et compléter:
   - `docs/_evidence/p6_20260226_144448/04_GATES_STATUS.md`
   - `docs/_evidence/p6_20260226_144448/05_TEST_RUNS_X3.md`
   - `docs/_evidence/p6_20260226_144448/06_PROOF_LOGS.txt`
   - `docs/_evidence/p6_20260226_144448/08_VERDICT.md`
3. Si P6 passe, ouvrir P7 puis dérouler séquentiellement P8→P13 (x3 chaque phase).
4. Mettre à jour le maître après chaque phase:
   - `03_PHASE_MAP.md`
   - `04_GATES_MASTER_STATUS.md`
   - `05_TEST_RUNS_X3_MASTER.md`
   - `09_FINAL_VERDICT.md`

## Stop-the-line
- Si un gate requis échoue dans une phase, arrêter la séquence et marquer la phase en **BLOCKED** avec preuve brute.

## Rollback sûr
```bash
git restore -- docs/_evidence/program_p6_13_20260226_144448 docs/_evidence/p6_20260226_144448 docs/_evidence/p7_20260226_144448 docs/_evidence/p8_20260226_144448 docs/_evidence/p9_20260226_144448 docs/_evidence/p10_20260226_144448 docs/_evidence/p11_20260226_144448 docs/_evidence/p12_20260226_144448 docs/_evidence/p13_20260226_144448
```

## Métadonnées de changement
- Ring impacté: **Governance/Repo hygiene**
- Statut: **QUALIFIED**
