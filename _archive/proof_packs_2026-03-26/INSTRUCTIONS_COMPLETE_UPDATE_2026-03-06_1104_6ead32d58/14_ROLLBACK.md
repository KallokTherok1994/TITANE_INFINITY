# 14_ROLLBACK

## Rollback fichier par fichier

- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/00_EXEC_SUMMARY.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/01_BOOTSTRAP.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/01_BOOTSTRAP_RAW.log`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/02_CURRENT_STATE.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/03_DELTA_INVENTORY.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/04_DRIFT_CHECK.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/05_DUPLICATION_CHECK.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/06_CONTRADICTIONS_CHECK.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/07_INDEX_HEALTH.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/08_UPDATE_ACTIONS.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/09_AUTOFIX_AUTOHEAL_CAPTURE.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/10_COMMANDS_USED.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/11_TESTS_AND_VALIDATORS.log`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/12_GATES_REPORT.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/13_DIFF_FILES.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/14_ROLLBACK.md`
- `rm -f proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58/15_VERDICT.md`

## Rollback groupe

- `rm -rf proof_packs/INSTRUCTIONS_COMPLETE_UPDATE_2026-03-06_1104_6ead32d58`

## Ordre de rollback le plus sur

1. Supprimer les logs (`01_BOOTSTRAP_RAW.log`, `11_TESTS_AND_VALIDATORS.log`).
2. Supprimer les rapports analytiques (`00`, `02`..`13`, `15`).
3. Supprimer `14_ROLLBACK.md` ou supprimer le dossier complet.

## Revert stale index updates

- Aucun index modifie dans ce cycle.
- Si necessaire sur un cycle futur: `git restore -- .github/prompts .github/agents .github/copilot-agents.md`

## Revert doctrinal spread

- Aucun spread doctrinal introduit.
- Si necessaire sur un cycle futur: `git restore -- .github/copilot-instructions.md .github/instructions`

## AutoHeal append-only correction

- Aucune entree AutoHeal ajoutee ici.
- Regle generale: si correction AutoHeal requise, faire une entree de rectification forward-fix; ne pas supprimer une entree append-only historique.
