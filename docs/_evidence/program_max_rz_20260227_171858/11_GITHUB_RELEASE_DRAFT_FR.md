# GitHub Release Draft (FR)

## Titre
`v27.5.1-docs-rz-seal` — Scellement documentaire R→Z (x3)

## Type
Documentation / Gouvernance (aucun changement runtime)

## Résumé
Cette release scelle le programme MAX R→Z avec exécution séquentielle en x3, preuves consolidées et verdict final gouverné.

## Points clés
- Séquence exécutée: `R → S → Y → T → V → U → W → Z → X`
- Validation: `x3` sur toutes les phases
- Verdict programme: `PASS_QUALIFIED_WITH_RESERVE`
- Réserve explicite: phase `U` (`PASS_X3_WITH_RESERVE`)

## Détail du verdict phase par phase
- R: `PASS_X3`
- S: `PASS_X3`
- Y: `PASS_X3`
- T: `PASS_X3`
- V: `PASS_X3`
- U: `PASS_X3_WITH_RESERVE`
- W: `PASS_X3`
- Z: `PASS_X3`
- X: `PASS_X3`

## Réserve ouverte (U)
Un gate exécutable dédié reste à ajouter pour valider bout-en-bout la chaîne `updater/signature/rollback`.

## Preuves
- Verdict final master: `docs/_evidence/program_max_rz_20260227_171858/09_FINAL_VERDICT.md`
- Gates master: `docs/_evidence/program_max_rz_20260227_171858/04_GATES_MASTER_STATUS.md`
- Runs x3 master: `docs/_evidence/program_max_rz_20260227_171858/05_TEST_RUNS_X3_MASTER.md`
- Journaux x3 phases: `docs/_evidence/pR_20260227_171858/06_PROOF_LOGS.txt` à `docs/_evidence/pX_20260227_171858/06_PROOF_LOGS.txt`

## Commit de référence
- `4d2c4dc0b` (`docs(changelog): add R→Z x3 sealing entry`)

## Tag
- `v27.5.1-docs-rz-seal`
