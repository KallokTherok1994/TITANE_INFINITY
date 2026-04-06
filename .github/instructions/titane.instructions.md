---
# TITANE_INFINITY - Surface Instruction (Scoped)
# Applies to: src/, src-tauri/, tests/, scripts/
---

## Invariants rappeles

- Ring impacte: cross-ring operational surface (`src/`, `src-tauri/`, `tests/`, `scripts/`).
- Online-first governed policy with mandatory local fallback remains active.
- Local-first wording is compatibility marker only; no local-first-only behavior.
- Keep this file local: do not restate global kernel doctrine.

## DO

- Use PATH_SIMPLE for local low-risk tasks:
  - targeted discovery
  - local rules only
  - targeted proofs only
- Use PATH_HEAVY for architecture/runtime/IPC/E2E/release tasks:
  - full bootstrap
  - layer conflict checks
  - broader validators
  - proof-pack discipline
- Keep fixes minimal and reversible.
- Route binary, repeated rules toward validator scripts.

## DONT

- Do not duplicate global status doctrine from kernel.
- Do not duplicate PROD token doctrine in lower layers.
- Do not keep workflow-heavy runbooks in always-on instruction files.
- Do not claim completion without validator output.

## Preuves attendues

- Command list and check outputs with exit codes.
- Relevant validator output for touched scope.
- Explicit rollback commands.

## Gates specifiques

- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
- For instruction architecture changes also run:
  - `bash scripts/verify/verify_instruction_layers.sh`
  - `bash scripts/verify/verify_no_doctrine_duplication.sh`
  - `bash scripts/verify/verify_status_vocabulary.sh`
  - `bash scripts/verify/verify_agents_index.sh`
  - `bash scripts/verify/verify_prompt_files_index.sh`
  - `bash scripts/verify/verify_local_markers_consistency.sh`
  - `bash scripts/verify/verify_kernel_budget.sh`

## Rollback

- `git restore -- .github/copilot-instructions.md .github/instructions/titane.instructions.md`
- `git restore -- .github/prompts .github/agents src/AGENTS.md src-tauri/AGENTS.md e2e/AGENTS.md docs/AGENTS.md scripts/AGENTS.md`
- `git restore -- scripts/verify governance`
