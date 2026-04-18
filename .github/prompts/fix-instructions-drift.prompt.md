# Prompt: Fix Instructions Drift

## Scope

Apply minimal patches to remove instruction drift.

## Inputs

- Contradiction list
- Duplication list
- Layer priority policy

## Steps

1. Keep kernel as single canonical doctrine source.
2. Remove repeated global doctrine from path-specific files.
3. Move workflow-heavy blocks into prompt files.
4. Add/adjust validators for binary rules.
5. Re-run all instruction verifiers:

```bash
bash scripts/verify_instructions.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify_no_doctrine_duplication.sh
bash scripts/verify/verify_status_vocabulary.sh
bash scripts/verify/verify_agents_index.sh
bash scripts/verify/verify_prompt_files_index.sh
bash scripts/verify/verify_local_markers_consistency.sh
bash scripts/verify/verify_kernel_budget.sh
bash scripts/verify/scorecard-instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

6. Confirm scorecard reaches 100/100.

If scorecard stays below 100 while all mandatory validators pass, report the remaining drift honestly instead of claiming PASS by score alone.

## Output

- Minimal diff summary.
- Validation command outputs (all PASS).
- Non-destructive rollback.
