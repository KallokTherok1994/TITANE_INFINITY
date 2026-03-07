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
5. Re-run instruction verifiers.

## Output

- Minimal diff summary.
- Validation command outputs.
- Non-destructive rollback.
