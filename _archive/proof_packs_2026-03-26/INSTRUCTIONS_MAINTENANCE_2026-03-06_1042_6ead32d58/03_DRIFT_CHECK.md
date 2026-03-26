# 03_DRIFT_CHECK

## Verifications obligatoires

- kernel still compact / not re-expanded: PASS (`verify_kernel_budget`: 75 lignes, 12 regles).
- scoped files remain scoped: PASS (`verify_instruction_layers`).
- no global doctrine copied into local files unnecessarily: PASS (`verify_no_doctrine_duplication`).
- local AGENTS remain local and non-duplicative: PASS (presence + checks de couche).
- prompt files remain workflow-specific: PASS (`verify_prompt_files_index`).
- validators remain authoritative: PASS (suite complete executee, `TOTAL_FAILS=0`).
- mapping / mermaid / proofs remain refreshable: PASS (`map_refresh.sh` execute sans erreur).
- no forbidden spread of production doctrine into local maintenance files: PASS (`verify_no_doctrine_duplication` + `verify_instruction_layers`).

## Classification des drifts

- textual drift: aucun drift bloquant detecte.
- doctrinal drift: aucun drift detecte.
- structural drift: aucun drift detecte.
- validator drift: aucun drift detecte.
- index drift: aucun drift detecte.
