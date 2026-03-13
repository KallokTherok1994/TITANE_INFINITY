# 12 - Commands Used

## Authority and Baseline
- `git rev-parse --short HEAD`
- `git rev-parse --verify origin/MAIN`
- `git status --porcelain=v1`

## Evidence Consolidation
- Read V60 rerun artifacts:
  - `raw/13_runtime_proof_rerun.exit`
  - `raw/phase6_artifacts_rerun/v60_runtime_proof.json`
  - `raw/23_autoheal_detect_recurrence_rerun.exit`
  - `raw/24_verify_instructions_rerun.exit`
  - `raw/25_verify_registry_rerun.exit`
  - `VERDICT_RERUN.md`
  - `VERDICT.md`

## Normalization and Governance
- `grep -n "Append-Only Supersession Notice" proof_packs/V60_IPC_ENTRY_CAPTURE_REAL_UI_STRONG_CLOSURE_20260313_015700_8ed1ef72c64abd90/VERDICT.md`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm run verify:registry`

## Notes
No additional technical rerun was executed in V61 (`optional confidence rerun gate = NO_OP`).
