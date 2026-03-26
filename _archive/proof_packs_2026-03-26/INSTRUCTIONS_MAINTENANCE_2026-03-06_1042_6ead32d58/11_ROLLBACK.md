# 11_ROLLBACK

## Rollback fichier par fichier

- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/00_EXEC_SUMMARY.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/01_BOOTSTRAP.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/01_BOOTSTRAP_RAW.log`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/02_DELTA_INVENTORY.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/03_DRIFT_CHECK.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/04_DUPLICATION_CHECK.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/05_INDEX_HEALTH.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/06_AUTOFIX_AUTOHEAL_CAPTURE.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/07_COMMANDS_USED.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/08_TESTS_AND_VALIDATORS.log`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/09_GATES_REPORT.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/10_DIFF_FILES.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/11_ROLLBACK.md`
- `rm -f proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/12_VERDICT.md`

## Rollback groupe

- `rm -rf proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58`

## Ordre le plus sur

1. Supprimer d'abord les logs (`01_BOOTSTRAP_RAW.log`, `08_TESTS_AND_VALIDATORS.log`).
2. Supprimer les rapports (`00`, `01`, `02`, `03`, `04`, `05`, `06`, `07`, `09`, `10`, `12`).
3. Supprimer `11_ROLLBACK.md` en dernier, ou supprimer tout le dossier d'un coup.

## Revert stale index updates

- Aucun update d'index applique dans ce cycle.
- Si besoin futur: `git restore -- .github/prompts .github/agents .github/copilot-agents.md`

## Revert accidental doctrinal spread

- Aucun spread doctrinal introduit dans ce cycle.
- Si besoin futur: `git restore -- .github/copilot-instructions.md .github/instructions`

## Revert AutoHeal en append-only

- Aucune entree AutoHeal ajoutee ici.
- Regle generale: ne pas supprimer une entree append-only; corriger via une **nouvelle entree de rectification** documentee.
