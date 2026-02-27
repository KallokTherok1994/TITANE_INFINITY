# GitHub Release UI Template — v27.5.1-docs-rz-seal

## Paramètres UI (exacts)
- **Choose a tag:** `v27.5.1-docs-rz-seal`
- **Target:** `MAIN`
- **Release title:** `v27.5.1-docs-rz-seal — R→Z documentation sealing (x3)`
- **Set as latest release:** `No` (docs/governance only)
- **Pre-release:** `No`

---

## Notes (FR) — copier-coller

```markdown
## Résumé
Scellement du programme MAX R→Z avec exécution séquentielle x3, preuves consolidées et verdict gouverné.

## Résultat
- Séquence: `R → S → Y → T → V → U → W → Z → X`
- Validation: `x3` sur toutes les phases
- Verdict programme: `PASS_QUALIFIED_WITH_RESERVE`

## Détail phase par phase
- R: `PASS_X3`
- S: `PASS_X3`
- Y: `PASS_X3`
- T: `PASS_X3`
- V: `PASS_X3`
- U: `PASS_X3_WITH_RESERVE`
- W: `PASS_X3`
- Z: `PASS_X3`
- X: `PASS_X3`

## Réserve
La phase U conserve une réserve explicite: ajouter un gate exécutable dédié pour valider bout-en-bout la chaîne `updater/signature/rollback`.

## Preuves
- `docs/_evidence/program_max_rz_20260227_171858/09_FINAL_VERDICT.md`
- `docs/_evidence/program_max_rz_20260227_171858/05_TEST_RUNS_X3_MASTER.md`
- `docs/_evidence/pR_20260227_171858/06_PROOF_LOGS.txt` → `docs/_evidence/pX_20260227_171858/06_PROOF_LOGS.txt`

## Références
- Tag: `v27.5.1-docs-rz-seal`
- Commit changelog: `4d2c4dc0b`
```

---

## Notes (EN) — copy/paste

```markdown
## Summary
Sealing of the MAX R→Z program with sequential x3 execution, consolidated evidence, and a governed verdict.

## Result
- Sequence: `R → S → Y → T → V → U → W → Z → X`
- Validation: `x3` across all phases
- Program verdict: `PASS_QUALIFIED_WITH_RESERVE`

## Per-phase status
- R: `PASS_X3`
- S: `PASS_X3`
- Y: `PASS_X3`
- T: `PASS_X3`
- V: `PASS_X3`
- U: `PASS_X3_WITH_RESERVE`
- W: `PASS_X3`
- Z: `PASS_X3`
- X: `PASS_X3`

## Reserve
Phase U keeps an explicit reserve: add a dedicated executable gate to validate the full `updater/signature/rollback` chain end-to-end.

## Evidence
- `docs/_evidence/program_max_rz_20260227_171858/09_FINAL_VERDICT.md`
- `docs/_evidence/program_max_rz_20260227_171858/05_TEST_RUNS_X3_MASTER.md`
- `docs/_evidence/pR_20260227_171858/06_PROOF_LOGS.txt` through `docs/_evidence/pX_20260227_171858/06_PROOF_LOGS.txt`

## References
- Tag: `v27.5.1-docs-rz-seal`
- Changelog commit: `4d2c4dc0b`
```
