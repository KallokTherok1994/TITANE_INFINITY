# 2026-04-18 — Instructions Drift Prompts

- Scope: prompts repo d audit/réparation des instructions, documentation setup Copilot.
- Change: `.github/prompts/audit-instructions.prompt.md` et `.github/prompts/fix-instructions-drift.prompt.md` référencent maintenant la suite de validateurs réellement utilisée par le repo, et `docs/COPILOT_SETUP.md` annonce explicitement la pile canonique active ainsi que la fin des token gates de build.
- Proof:
  - `bash scripts/verify_instructions.sh` PASS
  - `bash scripts/verify/verify_instruction_layers.sh` PASS
  - `bash scripts/verify/verify_no_doctrine_duplication.sh` PASS
  - `bash scripts/verify/verify_status_vocabulary.sh` PASS
  - `bash scripts/verify/verify_agents_index.sh` PASS
  - `bash scripts/verify/verify_prompt_files_index.sh` PASS
  - `bash scripts/verify/verify_local_markers_consistency.sh` PASS
  - `bash scripts/verify/verify_kernel_budget.sh` PASS
  - `bash scripts/autoheal/detect_recurrence.sh` PASS
- Verdict: PASS