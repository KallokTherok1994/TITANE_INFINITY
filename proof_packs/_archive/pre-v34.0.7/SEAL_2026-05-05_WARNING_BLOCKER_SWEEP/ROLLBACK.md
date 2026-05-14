# ROLLBACK — SEAL_2026-05-05_WARNING_BLOCKER_SWEEP

## Objectif

Revenir en arrière sur le scellement documentaire/proof sans toucher aux corrections code déjà publiées.

## Rollback minimal (proof only)

```bash
git restore --staged reports/SEAL_2026-05-05_WARNING_BLOCKER_SWEEP.md \
  proof_packs/SEAL_2026-05-05_WARNING_BLOCKER_SWEEP/GATE_REPORT.md \
  proof_packs/SEAL_2026-05-05_WARNING_BLOCKER_SWEEP/VERDICT.md \
  proof_packs/SEAL_2026-05-05_WARNING_BLOCKER_SWEEP/ROLLBACK.md

git restore -- reports/SEAL_2026-05-05_WARNING_BLOCKER_SWEEP.md \
  proof_packs/SEAL_2026-05-05_WARNING_BLOCKER_SWEEP/GATE_REPORT.md \
  proof_packs/SEAL_2026-05-05_WARNING_BLOCKER_SWEEP/VERDICT.md \
  proof_packs/SEAL_2026-05-05_WARNING_BLOCKER_SWEEP/ROLLBACK.md
```

## Rollback d un commit de seal déjà publié

```bash
git revert <commit_sha_du_seal>
git push origin MAIN
```

## Note scope

Ne pas inclure `memory/memory_core_state.json` et `memory/stm.json` dans le rollback du seal: ces fichiers runtime sont hors-scope documentaire.